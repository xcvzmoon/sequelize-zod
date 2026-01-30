import type { ModelAttributeColumnOptions } from 'sequelize';

import { ColumnBuilder } from '../core/column-builder';

type ColumnBuilderRecord = Record<string, ColumnBuilder>;

type ColumnBuilderAttributes<T extends ColumnBuilderRecord> = {
  [K in keyof T]: ModelAttributeColumnOptions;
};

/**
 * Creates a Sequelize attribute definition object from a record of ColumnBuilder instances.
 *
 * @template T - A record of column names to ColumnBuilder instances.
 * @param columns - The columns to convert into attribute definitions.
 * @returns An object with the same keys as `columns`, where each value is a Sequelize ModelAttributeColumnOptions.
 */
export function defineAttributes<T extends ColumnBuilderRecord>(
  columns: T,
): ColumnBuilderAttributes<T> {
  const result: Partial<ColumnBuilderAttributes<T>> = {};
  for (const key of Object.keys(columns) as (keyof T)[]) {
    result[key] = columns[key].build();
  }
  // All keys of T are populated by the loop; cast required for generic inference.
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- loop populates all keys of T
  return result as ColumnBuilderAttributes<T>;
}
