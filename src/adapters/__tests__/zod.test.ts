/**
 * Tests for Zod adapter
 */

import { describe, it, expect } from 'vitest';
import { zodValidator, zodAsyncValidator, isZodAvailable } from '../zod';

// Mock Zod schema for testing
const createMockZodSchema = (shouldSucceed: boolean, errorMessage = 'Validation failed') => ({
  safeParse: (value: unknown) => {
    if (shouldSucceed) {
      return { success: true as const, data: value };
    }
    return {
      success: false as const,
      error: {
        issues: [{ message: errorMessage }],
      },
    };
  },
  safeParseAsync: async (value: unknown) => {
    if (shouldSucceed) {
      return { success: true as const, data: value };
    }
    return {
      success: false as const,
      error: {
        issues: [{ message: errorMessage }],
      },
    };
  },
  _def: { typeName: 'ZodString' },
});

describe('Zod Adapter', () => {
  describe('zodValidator', () => {
    it('returns null for valid value', () => {
      const schema = createMockZodSchema(true);
      const validator = zodValidator(schema);
      const result = validator('valid value');
      expect(result).toBe(null);
    });

    it('returns error message for invalid value', () => {
      const schema = createMockZodSchema(false, 'Invalid email format');
      const validator = zodValidator(schema);
      const result = validator('invalid');
      expect(result).toBe('Invalid email format');
    });

    it('uses custom error message when provided', () => {
      const schema = createMockZodSchema(false, 'Zod error');
      const validator = zodValidator(schema, 'Custom error message');
      const result = validator('invalid');
      expect(result).toBe('Custom error message');
    });

    it('returns default message when no issues in error', () => {
      const schema = {
        safeParse: () => ({
          success: false as const,
          error: { issues: [] },
        }),
        safeParseAsync: async () => ({
          success: false as const,
          error: { issues: [] },
        }),
        _def: { typeName: 'ZodString' },
      };
      const validator = zodValidator(schema);
      const result = validator('value');
      expect(result).toBe('Validation failed');
    });

    it('throws error for invalid schema', () => {
      expect(() => {
        zodValidator({});
      }).toThrow('Invalid Zod schema provided');
    });

    it('throws error when schema is null', () => {
      expect(() => {
        zodValidator(null);
      }).toThrow('Invalid Zod schema provided');
    });

    it('throws error when schema is undefined', () => {
      expect(() => {
        zodValidator(undefined);
      }).toThrow('Invalid Zod schema provided');
    });

    it('validates different value types', () => {
      const schema = createMockZodSchema(true);
      const validator = zodValidator(schema);

      expect(validator('string')).toBe(null);
      expect(validator(123)).toBe(null);
      expect(validator(true)).toBe(null);
      expect(validator(null)).toBe(null);
      expect(validator(['array'])).toBe(null);
    });
  });

  describe('zodAsyncValidator', () => {
    it('returns null for valid value', async () => {
      const schema = createMockZodSchema(true);
      const validator = zodAsyncValidator(schema);
      const result = await validator('valid value');
      expect(result).toBe(null);
    });

    it('returns error message for invalid value', async () => {
      const schema = createMockZodSchema(false, 'Async validation error');
      const validator = zodAsyncValidator(schema);
      const result = await validator('invalid');
      expect(result).toBe('Async validation error');
    });

    it('uses custom error message when provided', async () => {
      const schema = createMockZodSchema(false, 'Zod async error');
      const validator = zodAsyncValidator(schema, 'Custom async error');
      const result = await validator('invalid');
      expect(result).toBe('Custom async error');
    });

    it('returns default message when no issues in error', async () => {
      const schema = {
        safeParse: () => ({
          success: false as const,
          error: { issues: [] },
        }),
        safeParseAsync: async () => ({
          success: false as const,
          error: { issues: [] },
        }),
        _def: { typeName: 'ZodString' },
      };
      const validator = zodAsyncValidator(schema);
      const result = await validator('value');
      expect(result).toBe('Validation failed');
    });

    it('throws error for invalid schema', () => {
      expect(() => {
        zodAsyncValidator({});
      }).toThrow('Invalid Zod schema provided');
    });

    it('validates different value types asynchronously', async () => {
      const schema = createMockZodSchema(true);
      const validator = zodAsyncValidator(schema);

      expect(await validator('string')).toBe(null);
      expect(await validator(123)).toBe(null);
      expect(await validator(true)).toBe(null);
      expect(await validator(null)).toBe(null);
      expect(await validator(['array'])).toBe(null);
    });

    it('handles async validation with delay', async () => {
      const schema = {
        safeParse: () => ({ success: true as const, data: 'value' }),
        safeParseAsync: async (value: unknown) => {
          // Simulate async delay
          await new Promise((resolve) => setTimeout(resolve, 10));
          return { success: true as const, data: value };
        },
        _def: { typeName: 'ZodString' },
      };
      const validator = zodAsyncValidator(schema);
      const startTime = Date.now();
      const result = await validator('test');
      const endTime = Date.now();

      expect(result).toBe(null);
      expect(endTime - startTime).toBeGreaterThanOrEqual(10);
    });
  });

  describe('isZodAvailable', () => {
    it('returns true when Zod functionality is available', () => {
      expect(isZodAvailable()).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('handles complex schema validation', () => {
      const schema = createMockZodSchema(false, 'Must be a valid email address');
      const validator = zodValidator(schema);
      const result = validator('not-an-email');
      expect(result).toBe('Must be a valid email address');
    });

    it('handles multiple validators with Zod', () => {
      const emailSchema = createMockZodSchema(false, 'Invalid email');
      const lengthSchema = createMockZodSchema(false, 'Too short');

      const emailValidator = zodValidator(emailSchema);
      const lengthValidator = zodValidator(lengthSchema);

      expect(emailValidator('invalid')).toBe('Invalid email');
      expect(lengthValidator('ab')).toBe('Too short');
    });

    it('works with numeric values', () => {
      const numberSchema = createMockZodSchema(true);
      const validator = zodValidator(numberSchema);
      expect(validator(42)).toBe(null);
    });

    it('works with boolean values', () => {
      const booleanSchema = createMockZodSchema(true);
      const validator = zodValidator(booleanSchema);
      expect(validator(true)).toBe(null);
      expect(validator(false)).toBe(null);
    });

    it('works with array values', () => {
      const arraySchema = createMockZodSchema(true);
      const validator = zodValidator(arraySchema);
      expect(validator(['item1', 'item2'])).toBe(null);
    });

    it('async validator handles rejection gracefully', async () => {
      const schema = createMockZodSchema(false, 'Async error');
      const validator = zodAsyncValidator(schema);
      const result = await validator('failing value');
      expect(result).toBe('Async error');
    });

    it('can override Zod error with custom message', () => {
      const schema = createMockZodSchema(false, 'Expected number, received string');
      const validator = zodValidator(schema, 'Please enter a number');
      const result = validator('text');
      expect(result).toBe('Please enter a number');
    });

    it('async validator can override Zod error with custom message', async () => {
      const schema = createMockZodSchema(false, 'Expected number, received string');
      const validator = zodAsyncValidator(schema, 'Please enter a valid number');
      const result = await validator('text');
      expect(result).toBe('Please enter a valid number');
    });
  });

  describe('edge cases', () => {
    it('handles empty string validation', () => {
      const schema = createMockZodSchema(false, 'String cannot be empty');
      const validator = zodValidator(schema);
      expect(validator('')).toBe('String cannot be empty');
    });

    it('handles null value', () => {
      const schema = createMockZodSchema(true);
      const validator = zodValidator(schema);
      expect(validator(null)).toBe(null);
    });

    it('handles undefined value', () => {
      const schema = createMockZodSchema(true);
      const validator = zodValidator(schema);
      expect(validator(undefined)).toBe(null);
    });

    it('handles empty array', () => {
      const schema = createMockZodSchema(false, 'Array cannot be empty');
      const validator = zodValidator(schema);
      expect(validator([])).toBe('Array cannot be empty');
    });
  });
});
