import { describe, expect, it } from 'vitest';
import {
  formatFieldValue,
  sanitizeInput,
  sanitizeInputStrict,
  isEmpty,
  normalizeValue,
  generateFieldId,
  parseFieldPath,
  getNestedValue,
  setNestedValue,
  areValuesEqual,
} from '../fieldHelpers';

describe('formatFieldValue', () => {
  it('formats null/undefined as empty string', () => {
    expect(formatFieldValue(null)).toBe('');
    expect(formatFieldValue(undefined)).toBe('');
  });

  it('formats boolean values', () => {
    expect(formatFieldValue(true)).toBe('true');
    expect(formatFieldValue(false)).toBe('false');
  });

  it('formats numbers', () => {
    expect(formatFieldValue(42)).toBe('42');
    expect(formatFieldValue(0)).toBe('0');
  });

  it('formats strings', () => {
    expect(formatFieldValue('hello')).toBe('hello');
  });

  it('formats File objects', () => {
    const file = new File(['content'], 'test.txt');
    expect(formatFieldValue(file)).toBe('test.txt');
  });

  it('formats File arrays', () => {
    const files = [new File([''], 'file1.txt'), new File([''], 'file2.txt')];
    expect(formatFieldValue(files)).toBe('file1.txt, file2.txt');
  });
});

describe('sanitizeInput', () => {
  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
    expect(sanitizeInput('\n\tvalue\t\n')).toBe('value');
  });

  it('preserves internal spaces', () => {
    expect(sanitizeInput('  hello   world  ')).toBe('hello   world');
  });
});

describe('sanitizeInputStrict', () => {
  it('trims and collapses multiple spaces', () => {
    expect(sanitizeInputStrict('  hello   world  ')).toBe('hello world');
    expect(sanitizeInputStrict('a  b    c')).toBe('a b c');
  });
});

describe('isEmpty', () => {
  it('returns true for null/undefined', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('returns true for empty strings', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
  });

  it('returns false for non-empty strings', () => {
    expect(isEmpty('hello')).toBe(false);
    expect(isEmpty(' a ')).toBe(false);
  });

  it('returns false for numbers (including 0)', () => {
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(42)).toBe(false);
  });

  it('returns false for booleans', () => {
    expect(isEmpty(true)).toBe(false);
    expect(isEmpty(false)).toBe(false);
  });

  it('returns true for empty arrays', () => {
    expect(isEmpty([])).toBe(true);
  });

  it('returns false for non-empty arrays', () => {
    expect(isEmpty([1, 2, 3])).toBe(false);
  });
});

describe('normalizeValue', () => {
  it('normalizes to string', () => {
    expect(normalizeValue(42, 'string')).toBe('42');
    expect(normalizeValue(true, 'string')).toBe('true');
    expect(normalizeValue('hello', 'string')).toBe('hello');
  });

  it('normalizes to number', () => {
    expect(normalizeValue('42', 'number')).toBe(42);
    expect(normalizeValue(42, 'number')).toBe(42);
    expect(normalizeValue('invalid', 'number')).toBe(null);
  });

  it('normalizes to boolean', () => {
    expect(normalizeValue('true', 'boolean')).toBe(true);
    expect(normalizeValue('false', 'boolean')).toBe(false);
    expect(normalizeValue('1', 'boolean')).toBe(true);
    expect(normalizeValue('0', 'boolean')).toBe(false);
    expect(normalizeValue(true, 'boolean')).toBe(true);
    expect(normalizeValue(1, 'boolean')).toBe(true);
    expect(normalizeValue(0, 'boolean')).toBe(false);
  });

  it('returns null for null/undefined', () => {
    expect(normalizeValue(null, 'string')).toBe(null);
    expect(normalizeValue(undefined, 'number')).toBe(null);
  });
});

describe('generateFieldId', () => {
  it('generates unique IDs', () => {
    const id1 = generateFieldId('email');
    const id2 = generateFieldId('email');
    expect(id1).not.toBe(id2);
  });

  it('includes field name', () => {
    const id = generateFieldId('email');
    expect(id).toContain('email');
  });

  it('uses custom prefix', () => {
    const id = generateFieldId('email', 'custom');
    expect(id).toContain('custom-email');
  });
});

describe('parseFieldPath', () => {
  it('parses dot-notation paths', () => {
    expect(parseFieldPath('user.address.street')).toEqual(['user', 'address', 'street']);
  });

  it('handles simple paths', () => {
    expect(parseFieldPath('email')).toEqual(['email']);
  });

  it('filters empty segments', () => {
    expect(parseFieldPath('user..address')).toEqual(['user', 'address']);
  });
});

describe('getNestedValue', () => {
  const obj = {
    user: {
      name: 'John',
      address: {
        street: '123 Main St',
      },
    },
  };

  it('gets nested values', () => {
    expect(getNestedValue(obj, 'user.name')).toBe('John');
    expect(getNestedValue(obj, 'user.address.street')).toBe('123 Main St');
  });

  it('returns undefined for non-existent paths', () => {
    expect(getNestedValue(obj, 'user.age')).toBeUndefined();
    expect(getNestedValue(obj, 'invalid.path')).toBeUndefined();
  });
});

describe('setNestedValue', () => {
  it('sets nested values', () => {
    const obj = { user: { name: 'John' } };
    const result = setNestedValue(obj, 'user.name', 'Jane');
    expect(result.user).toEqual({ name: 'Jane' });
  });

  it('creates missing nested objects', () => {
    const obj = {};
    const result = setNestedValue(obj, 'user.address.street', '123 Main St');
    expect(result).toEqual({
      user: { address: { street: '123 Main St' } },
    });
  });

  it('does not mutate original object', () => {
    const obj = { user: { name: 'John' } };
    const result = setNestedValue(obj, 'user.name', 'Jane');
    expect(obj.user.name).toBe('John');
    expect(result.user).not.toBe(obj.user);
  });
});

describe('areValuesEqual', () => {
  it('compares primitive values', () => {
    expect(areValuesEqual('hello', 'hello')).toBe(true);
    expect(areValuesEqual(42, 42)).toBe(true);
    expect(areValuesEqual(true, true)).toBe(true);
    expect(areValuesEqual('hello', 'world')).toBe(false);
  });

  it('compares null/undefined', () => {
    expect(areValuesEqual(null, null)).toBe(true);
    expect(areValuesEqual(undefined, undefined)).toBe(true);
    expect(areValuesEqual(null, undefined)).toBe(false);
  });

  it('compares arrays', () => {
    expect(areValuesEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(areValuesEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(areValuesEqual([1, 2, 3], [1, 3, 2])).toBe(false);
  });

  it('compares nested arrays', () => {
    expect(areValuesEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(areValuesEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
  });
});
