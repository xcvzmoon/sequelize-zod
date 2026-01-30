import type { ColumnSchemaDescriptor } from '../core/column-builder';
import type { ZodType } from 'zod';
import { z } from 'zod';

/**
 * Converts a ColumnSchemaDescriptor into a corresponding Zod schema type.
 *
 * @param descriptor - The column schema descriptor to convert.
 * @param zodInstance - Optional Zod instance to use (defaults to imported 'z').
 * @returns The appropriate ZodType representing the column's schema constraints.
 */
export function columnDescriptorToZod(
  descriptor: ColumnSchemaDescriptor,
  zodInstance: typeof z = z,
): ZodType {
  const zed = zodInstance;
  switch (descriptor.dataTypeCategory) {
    case 'integer':
      return zed.number().int() as ZodType;
    case 'float':
      return zed.number() as ZodType;
    case 'string':
    case 'text':
      return zed.string() as ZodType;
    case 'boolean':
      return zed.boolean() as ZodType;
    case 'date':
      return zed.date() as ZodType;
    case 'uuid':
      return zed.string().uuid() as ZodType;
    case 'json':
      return zed.union([
        zed.string(),
        zed.number(),
        zed.boolean(),
        zed.null(),
        zed.record(zed.string(), zed.any()),
        zed.array(zed.any()),
      ]) as ZodType;
    case 'enum':
      if (descriptor.enumValues && descriptor.enumValues.length > 0) {
        const literals = descriptor.enumValues.map((value) => zed.literal(value));
        if (literals.length === 1) {
          return literals.length === 1
            ? (literals[0] as ZodType)
            : (zed.union(literals) as ZodType);
        }
        return zed.string() as ZodType;
      }
      return zed.string() as ZodType;
    case 'blob':
      return zed.instanceof(Buffer) as ZodType;
    case 'array':
      return zed.array(zed.any()) as ZodType;
    case 'geometry':
    case 'other':
    default:
      return zed.any();
  }
}
