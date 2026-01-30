import { Sequelize, Model, type ModelAttributes, type ModelStatic } from 'sequelize';

import { ColumnBuilder } from '../core/column-builder';

import { defineAttributes } from './define-attributes';

/**
 * Infers the Sequelize Model instance shape from a record of ColumnBuilder attributes.
 * Each attribute key maps to the TypeScript type of that column (e.g. number, string, Date).
 *
 * @template T - A record of attribute names to ColumnBuilder instances.
 */
export type InferModelFromAttributes<T extends Record<string, ColumnBuilder>> = Model<
  { [K in keyof T]: T[K] extends ColumnBuilder<infer V> ? V : never },
  { [K in keyof T]: T[K] extends ColumnBuilder<infer V> ? V : never }
>;

/**
 * Defines a Sequelize model using a record of ColumnBuilder attributes.
 * The same attributes object can be passed to {@link createSelectSchema}, {@link createInsertSchema},
 * or {@link createUpdateSchema} to generate Zod schemas.
 *
 * @template T - A mapping of attribute names to ColumnBuilder instances.
 * @param sequelize - The Sequelize instance to define the model on.
 * @param modelName - The name of the Sequelize model.
 * @param attributes - An object mapping attribute names to ColumnBuilder instances.
 * @returns A Sequelize ModelStatic corresponding to the inferred attributes.
 */
export function defineModel<T extends Record<string, ColumnBuilder>>(
  sequelize: Sequelize,
  modelName: string,
  attributes: T,
): ModelStatic<InferModelFromAttributes<T>> {
  return sequelize.define(
    modelName,
    defineAttributes(attributes) as ModelAttributes<InferModelFromAttributes<T>>,
  ) as ModelStatic<InferModelFromAttributes<T>>;
}
