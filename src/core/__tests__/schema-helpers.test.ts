/**
 * Tests for core/schema-helpers.ts
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { createFieldSchema, mergeSchemas } from '../schema-helpers';
import { FieldType } from '../types';

describe('createFieldSchema', () => {
  describe('FieldType.TEXT', () => {
    it('creates string schema', () => {
      const schema = createFieldSchema(FieldType.TEXT);
      expect(schema.safeParse('hello').success).toBe(true);
    });

    it('applies minLength constraint', () => {
      const schema = createFieldSchema(FieldType.TEXT, { required: true, minLength: 3 });
      expect(schema.safeParse('ab').success).toBe(false);
      expect(schema.safeParse('abc').success).toBe(true);
    });

    it('applies maxLength constraint', () => {
      const schema = createFieldSchema(FieldType.TEXT, { required: true, maxLength: 5 });
      expect(schema.safeParse('abcdef').success).toBe(false);
      expect(schema.safeParse('abcde').success).toBe(true);
    });

    it('applies pattern constraint', () => {
      const schema = createFieldSchema(FieldType.TEXT, {
        required: true,
        pattern: /^[a-z]+$/,
        message: 'Only lowercase letters',
      });
      expect(schema.safeParse('ABC').success).toBe(false);
      expect(schema.safeParse('abc').success).toBe(true);
    });
  });

  describe('FieldType.EMAIL', () => {
    it('creates email schema', () => {
      const schema = createFieldSchema(FieldType.EMAIL, { required: true });
      expect(schema.safeParse('invalid').success).toBe(false);
      expect(schema.safeParse('test@example.com').success).toBe(true);
    });

    it('uses custom message', () => {
      const schema = createFieldSchema(FieldType.EMAIL, {
        required: true,
        message: 'Custom email error',
      });
      const result = schema.safeParse('invalid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom email error');
      }
    });
  });

  describe('FieldType.PASSWORD', () => {
    it('creates string schema for password', () => {
      const schema = createFieldSchema(FieldType.PASSWORD, { required: true });
      expect(schema.safeParse('secret123').success).toBe(true);
    });
  });

  describe('FieldType.TEXTAREA', () => {
    it('creates string schema for textarea', () => {
      const schema = createFieldSchema(FieldType.TEXTAREA, { required: true });
      expect(schema.safeParse('long text content').success).toBe(true);
    });
  });

  describe('FieldType.NUMBER', () => {
    it('creates coerced number schema', () => {
      const schema = createFieldSchema(FieldType.NUMBER, { required: true });
      expect(schema.safeParse('42').success).toBe(true);
      expect(schema.safeParse(42).success).toBe(true);
    });

    it('applies min constraint', () => {
      const schema = createFieldSchema(FieldType.NUMBER, { required: true, min: 0 });
      expect(schema.safeParse(-1).success).toBe(false);
      expect(schema.safeParse(0).success).toBe(true);
    });

    it('applies max constraint', () => {
      const schema = createFieldSchema(FieldType.NUMBER, { required: true, max: 100 });
      expect(schema.safeParse(101).success).toBe(false);
      expect(schema.safeParse(100).success).toBe(true);
    });
  });

  describe('FieldType.CHECKBOX', () => {
    it('creates boolean schema', () => {
      const schema = createFieldSchema(FieldType.CHECKBOX, { required: true });
      expect(schema.safeParse(true).success).toBe(true);
      expect(schema.safeParse(false).success).toBe(true);
      expect(schema.safeParse('true').success).toBe(false);
    });
  });

  describe('FieldType.SWITCH', () => {
    it('creates boolean schema', () => {
      const schema = createFieldSchema(FieldType.SWITCH, { required: true });
      expect(schema.safeParse(true).success).toBe(true);
    });
  });

  describe('FieldType.DATE', () => {
    it('creates coerced date schema', () => {
      const schema = createFieldSchema(FieldType.DATE, { required: true });
      expect(schema.safeParse('2024-01-15').success).toBe(true);
      expect(schema.safeParse(new Date()).success).toBe(true);
    });
  });

  describe('FieldType.FILE', () => {
    it('creates File instance schema', () => {
      const schema = createFieldSchema(FieldType.FILE, { required: true });
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      expect(schema.safeParse(file).success).toBe(true);
      expect(schema.safeParse('not a file').success).toBe(false);
    });
  });

  describe('FieldType.SELECT', () => {
    it('creates string schema for select', () => {
      const schema = createFieldSchema(FieldType.SELECT, { required: true });
      expect(schema.safeParse('option1').success).toBe(true);
    });
  });

  describe('FieldType.RADIO', () => {
    it('creates string schema for radio', () => {
      const schema = createFieldSchema(FieldType.RADIO, { required: true });
      expect(schema.safeParse('option1').success).toBe(true);
    });
  });

  describe('FieldType.MULTI_SELECT', () => {
    it('creates array schema', () => {
      const schema = createFieldSchema(FieldType.MULTI_SELECT, { required: true });
      expect(schema.safeParse(['a', 'b']).success).toBe(true);
    });

    it('applies min constraint', () => {
      const schema = createFieldSchema(FieldType.MULTI_SELECT, { required: true, min: 2 });
      expect(schema.safeParse(['a']).success).toBe(false);
      expect(schema.safeParse(['a', 'b']).success).toBe(true);
    });

    it('applies max constraint', () => {
      const schema = createFieldSchema(FieldType.MULTI_SELECT, { required: true, max: 2 });
      expect(schema.safeParse(['a', 'b', 'c']).success).toBe(false);
      expect(schema.safeParse(['a', 'b']).success).toBe(true);
    });
  });

  describe('FieldType.ARRAY', () => {
    it('creates array schema', () => {
      const schema = createFieldSchema(FieldType.ARRAY, { required: true });
      expect(schema.safeParse([]).success).toBe(true);
    });
  });

  describe('optional fields', () => {
    it('makes field optional when required is false', () => {
      const schema = createFieldSchema(FieldType.TEXT, { required: false });
      expect(schema.safeParse(undefined).success).toBe(true);
    });

    it('makes field optional by default', () => {
      const schema = createFieldSchema(FieldType.TEXT);
      expect(schema.safeParse(undefined).success).toBe(true);
    });
  });
});

describe('mergeSchemas', () => {
  it('merges two schemas', () => {
    const schema1 = z.object({ name: z.string() });
    const schema2 = z.object({ email: z.string().email() });

    const merged = mergeSchemas([schema1, schema2]);

    expect(merged.safeParse({ name: 'John', email: 'john@test.com' }).success).toBe(true);
    expect(merged.safeParse({ name: 'John' }).success).toBe(false);
    expect(merged.safeParse({ email: 'john@test.com' }).success).toBe(false);
  });

  it('merges multiple schemas', () => {
    const schema1 = z.object({ a: z.string() });
    const schema2 = z.object({ b: z.number() });
    const schema3 = z.object({ c: z.boolean() });

    const merged = mergeSchemas([schema1, schema2, schema3]);

    expect(merged.safeParse({ a: 'test', b: 42, c: true }).success).toBe(true);
  });

  it('returns empty object schema for empty array', () => {
    const merged = mergeSchemas([]);
    expect(merged.safeParse({}).success).toBe(true);
  });

  it('handles single schema', () => {
    const schema = z.object({ name: z.string() });
    const merged = mergeSchemas([schema]);
    expect(merged.safeParse({ name: 'John' }).success).toBe(true);
  });
});
