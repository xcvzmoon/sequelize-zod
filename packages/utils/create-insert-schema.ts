import type { Model, ModelStatic } from 'sequelize';
import { z } from 'zod';

import { ColumnBuilder } from '../core/column-builder';

import {
  type RefinementValue,
  buildSchema,
  getDescriptors,
  insertConditions,
  type SchemaInput,
} from './schema-utils';

/** Inferred TypeScript type for insert payload from a record of ColumnBuilder attributes. Use with z.infer<typeof createInsertSchema(attrs)>. */
export type InferInsertFromAttributes<T extends Record<string, ColumnBuilder>> = {
  [K in keyof T]: T[K] extends ColumnBuilder<infer V> ? V : never;
};

/** Inferred TypeScript type for insert payload from a Sequelize model. Use with z.infer<typeof createInsertSchema(model)>. */
export type InferInsertFromModel<M> = M extends ModelStatic<Model<any, infer C>> ? C : never;

/**
 * Builds a Zod object schema for validating data before insert.
 * Generated (identity) columns are omitted. Fields are optional when allowNull or hasDefault.
 * Return type is z.ZodType so you can do: type Insert = z.infer<typeof createInsertSchema(attributes)>;
 *
 * @template T - A mapping of attribute names to ColumnBuilder instances.
 * @template R - Optional per-field refinements or schema overrides.
 * @param attributes - Record of ColumnBuilder attributes (e.g. from defineModel).
 * @param refinements - Optional record of attribute names to Zod types or refinement functions.
 * @returns A Zod schema for insert payloads.
 */
export function createInsertSchema<
  T extends Record<string, ColumnBuilder>,
  R extends Partial<Record<keyof T, RefinementValue>> = {},
>(attributes: T, refinements?: R): z.ZodType<InferInsertFromAttributes<T>>;

/**
 * Builds a Zod object schema for insert operations from a Sequelize model.
 * Return type is z.ZodType so you can do: type Insert = z.infer<typeof createInsertSchema(model)>;
 *
 * @template M - A Sequelize ModelStatic.
 * @template R - Optional per-field refinements or schema overrides.
 * @param model - Sequelize model (e.g. from sequelize.define or Model.init).
 * @param refinements - Optional record of attribute names to Zod types or refinement functions.
 * @returns A Zod schema for insert payloads.
 */
export function createInsertSchema<
  M extends ModelStatic<any>,
  R extends Partial<Record<keyof M['rawAttributes'], RefinementValue>> = {},
>(model: M, refinements?: R): z.ZodType<InferInsertFromModel<M>>;

/**
 * Implementation: builds an insert schema from the given input (attributes or model).
 *
 * @param input - Record of ColumnBuilders or a Sequelize Model.
 * @param refinements - Optional per-field refinements.
 * @returns A Zod schema for insert payloads.
 */
export function createInsertSchema(
  input: SchemaInput,
  refinements?: Record<string, RefinementValue>,
): z.ZodType<Record<string, unknown>> {
  return buildSchema(getDescriptors(input), insertConditions, refinements) as z.ZodType<
    Record<string, unknown>
  >;
}
