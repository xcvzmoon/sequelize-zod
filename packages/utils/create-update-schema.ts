import type { Model, ModelStatic } from 'sequelize';
import { z } from 'zod';

import { ColumnBuilder } from '../core/column-builder';

import {
  type RefinementValue,
  buildSchema,
  getDescriptors,
  type SchemaInput,
  updateConditions,
} from './schema-utils';

/** Inferred TypeScript type for update (partial) payload from a record of ColumnBuilder attributes. Use with z.infer<typeof createUpdateSchema(attrs)>. */
export type InferUpdateFromAttributes<T extends Record<string, ColumnBuilder>> = Partial<{
  [K in keyof T]: T[K] extends ColumnBuilder<infer V> ? V : never;
}>;

/** Inferred TypeScript type for update (partial) payload from a Sequelize model. Use with z.infer<typeof createUpdateSchema(model)>. */
export type InferUpdateFromModel<M> =
  M extends ModelStatic<Model<infer A, any>> ? Partial<A> : never;

/**
 * Builds a Zod object schema for validating partial updates.
 * Generated columns are omitted; all fields are optional.
 * Return type is z.ZodType so you can do: type Update = z.infer<typeof createUpdateSchema(attributes)>;
 *
 * @template T - A mapping of attribute names to ColumnBuilder instances.
 * @template R - Optional per-field refinements or schema overrides.
 * @param attributes - Record of ColumnBuilder attributes (e.g. from defineModel).
 * @param refinements - Optional record of attribute names to Zod types or refinement functions.
 * @returns A Zod schema for update payloads (partial).
 */
export function createUpdateSchema<
  T extends Record<string, ColumnBuilder>,
  R extends Partial<Record<keyof T, RefinementValue>> = {},
>(attributes: T, refinements?: R): z.ZodType<InferUpdateFromAttributes<T>>;

/**
 * Builds a Zod object schema for update operations from a Sequelize model.
 * Return type is z.ZodType so you can do: type Update = z.infer<typeof createUpdateSchema(model)>;
 *
 * @template M - A Sequelize ModelStatic.
 * @template R - Optional per-field refinements or schema overrides.
 * @param model - Sequelize model (e.g. from sequelize.define or Model.init).
 * @param refinements - Optional record of attribute names to Zod types or refinement functions.
 * @returns A Zod schema for update payloads (partial).
 */
export function createUpdateSchema<
  M extends ModelStatic<any>,
  R extends Partial<Record<keyof M['rawAttributes'], RefinementValue>> = {},
>(model: M, refinements?: R): z.ZodType<InferUpdateFromModel<M>>;

/**
 * Implementation: builds an update schema from the given input (attributes or model).
 *
 * @param input - Record of ColumnBuilders or a Sequelize Model.
 * @param refinements - Optional per-field refinements.
 * @returns A Zod schema for update payloads (partial).
 */
export function createUpdateSchema(
  input: SchemaInput,
  refinements?: Record<string, RefinementValue>,
): z.ZodType<Record<string, unknown>> {
  return buildSchema(getDescriptors(input), updateConditions, refinements) as z.ZodType<
    Record<string, unknown>
  >;
}
