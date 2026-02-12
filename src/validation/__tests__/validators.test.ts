import { describe, expect, it } from 'vitest';
import {
  required,
  email,
  url,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  matches,
  oneOf,
  phone,
  fileSize,
  fileType,
  compose,
  asyncValidator,
} from '../validators';

describe('required', () => {
  const validator = required();

  it('returns error for null/undefined', () => {
    expect(validator(null)).toBe('This field is required');
    expect(validator(undefined)).toBe('This field is required');
  });

  it('returns error for empty string', () => {
    expect(validator('')).toBe('This field is required');
    expect(validator('   ')).toBe('This field is required');
  });

  it('returns error for empty array', () => {
    expect(validator([])).toBe('This field is required');
  });

  it('returns null for valid values', () => {
    expect(validator('hello')).toBe(null);
    expect(validator(0)).toBe(null);
    expect(validator(false)).toBe(null);
    expect(validator(['item'])).toBe(null);
  });

  it('accepts custom message', () => {
    const customValidator = required('Custom error');
    expect(customValidator(null)).toBe('Custom error');
  });
});

describe('email', () => {
  const validator = email();

  it('returns null for empty values', () => {
    expect(validator(null)).toBe(null);
    expect(validator(undefined)).toBe(null);
    expect(validator('')).toBe(null);
  });

  it('validates correct email addresses', () => {
    expect(validator('test@example.com')).toBe(null);
    expect(validator('user+tag@domain.co.uk')).toBe(null);
  });

  it('returns error for invalid emails', () => {
    expect(validator('invalid')).toBe('Please enter a valid email address');
    expect(validator('test@')).toBe('Please enter a valid email address');
    expect(validator('@example.com')).toBe('Please enter a valid email address');
    expect(validator('test @example.com')).toBe('Please enter a valid email address');
  });

  it('accepts custom message', () => {
    const customValidator = email('Invalid email');
    expect(customValidator('invalid')).toBe('Invalid email');
  });
});

describe('url', () => {
  const validator = url();

  it('returns null for empty values', () => {
    expect(validator(null)).toBe(null);
    expect(validator('')).toBe(null);
  });

  it('validates correct URLs', () => {
    expect(validator('https://example.com')).toBe(null);
    expect(validator('http://example.com')).toBe(null);
    expect(validator('https://example.com/path?query=value')).toBe(null);
  });

  it('returns error for invalid URLs', () => {
    expect(validator('example.com')).toBe('Please enter a valid URL');
    expect(validator('ftp://example.com')).toBe('Please enter a valid URL');
  });
});

describe('minLength', () => {
  const validator = minLength(5);

  it('returns null for empty values', () => {
    expect(validator(null)).toBe(null);
    expect(validator('')).toBe(null);
  });

  it('validates minimum length', () => {
    expect(validator('hello')).toBe(null);
    expect(validator('hello world')).toBe(null);
  });

  it('returns error for short strings', () => {
    expect(validator('hi')).toBe('Must be at least 5 characters');
  });

  it('accepts custom message', () => {
    const customValidator = minLength(5, 'Too short');
    expect(customValidator('hi')).toBe('Too short');
  });
});

describe('maxLength', () => {
  const validator = maxLength(10);

  it('returns null for empty values', () => {
    expect(validator(null)).toBe(null);
    expect(validator('')).toBe(null);
  });

  it('validates maximum length', () => {
    expect(validator('hello')).toBe(null);
    expect(validator('1234567890')).toBe(null);
  });

  it('returns error for long strings', () => {
    expect(validator('12345678901')).toBe('Must be no more than 10 characters');
  });
});

describe('min', () => {
  const validator = min(10);

  it('returns null for empty values', () => {
    expect(validator(null)).toBe(null);
    expect(validator('')).toBe(null);
  });

  it('validates minimum value', () => {
    expect(validator(10)).toBe(null);
    expect(validator(100)).toBe(null);
  });

  it('returns error for small values', () => {
    expect(validator(5)).toBe('Must be at least 10');
  });

  it('handles string numbers', () => {
    expect(validator('15')).toBe(null);
    expect(validator('5')).toBe('Must be at least 10');
  });
});

describe('max', () => {
  const validator = max(100);

  it('returns null for empty values', () => {
    expect(validator(null)).toBe(null);
  });

  it('validates maximum value', () => {
    expect(validator(50)).toBe(null);
    expect(validator(100)).toBe(null);
  });

  it('returns error for large values', () => {
    expect(validator(150)).toBe('Must be no more than 100');
  });
});

