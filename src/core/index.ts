/**
 * Core module exports
 * Framework-FREE — no React imports in this module
 */

// Types and constants
export {
  FieldType,
  DEFAULT_DEBOUNCE_MS,
  MAX_FILE_SIZE_BYTES,
  type ConditionalOperator,
  type ConditionalRule,
  type FieldValue,
  type FormValues,
  type InputType,
  type ValidationMode,
} from './types';

// Conditional logic
export { evaluateRule, isFieldVisible } from './conditional';

// Validation utilities
export { mapZodErrors, validateSync, validateField, isEmpty, type FieldErrors } from './validator';

// Schema helpers
export { createFieldSchema, mergeSchemas } from './schema-helpers';

// Error classes
export {
  FormKitError,
  FieldValidationError,
  ConfigurationError,
  AsyncValidationError,
} from './errors';
