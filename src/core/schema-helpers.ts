/**
 * Zod schema helpers for building form schemas declaratively
 * Framework-FREE — no React imports allowed in this file
 */

import { z } from 'zod';
import { FieldType } from './types';

/**
 * Create a Zod schema for a specific field type
 *
 * @param type - The field type
 * @param options - Schema options
 * @returns Zod schema for the field
 *
 * @example
 * ```typescript
 * const emailSchema = createFieldSchema(FieldType.EMAIL, { required: true });
 * const numberSchema = createFieldSchema(FieldType.NUMBER, { min: 0, max: 100 });
 * ```
 */
export function createFieldSchema(
  type: FieldType,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
  } = {},
): z.ZodTypeAny {
  const { required = false, min, max, minLength, maxLength, pattern, message } = options;

  let schema: z.ZodTypeAny;

  switch (type) {
    case FieldType.EMAIL:
      schema = z.string().email(message ?? 'Invalid email address');
      break;

    case FieldType.NUMBER:
      schema = z.coerce.number();
      if (min !== undefined) schema = (schema as z.ZodNumber).min(min);
      if (max !== undefined) schema = (schema as z.ZodNumber).max(max);
      break;

    case FieldType.CHECKBOX:
    case FieldType.SWITCH:
      schema = z.boolean();
      break;

    case FieldType.DATE:
      schema = z.coerce.date();
      break;

    case FieldType.FILE:
      schema = z.instanceof(File);
      break;

    case FieldType.MULTI_SELECT:
    case FieldType.ARRAY:
      schema = z.array(z.unknown());
      if (min !== undefined) schema = (schema as z.ZodArray<z.ZodUnknown>).min(min);
      if (max !== undefined) schema = (schema as z.ZodArray<z.ZodUnknown>).max(max);
      break;

    case FieldType.TEXT:
    case FieldType.PASSWORD:
    case FieldType.TEXTAREA:
    case FieldType.SELECT:
    case FieldType.RADIO:
    default:
      schema = z.string();
      if (minLength !== undefined) schema = (schema as z.ZodString).min(minLength);
      if (maxLength !== undefined) schema = (schema as z.ZodString).max(maxLength);
      if (pattern) schema = (schema as z.ZodString).regex(pattern, message);
      break;
  }

  // Make optional if not required
  if (!required) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Merge multiple Zod object schemas into one
 *
 * @param schemas - Array of Zod object schemas to merge
 * @returns Combined Zod object schema
 *
 * @example
 * ```typescript
 * const step1Schema = z.object({ name: z.string() });
 * const step2Schema = z.object({ email: z.string().email() });
 * const fullSchema = mergeSchemas([step1Schema, step2Schema]);
 * // { name: string, email: string }
 * ```
 */
export function mergeSchemas<T extends z.ZodRawShape[]>(schemas: {
  [K in keyof T]: z.ZodObject<T[K]>;
}): z.ZodObject<T[number]> {
  if (schemas.length === 0) {
    return z.object({}) as z.ZodObject<T[number]>;
  }

  let merged = schemas[0];
  for (let i = 1; i < schemas.length; i++) {
    merged = merged.merge(schemas[i]) as typeof merged;
  }

  return merged as z.ZodObject<T[number]>;
}