describe('pattern', () => {
  const validator = pattern(/^[A-Z]+$/);

  it('returns null for empty values', () => {
    expect(validator(null)).toBe(null);
    expect(validator('')).toBe(null);
  });

  it('validates pattern match', () => {
    expect(validator('HELLO')).toBe(null);
  });

  it('returns error for non-matching values', () => {
    expect(validator('hello')).toBe('Invalid format');
    expect(validator('Hello')).toBe('Invalid format');
  });

  it('accepts custom message', () => {
    const customValidator = pattern(/^[A-Z]+$/, 'Must be uppercase');
    expect(customValidator('hello')).toBe('Must be uppercase');
  });
});

describe('matches', () => {
  const validator = matches('password');

  it('returns null when values match', () => {
    const context = { formValues: { password: 'secret123' } };
    expect(validator('secret123', context)).toBe(null);
  });

  it('returns error when values do not match', () => {
    const context = { formValues: { password: 'secret123' } };
    expect(validator('different', context)).toBe('Must match password');
  });

  it('returns null when no context', () => {
    expect(validator('anything')).toBe(null);
  });

  it('accepts custom message', () => {
    const customValidator = matches('password', 'Passwords must match');
    const context = { formValues: { password: 'secret123' } };
    expect(customValidator('different', context)).toBe('Passwords must match');
  });
});

describe('oneOf', () => {
  const validator = oneOf(['red', 'green', 'blue']);

  it('returns null for empty values', () => {
    expect(validator(null)).toBe(null);
    expect(validator('')).toBe(null);
  });

  it('validates allowed values', () => {
    expect(validator('red')).toBe(null);
    expect(validator('green')).toBe(null);
    expect(validator('blue')).toBe(null);
  });

  it('returns error for disallowed values', () => {
    expect(validator('yellow')).toBe('Must be one of: red, green, blue');
  });
});

describe('phone', () => {
  const validator = phone();

  it('returns null for empty values', () => {
    expect(validator(null)).toBe(null);
    expect(validator('')).toBe(null);
  });

  it('validates phone numbers', () => {
    expect(validator('1234567890')).toBe(null);
    expect(validator('(123) 456-7890')).toBe(null);
    expect(validator('123-456-7890')).toBe(null);
  });

  it('returns error for invalid phones', () => {
    expect(validator('123')).toBe('Please enter a valid phone number');
    expect(validator('abc')).toBe('Please enter a valid phone number');
  });
});

describe('fileSize', () => {
  const validator = fileSize(1024 * 1024); // 1MB

  it('returns null for empty values', () => {
    expect(validator(null)).toBe(null);
  });

  it('validates file size', () => {
    const smallFile = new File(['a'.repeat(100)], 'small.txt');
    expect(validator(smallFile)).toBe(null);
  });

  it('returns error for large files', () => {
    const largeFile = new File(['a'.repeat(2 * 1024 * 1024)], 'large.txt');
    const error = validator(largeFile);
    expect(error).toContain('File size must be less than');
  });
});

describe('fileType', () => {
  const validator = fileType(['.pdf', '.doc', 'image/']);

  it('returns null for empty values', () => {
    expect(validator(null)).toBe(null);
  });

  it('validates file extensions', () => {
    const pdfFile = new File([''], 'document.pdf', { type: 'application/pdf' });
    expect(validator(pdfFile)).toBe(null);
  });

  it('validates MIME types', () => {
    const imageFile = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    expect(validator(imageFile)).toBe(null);
  });

  it('returns error for invalid file types', () => {
    const txtFile = new File([''], 'file.txt', { type: 'text/plain' });
    const error = validator(txtFile);
    expect(error).toContain('File type must be one of');
  });
});

describe('compose', () => {
  it('combines multiple validators', () => {
    const validator = compose(required(), minLength(5), maxLength(10));

    expect(validator('')).toBe('This field is required');
    expect(validator('hi')).toBe('Must be at least 5 characters');
    expect(validator('12345678901')).toBe('Must be no more than 10 characters');
    expect(validator('hello')).toBe(null);
  });

  it('returns first error encountered', () => {
    const validator = compose(required(), email());
    expect(validator('')).toBe('This field is required');
  });
});

describe('asyncValidator', () => {
  it('validates asynchronously', async () => {
    const validator = asyncValidator(async (value) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return value === 'valid';
    }, 'Invalid value');

    expect(await validator('valid')).toBe(null);
    expect(await validator('invalid')).toBe('Invalid value');
  });

  it('handles async errors', async () => {
    const validator = asyncValidator(async () => {
      throw new Error('Network error');
    }, 'Validation failed');

    expect(await validator('anything')).toBe('Validation failed');
  });
});
