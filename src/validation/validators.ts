/**
 * Core validation functions for FormKit UI
 */

import type { ValidatorFn, ValidationResult } from './types';
import type { FieldValue } from '../utils/types';

/**
 * Email regex pattern (basic validation)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * URL regex pattern
 */
const URL_REGEX = /^https?:\/\/.+/;

/**
 * Validates that a field has a value (is not empty)
 * @param message - Custom error message
 * @returns Validator function
 */
export function required(message = 'This field is required'): ValidatorFn {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined) {
      return message;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return message;
    }

    if (Array.isArray(value) && value.length === 0) {
      return message;
    }

    return null;
  };
}

/**
 * Validates that a string value is a valid email address
 * @param message - Custom error message
 * @returns Validator function
 */
export function email(message = 'Please enter a valid email address'): ValidatorFn {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return null; // Empty is valid (use required() for mandatory fields)
    }

    if (typeof value !== 'string') {
      return message;
    }

    if (!EMAIL_REGEX.test(value)) {
      return message;
    }

    return null;
  };
}

/**
 * Validates that a string value is a valid URL
 * @param message - Custom error message
 * @returns Validator function
 */
export function url(message = 'Please enter a valid URL'): ValidatorFn {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value !== 'string') {
      return message;
    }

    if (!URL_REGEX.test(value)) {
      return message;
    }

    return null;
  };
}

/**
 * Validates minimum string length
 * @param min - Minimum length
 * @param message - Custom error message
 * @returns Validator function
 */
export function minLength(min: number, message?: string): ValidatorFn {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const length = typeof value === 'string' ? value.length : String(value).length;

    if (length < min) {
      return message || `Must be at least ${min} characters`;
    }

    return null;
  };
}

/**
 * Validates maximum string length
 * @param max - Maximum length
 * @param message - Custom error message
 * @returns Validator function
 */
export function maxLength(max: number, message?: string): ValidatorFn {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const length = typeof value === 'string' ? value.length : String(value).length;

    if (length > max) {
      return message || `Must be no more than ${max} characters`;
    }

    return null;
  };
}

/**
 * Validates minimum numeric value
 * @param minValue - Minimum value
 * @param message - Custom error message
 * @returns Validator function
 */
export function min(minValue: number, message?: string): ValidatorFn {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numValue = typeof value === 'number' ? value : Number(value);

    if (isNaN(numValue)) {
      return 'Must be a valid number';
    }

    if (numValue < minValue) {
      return message || `Must be at least ${minValue}`;
    }

    return null;
  };
}

/**
 * Validates maximum numeric value
 * @param maxValue - Maximum value
 * @param message - Custom error message
 * @returns Validator function
 */
export function max(maxValue: number, message?: string): ValidatorFn {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numValue = typeof value === 'number' ? value : Number(value);

    if (isNaN(numValue)) {
      return 'Must be a valid number';
    }

    if (numValue > maxValue) {
      return message || `Must be no more than ${maxValue}`;
    }

    return null;
  };
}

/**
 * Validates that a value matches a regex pattern
 * @param regex - Regular expression pattern
 * @param message - Custom error message
 * @returns Validator function
 */
export function pattern(regex: RegExp, message = 'Invalid format'): ValidatorFn {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const strValue = String(value);

    if (!regex.test(strValue)) {
      return message;
    }

    return null;
  };
}

/**
 * Validates that a value matches another field's value
 * @param fieldName - Name of field to match
 * @param message - Custom error message
 * @returns Validator function
 */
export function matches(fieldName: string, message?: string): ValidatorFn {
  return (value: FieldValue, context): ValidationResult => {
    if (!context?.formValues) {
      return null;
    }

    const otherValue = context.formValues[fieldName];

    if (value !== otherValue) {
      return message || `Must match ${fieldName}`;
    }

    return null;
  };
}

/**
 * Validates that a value is one of the allowed values
 * @param allowedValues - Array of allowed values
 * @param message - Custom error message
 * @returns Validator function
 */
export function oneOf(allowedValues: unknown[], message?: string): ValidatorFn {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (!allowedValues.includes(value)) {
      return message || `Must be one of: ${allowedValues.join(', ')}`;
    }

    return null;
  };
}

/**
 * Validates a phone number (basic US format)
 * @param message - Custom error message
 * @returns Validator function
 */
export function phone(message = 'Please enter a valid phone number'): ValidatorFn {
  const phoneRegex = /^[\d\s\-()]+$/;

  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value !== 'string') {
      return message;
    }

    // Remove formatting and check length
    const digitsOnly = value.replace(/\D/g, '');

    if (!phoneRegex.test(value)) {
      return message;
    }

    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return message;
    }

    return null;
  };
}

/**
 * Validates file size
 * @param maxSizeInBytes - Maximum file size in bytes
 * @param message - Custom error message
 * @returns Validator function
 */
export function fileSize(maxSizeInBytes: number, message?: string): ValidatorFn {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof File) {
      if (value.size > maxSizeInBytes) {
        const maxSizeMB = (maxSizeInBytes / 1024 / 1024).toFixed(2);
        return message || `File size must be less than ${maxSizeMB}MB`;
      }
    }

    if (Array.isArray(value) && value.every((v) => v instanceof File)) {
      const oversizedFile = value.find((f) => (f as File).size > maxSizeInBytes);
      if (oversizedFile) {
        const maxSizeMB = (maxSizeInBytes / 1024 / 1024).toFixed(2);
        return message || `File size must be less than ${maxSizeMB}MB`;
      }
    }

    return null;
  };
}

/**
 * Validates file type
 * @param allowedTypes - Array of allowed MIME types or extensions
 * @param message - Custom error message
 * @returns Validator function
 */
export function fileType(allowedTypes: string[], message?: string): ValidatorFn {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined) {
      return null;
    }

    const checkFileType = (file: File): boolean => {
      return allowedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        // Handle MIME types (e.g., 'image/', 'image/jpeg')
        return file.type === type || file.type.startsWith(type);
      });
    };

    if (value instanceof File) {
      if (!checkFileType(value)) {
        return message || `File type must be one of: ${allowedTypes.join(', ')}`;
      }
    }

    if (Array.isArray(value) && value.every((v) => v instanceof File)) {
      const invalidFile = value.find((f) => !checkFileType(f as File));
      if (invalidFile) {
        return message || `File type must be one of: ${allowedTypes.join(', ')}`;
      }
    }

    return null;
  };
}

/**
 * Combines multiple validators with AND logic
 * @param validators - Array of validator functions
 * @returns Combined validator function
 */
export function compose(...validators: ValidatorFn[]): ValidatorFn {
  return (value: FieldValue, context): ValidationResult => {
    for (const validator of validators) {
      const error = validator(value, context);
      if (error) {
        return error;
      }
    }
    return null;
  };
}

/**
 * Creates a custom async validator
 * @param asyncFn - Async validation function
 * @param message - Error message
 * @returns Async validator function
 */
export function asyncValidator(
  asyncFn: (value: FieldValue) => Promise<boolean>,
  message = 'Validation failed',
): ValidatorFn {
  return async (value: FieldValue): Promise<string | null> => {
    try {
      const isValid = await asyncFn(value);
      return isValid ? null : message;
    } catch {
      return message;
    }
  };
}
