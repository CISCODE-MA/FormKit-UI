/**
 * Tests for core/validator.ts
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { mapZodErrors, validateSync, validateField, isEmpty } from '../validator';

describe('mapZodErrors', () => {
  it('maps single field error', () => {
    const schema = z.object({
      email: z.string().email('Invalid email'),
    });

    const result = schema.safeParse({ email: 'invalid' });
    if (!result.success) {
      const errors = mapZodErrors(result.error);
      expect(errors.email).toBe('Invalid email');
    }
  });

  it('maps multiple field errors', () => {
    const schema = z.object({
      name: z.string().min(2, 'Name too short'),
      email: z.string().email('Invalid email'),
    });

    const result = schema.safeParse({ name: 'A', email: 'invalid' });
    if (!result.success) {
      const errors = mapZodErrors(result.error);
      expect(errors.name).toBe('Name too short');
      expect(errors.email).toBe('Invalid email');
    }
  });

  it('keeps only first error per field', () => {
    const schema = z.object({
      password: z.string().min(8, 'Min 8 chars').regex(/[A-Z]/, 'Needs uppercase'),
    });

    const result = schema.safeParse({ password: 'short' });
    if (!result.success) {
      const errors = mapZodErrors(result.error);
      expect(errors.password).toBe('Min 8 chars');
    }
  });

  it('handles nested field paths', () => {
    const schema = z.object({
      user: z.object({
        email: z.string().email('Invalid email'),
      }),
    });

    const result = schema.safeParse({ user: { email: 'invalid' } });
    if (!result.success) {
      const errors = mapZodErrors(result.error);
      expect(errors['user.email']).toBe('Invalid email');
    }
  });

  it('handles array field paths', () => {
    const schema = z.object({
      items: z.array(z.string().min(1, 'Required')),
    });

    const result = schema.safeParse({ items: ['', 'valid'] });
    if (!result.success) {
      const errors = mapZodErrors(result.error);
      expect(errors['items.0']).toBe('Required');
    }
  });
});

describe('validateSync', () => {
  const schema = z.object({
    name: z.string().min(2, 'Name too short'),
    age: z.number().min(0, 'Age must be positive'),
  });

  it('returns success with data for valid values', () => {
    const result = validateSync(schema, { name: 'John', age: 25 });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'John', age: 25 });
    expect(result.errors).toBeNull();
  });

  it('returns failure with errors for invalid values', () => {
    const result = validateSync(schema, { name: 'J', age: -5 });

    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.errors).toEqual({
      name: 'Name too short',
      age: 'Age must be positive',
    });
  });

  it('handles missing fields', () => {
    const result = validateSync(schema, {});

    expect(result.success).toBe(false);
    expect(result.errors?.name).toBeDefined();
    expect(result.errors?.age).toBeDefined();
  });
});

describe('validateField', () => {
  it('returns null for valid value', () => {
    const schema = z.string().email();
    const result = validateField(schema, 'test@example.com');
    expect(result).toBeNull();
  });

  it('returns error message for invalid value', () => {
    const schema = z.string().email('Invalid email');
    const result = validateField(schema, 'invalid');
    expect(result).toBe('Invalid email');
  });

  it('returns default message when no custom message', () => {
    const schema = z.string().min(5);
    const result = validateField(schema, 'hi');
    expect(result).toBeDefined();
  });
});

describe('isEmpty', () => {
  it('returns true for null', () => {
    expect(isEmpty(null)).toBe(true);
  });

  it('returns true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isEmpty('')).toBe(true);
  });

  it('returns true for whitespace-only string', () => {
    expect(isEmpty('   ')).toBe(true);
  });

  it('returns true for empty array', () => {
    expect(isEmpty([])).toBe(true);
  });

  it('returns false for non-empty string', () => {
    expect(isEmpty('hello')).toBe(false);
  });

  it('returns false for non-empty array', () => {
    expect(isEmpty([1, 2, 3])).toBe(false);
  });

  it('returns false for number', () => {
    expect(isEmpty(0)).toBe(false);
  });

  it('returns false for boolean', () => {
    expect(isEmpty(false)).toBe(false);
  });
});
