import { describe, expect, it } from 'vitest';
import {
  formatFieldError,
  formatFormErrors,
  formatZodError,
  formatRHFError,
  getFieldErrors,
  getFirstFieldError,
  hasFieldError,
  groupErrorsByField,
  flattenFormErrors,
  createFieldError,
  mergeErrors,
  filterErrorsBySeverity,
  toErrorMap,
} from '../errorFormatters';
import type { FieldError, FormErrors } from '../types';

describe('formatFieldError', () => {
  it('formats a string error', () => {
    const result = formatFieldError('Invalid value');
    expect(result).toEqual({
      message: 'Invalid value',
      field: '',
      severity: 'error',
    });
  });

  it('formats a FieldError object', () => {
    const error: FieldError = {
      field: 'email',
      message: 'Invalid email',
      severity: 'warning',
      code: 'INVALID_EMAIL',
    };

    const result = formatFieldError(error);
    expect(result).toEqual({
      message: 'Invalid email',
      field: 'email',
      severity: 'warning',
      original: error,
    });
  });

  it('applies prefix option', () => {
    const result = formatFieldError('Invalid value', { prefix: 'Error: ' });
    expect(result.message).toBe('Error: Invalid value');
  });

  it('shows error code when requested', () => {
    const error: FieldError = {
      field: 'email',
      message: 'Invalid email',
      code: 'INVALID_EMAIL',
    };

    const result = formatFieldError(error, { showCode: true });
    expect(result.message).toBe('[INVALID_EMAIL] Invalid email');
  });

  it('applies custom template', () => {
    const error: FieldError = {
      field: 'email',
      message: 'Invalid email',
      code: 'INVALID_EMAIL',
    };

    const result = formatFieldError(error, {
      templates: { INVALID_EMAIL: 'Please provide a valid email address' },
    });
    expect(result.message).toBe('Please provide a valid email address');
  });
});

describe('formatFormErrors', () => {
  it('formats simple string errors', () => {
    const errors: FormErrors = {
      email: 'Invalid email',
      password: 'Too short',
    };

    const result = formatFormErrors(errors);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      field: 'email',
      message: 'Invalid email',
      severity: 'error',
    });
  });

  it('formats array of errors', () => {
    const errors: FormErrors = {
      email: ['Invalid format', 'Already exists'],
    };

    const result = formatFormErrors(errors);
    expect(result).toHaveLength(2);
    expect(result[0].field).toBe('email');
    expect(result[1].field).toBe('email');
  });

  it('formats FieldError objects', () => {
    const errors: FormErrors = {
      email: {
        field: 'email',
        message: 'Invalid email',
        code: 'INVALID',
      },
    };

    const result = formatFormErrors(errors);
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe('Invalid email');
  });

  it('handles mixed error types', () => {
    const errors: FormErrors = {
      email: 'Invalid email',
      password: ['Too short', 'No special chars'],
      username: {
        field: 'username',
        message: 'Taken',
        code: 'TAKEN',
      },
    };

    const result = formatFormErrors(errors);
    expect(result).toHaveLength(4);
  });
});

describe('formatZodError', () => {
  it('formats Zod issues', () => {
    const zodError = {
      issues: [
        { path: ['email'], message: 'Invalid email', type: 'invalid_string' },
        { path: ['age'], message: 'Must be positive', type: 'too_small' },
      ],
    };

    const result = formatZodError(zodError);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      field: 'email',
      message: 'Invalid email',
      severity: 'error',
    });
  });

  it('handles nested paths', () => {
    const zodError = {
      issues: [
        {
          path: ['user', 'address', 'street'],
          message: 'Required',
          type: 'required',
        },
      ],
    };

    const result = formatZodError(zodError);
    expect(result[0].field).toBe('user.address.street');
  });

  it('returns empty array for no issues', () => {
    const result = formatZodError({});
    expect(result).toEqual([]);
  });

  it('applies formatting options', () => {
    const zodError = {
      issues: [{ path: ['email'], message: 'Invalid', type: 'CUSTOM' }],
    };

    const result = formatZodError(zodError, { showCode: true });
    expect(result[0].message).toBe('[CUSTOM] Invalid');
  });
});

describe('formatRHFError', () => {
  it('formats React Hook Form errors', () => {
    const rhfErrors = {
      email: { message: 'Invalid email', type: 'pattern' },
      password: { message: 'Required', type: 'required' },
    };

    const result = formatRHFError(rhfErrors);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      field: 'email',
      message: 'Invalid email',
    });
  });

  it('skips errors without messages', () => {
    const rhfErrors = {
      email: { type: 'pattern' },
      password: { message: 'Required' },
    };

    const result = formatRHFError(rhfErrors);
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe('password');
  });

  it('applies formatting options', () => {
    const rhfErrors = {
      email: { message: 'Invalid', type: 'CUSTOM' },
    };

    const result = formatRHFError(rhfErrors, { prefix: 'Error: ' });
    expect(result[0].message).toBe('Error: Invalid');
  });
});

