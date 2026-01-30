import type { ColumnSchemaDescriptor, DataTypeCategory } from '../core/column-builder';
import type { ModelAttributeColumnOptions } from 'sequelize';

function getDataTypeKey(type: ModelAttributeColumnOptions['type']) {
  if (typeof type === 'string') return type;
  const dt = type as { key?: string };
  return (dt.key ?? '').toUpperCase();
}

function dataTypeKeyToCategory(key: string): DataTypeCategory {
  switch (key) {
    case 'INTEGER':
    case 'BIGINT':
    case 'TINYINT':
    case 'SMALLINT':
    case 'MEDIUMINT':
      return 'integer';
    case 'FLOAT':
    case 'REAL':
    case 'DOUBLE':
    case 'DECIMAL':
    case 'NUMBER':
      return 'float';
    case 'STRING':
    case 'CHAR':
    case 'CITEXT':
    case 'CIDR':
    case 'INET':
    case 'MACADDR':
      return 'string';
    case 'TEXT':
    case 'TSVECTOR':
      return 'text';
    case 'BOOLEAN':
      return 'boolean';
    case 'DATE':
    case 'DATEONLY':
    case 'TIME':
    case 'NOW':
      return 'date';
    case 'UUID':
    case 'UUIDV1':
    case 'UUIDV4':
      return 'uuid';
    case 'JSON':
    case 'JSONB':
    case 'HSTORE':
      return 'json';
    case 'BLOB':
      return 'blob';
    case 'ENUM':
      return 'enum';
    case 'ARRAY':
      return 'array';
    case 'GEOMETRY':
    case 'GEOGRAPHY':
      return 'geometry';
    case 'RANGE':
    case 'VIRTUAL':
    case 'ABSTRACT':
    default:
      return 'other';
  }
}

/**
 * Converts Sequelize model rawAttributes into a record mapping attribute names to
 * ColumnSchemaDescriptor objects. This is used to normalize model metadata for
 * downstream schema tooling, such as building Zod schemas.
 *
 * @param rawAttributes - The rawAttributes object from a Sequelize model, typically found on Model.rawAttributes.
 * @returns A record where each key corresponds to an attribute name and each value is a ColumnSchemaDescriptor.
 */
export function rawAttributesToDescriptors(
  rawAttributes: Record<string, ModelAttributeColumnOptions>,
): Record<string, ColumnSchemaDescriptor> {
  const result: Record<string, ColumnSchemaDescriptor> = {};
  for (const [name, options] of Object.entries(rawAttributes)) {
    const key = getDataTypeKey(options.type);
    const dataTypeCategory = dataTypeKeyToCategory(key);
    result[name] = {
      dataTypeCategory,
      allowNull: options.allowNull ?? true,
      hasDefault: options.defaultValue !== undefined,
      isGenerated: options.autoIncrementIdentity === true,
      enumValues: dataTypeCategory === 'enum' && options.values ? options.values : undefined,
    };
  }
  return result;
}
