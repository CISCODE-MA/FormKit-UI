/**
 * Validation type definitions for FormKit UI
 */

import type { FieldValue } from '../utils/types';

/**
 * Validation result from a validator function
 */
export type ValidationResult = string | null | undefined | Promise<string | null | undefined>;

/**
 * Validator function that checks a field value
 * @param value - The field value to validate
 * @param context - Additional validation context
 * @returns Error message if invalid, null/undefined if valid
 */
export type ValidatorFn = (value: FieldValue, context?: ValidationContext) => ValidationResult;

/**
 * Context provided to validators during validation
 */
export interface ValidationContext {
  /** All form values for cross-field validation */
  formValues?: Record<string, FieldValue>;
  /** Field name being validated */
  fieldName?: string;
  /** Whether field has been touched */
  touched?: boolean;
  /** Custom validation options */
  options?: Record<string, unknown>;
}

/**
 * Validation rule configuration
 */
export interface ValidationRule {
  /** The validator function to execute */
  validator: ValidatorFn;
  /** Custom error message (overrides validator default) */
  message?: string;
  /** When to run this validation */
  trigger?: ValidationTrigger;
}

/**
 * When validation should be triggered
 */
export type ValidationTrigger = 'change' | 'blur' | 'submit' | 'manual';

/**
 * Options for configuring validation behavior
 */
export interface ValidationOptions {
  /** Validate on every change */
  validateOnChange?: boolean;
  /** Validate on blur */
  validateOnBlur?: boolean;
  /** Validate on form submit */
  validateOnSubmit?: boolean;
  /** Delay in ms before validating on change (debounce) */
  debounce?: number;
  /** Stop validation on first error */
  abortEarly?: boolean;
}

/**
 * Validation state for a field
 */
export interface ValidationState {
  /** Whether validation is currently running */
  isValidating: boolean;
  /** Whether the field is valid */
  isValid: boolean;
  /** Current validation error message */
  error: string | null;
  /** All validation errors (if abortEarly is false) */
  errors: string[];
}

/**
 * Built-in validator types for common validations
 */
export type ValidatorType =
  | 'required'
  | 'email'
  | 'url'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'custom';

/**
 * Configuration for built-in validators
 */
export interface ValidatorConfig {
  /** Type of validator */
  type: ValidatorType;
  /** Validator-specific value (e.g., minLength value) */
  value?: unknown;
  /** Custom error message */
  message?: string;
}

/**
 * Schema for validating an entire form
 */
export interface ValidationSchema {
  /** Field name to validation rules mapping */
  fields: Record<string, ValidationRule[]>;
  /** Global validation options */
  options?: ValidationOptions;
}