describe('getFieldErrors', () => {
  const errors = [
    { field: 'email', message: 'Invalid', severity: 'error' as const },
    { field: 'password', message: 'Too short', severity: 'error' as const },
    { field: 'email', message: 'Required', severity: 'error' as const },
  ];

  it('returns errors for specific field', () => {
    const result = getFieldErrors(errors, 'email');
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.field === 'email')).toBe(true);
  });

  it('returns empty array for non-existent field', () => {
    const result = getFieldErrors(errors, 'username');
    expect(result).toEqual([]);
  });
});

describe('getFirstFieldError', () => {
  const errors = [
    { field: 'email', message: 'Invalid', severity: 'error' as const },
    { field: 'email', message: 'Required', severity: 'error' as const },
  ];

  it('returns first error message', () => {
    const result = getFirstFieldError(errors, 'email');
    expect(result).toBe('Invalid');
  });

  it('returns null for non-existent field', () => {
    const result = getFirstFieldError(errors, 'username');
    expect(result).toBe(null);
  });
});

describe('hasFieldError', () => {
  const errors = [{ field: 'email', message: 'Invalid', severity: 'error' as const }];

  it('returns true when field has error', () => {
    expect(hasFieldError(errors, 'email')).toBe(true);
  });

  it('returns false when field has no error', () => {
    expect(hasFieldError(errors, 'username')).toBe(false);
  });
});

describe('groupErrorsByField', () => {
  it('groups errors by field name', () => {
    const errors = [
      { field: 'email', message: 'Invalid', severity: 'error' as const },
      { field: 'password', message: 'Too short', severity: 'error' as const },
      { field: 'email', message: 'Required', severity: 'error' as const },
    ];

    const result = groupErrorsByField(errors);
    expect(Object.keys(result)).toEqual(['email', 'password']);
    expect(result.email).toHaveLength(2);
    expect(result.password).toHaveLength(1);
  });
});

describe('flattenFormErrors', () => {
  it('flattens string errors', () => {
    const errors: FormErrors = {
      email: 'Invalid email',
      password: 'Too short',
    };

    const result = flattenFormErrors(errors);
    expect(result).toEqual(['Invalid email', 'Too short']);
  });

  it('flattens array errors', () => {
    const errors: FormErrors = {
      email: ['Invalid', 'Required'],
    };

    const result = flattenFormErrors(errors);
    expect(result).toEqual(['Invalid', 'Required']);
  });

  it('flattens FieldError objects', () => {
    const errors: FormErrors = {
      email: { field: 'email', message: 'Invalid' },
    };

    const result = flattenFormErrors(errors);
    expect(result).toEqual(['Invalid']);
  });
});

describe('createFieldError', () => {
  it('creates basic field error', () => {
    const result = createFieldError('email', 'Invalid email');
    expect(result).toEqual({
      field: 'email',
      message: 'Invalid email',
      severity: 'error',
      source: 'validation',
    });
  });

  it('creates field error with options', () => {
    const result = createFieldError('email', 'Invalid', {
      severity: 'warning',
      code: 'INVALID',
      source: 'custom',
      meta: { attempts: 3 },
    });

    expect(result).toEqual({
      field: 'email',
      message: 'Invalid',
      severity: 'warning',
      code: 'INVALID',
      source: 'custom',
      meta: { attempts: 3 },
    });
  });
});

describe('mergeErrors', () => {
  it('merges multiple error arrays', () => {
    const errors1 = [{ field: 'email', message: 'Invalid', severity: 'error' as const }];
    const errors2 = [{ field: 'password', message: 'Too short', severity: 'error' as const }];

    const result = mergeErrors(errors1, errors2);
    expect(result).toHaveLength(2);
  });

  it('removes duplicate errors', () => {
    const errors1 = [{ field: 'email', message: 'Invalid', severity: 'error' as const }];
    const errors2 = [{ field: 'email', message: 'Invalid', severity: 'error' as const }];

    const result = mergeErrors(errors1, errors2);
    expect(result).toHaveLength(1);
  });
});

describe('filterErrorsBySeverity', () => {
  const errors = [
    { field: 'email', message: 'Invalid', severity: 'error' as const },
    { field: 'password', message: 'Weak', severity: 'warning' as const },
    { field: 'username', message: 'Available', severity: 'info' as const },
  ];

  it('filters errors by severity', () => {
    const result = filterErrorsBySeverity(errors, 'error');
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe('email');
  });

  it('filters warnings', () => {
    const result = filterErrorsBySeverity(errors, 'warning');
    expect(result).toHaveLength(1);
    expect(result[0].field).toBe('password');
  });
});

describe('toErrorMap', () => {
  it('converts form errors to simple map', () => {
    const errors: FormErrors = {
      email: 'Invalid email',
      password: 'Too short',
    };

    const result = toErrorMap(errors);
    expect(result).toEqual({
      email: 'Invalid email',
      password: 'Too short',
    });
  });

  it('takes first error from arrays', () => {
    const errors: FormErrors = {
      email: ['Invalid', 'Required'],
    };

    const result = toErrorMap(errors);
    expect(result.email).toBe('Invalid');
  });

  it('extracts message from FieldError', () => {
    const errors: FormErrors = {
      email: { field: 'email', message: 'Invalid' },
    };

    const result = toErrorMap(errors);
    expect(result.email).toBe('Invalid');
  });
});
