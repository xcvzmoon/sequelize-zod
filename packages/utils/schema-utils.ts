import type { ColumnSchemaDescriptor } from '../core/column-builder';
import type { ModelStatic } from 'sequelize';
import { z } from 'zod';

import { ColumnBuilder } from '../core/column-builder';

import { columnDescriptorToZod } from './column-to-zod';
import { rawAttributesToDescriptors } from './model-to-descriptors';

/**
 * Input accepted by schema builders: either a record of ColumnBuilders (defineModel flow)
 * or a Sequelize ModelStatic (normal `sequelize.define` / `Model.init` flow).
 */
export type SchemaInput = Record<string, ColumnBuilder> | ModelStatic<any>;

function isModelStatic(input: SchemaInput): input is ModelStatic<any> {
  return (
    typeof input === 'function' &&
    'rawAttributes' in input &&
    typeof (input as { rawAttributes: unknown }).rawAttributes === 'object'
  );
}

/**
 * Converts an input, which can be either a record of ColumnBuilder instances
 * or a Sequelize ModelStatic, into a record mapping each attribute to a ColumnSchemaDescriptor.
 */
export function getDescriptors(input: SchemaInput): Record<string, ColumnSchemaDescriptor> {
  if (isModelStatic(input)) {
    return rawAttributesToDescriptors(input.rawAttributes);
  }
  const result: Record<string, ColumnSchemaDescriptor> = {};
  for (const [key, column] of Object.entries(input)) {
    result[key] = column.getSchemaDescriptor();
  }
  return result;
}

/**
 * Per-field override for schema building: a Zod type (replaces the generated one)
 * or a function that receives the generated schema and returns a refined one.
 */
export type RefinementValue = z.ZodType | ((schema: z.ZodType) => z.ZodType);

/**
 * Rules used by {@link buildSchema} to decide which columns to include and how to apply optional/nullable.
 */
export type Conditions = {
  /** If false, the column is omitted from the schema. */
  include: (d: ColumnSchemaDescriptor) => boolean;
  /** If true, the column's Zod type gets `.optional()`. */
  optional: (d: ColumnSchemaDescriptor) => boolean;
  /** If true, the column's Zod type gets `.nullable()`. */
  nullable: (d: ColumnSchemaDescriptor) => boolean;
};

/** Conditions for select schemas: include all columns; optional and nullable when allowNull. */
export const selectConditions: Conditions = {
  include: () => true,
  optional: (d) => d.allowNull,
  nullable: (d) => d.allowNull,
};

/** Conditions for insert schemas: omit generated columns; optional when allowNull or hasDefault. */
export const insertConditions: Conditions = {
  include: (d) => !d.isGenerated,
  optional: (d) => d.allowNull || d.hasDefault,
  nullable: (d) => d.allowNull,
};

/** Conditions for update schemas: omit generated columns; all fields optional. */
export const updateConditions: Conditions = {
  include: (d) => !d.isGenerated,
  optional: () => true,
  nullable: (d) => d.allowNull,
};

/**
 * Builds a Zod object schema from a record of column descriptors, applying the given conditions
 * and optional per-field refinements.
 *
 * @param descriptors - Map of attribute names to column schema descriptors.
 * @param conditions - Rules for include/optional/nullable per column.
 * @param refinements - Optional per-field Zod overrides or refinement functions.
 * @param zodInstance - Zod instance to use (defaults to the imported `z`).
 * @returns A ZodObject schema.
 */
export function buildSchema(
  descriptors: Record<string, ColumnSchemaDescriptor>,
  conditions: Conditions,
  refinements?: Record<string, RefinementValue>,
  zodInstance: typeof z = z,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!conditions.include(descriptor)) continue;
    let schema: z.ZodTypeAny = columnDescriptorToZod(descriptor, zodInstance);
    const refinement = refinements?.[key];
    if (refinement !== undefined) {
      if (typeof refinement === 'function') {
        schema = refinement(schema);
      } else {
        schema = refinement as z.ZodTypeAny;
      }
    } else {
      if (conditions.nullable(descriptor)) schema = schema.nullable();
      if (conditions.optional(descriptor)) schema = schema.optional();
    }
    shape[key] = schema;
  }
  return zodInstance.object(shape);
}
