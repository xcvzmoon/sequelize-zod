import type { Model, ModelStatic } from 'sequelize';
import { z } from 'zod';

import { ColumnBuilder } from '../core/column-builder';

import {
  type RefinementValue,
  buildSchema,
  getDescriptors,
  type SchemaInput,
  selectConditions,
} from './schema-utils';

/** Inferred TypeScript type for select/read shape from a record of ColumnBuilder attributes. Use with z.infer<typeof createSelectSchema(attrs)>. */
export type InferSelectFromAttributes<T extends Record<string, ColumnBuilder>> = {
  [K in keyof T]: T[K] extends ColumnBuilder<infer V> ? V : never;
};

/** Inferred TypeScript type for select/read shape from a Sequelize model. Use with z.infer<typeof createSelectSchema(model)>. */
export type InferSelectFromModel<M> = M extends ModelStatic<Model<infer A, any>> ? A : never;

/**
 * Builds a Zod object schema for data selection (query result shape) from a record of ColumnBuilder attributes.
 * Return type is z.ZodType so you can do: type Row = z.infer<typeof createSelectSchema(attributes)>;
 *
 * @template T - A mapping of attribute names to ColumnBuilder instances.
 * @template R - An optional mapping of attribute names to custom Zod refinements or schema overrides.
 * @param attributes - An object mapping attribute names to ColumnBuilder instances.
 * @param refinements - An optional record of attribute names to Zod type refinements or schema overrides.
 * @returns A Zod schema representing the data selection shape.
 */
export function createSelectSchema<
  T extends Record<string, ColumnBuilder>,
  R extends Partial<Record<keyof T, RefinementValue>> = {},
>(attributes: T, refinements?: R): z.ZodType<InferSelectFromAttributes<T>>;

/**
 * Builds a Zod object schema for data selection (query result shape) from a Sequelize model.
 * Return type is z.ZodType so you can do: type Row = z.infer<typeof createSelectSchema(model)>;
 *
 * @template M - A Sequelize ModelStatic whose rawAttributes will be used to derive the schema.
 * @template R - An optional mapping of attribute names to custom Zod refinements or schema overrides.
 * @param model - The Sequelize model from which to derive attribute schema.
 * @param refinements - An optional record mapping attribute names to Zod type refinements or schema overrides.
 * @returns A Zod schema representing the data selection shape for the provided model.
 */
export function createSelectSchema<
  M extends ModelStatic<any>,
  R extends Partial<Record<keyof M['rawAttributes'], RefinementValue>> = {},
>(model: M, refinements?: R): z.ZodType<InferSelectFromModel<M>>;

/**
 * Builds a Zod object schema for data selection (query result shape) from the provided input,
 * which can be either a record of ColumnBuilder attributes or a Sequelize model.
 */
export function createSelectSchema(
  input: SchemaInput,
  refinements?: Record<string, RefinementValue>,
): z.ZodType<Record<string, unknown>> {
  return buildSchema(getDescriptors(input), selectConditions, refinements) as z.ZodType<
    Record<string, unknown>
  >;
}
