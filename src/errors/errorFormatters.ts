/**
 * Error formatting utilities for FormKit UI
 */

import type {
  FieldError,
  FormErrors,
  FormattedError,
  ErrorFormatterOptions,
  ExternalValidationError,
  ErrorSeverity,
} from './types';

/**
 * Default error severity
 */
const DEFAULT_SEVERITY: ErrorSeverity = 'error';

/**
 * Format a field error into a standardized format
 * @param error - Field error to format
 * @param options - Formatting options
 * @returns Formatted error
 */
export function formatFieldError(
  error: FieldError | string,
  options?: ErrorFormatterOptions,
): FormattedError {
  if (typeof error === 'string') {
    return {
      message: formatMessage(error, options),
      field: '',
      severity: DEFAULT_SEVERITY,
    };
  }

  return {
    message: formatMessage(error.message, options, error.code),
    field: error.field,
    severity: error.severity || DEFAULT_SEVERITY,
    original: error,
  };
}

/**
 * Format an error message with optional prefix and templates
 * @param message - Error message
 * @param options - Formatting options
 * @param code - Error code
 * @returns Formatted message
 */
function formatMessage(message: string, options?: ErrorFormatterOptions, code?: string): string {
  let formatted = message;

  // Apply template if available
  if (options?.templates && code && options.templates[code]) {
    formatted = options.templates[code];
  }

  // Add prefix
  if (options?.prefix) {
    formatted = `${options.prefix}${formatted}`;
  }

  // Add code if requested
  if (options?.showCode && code) {
    formatted = `[${code}] ${formatted}`;
  }

  return formatted;
}

/**
 * Format multiple form errors
 * @param errors - Form errors object
 * @param options - Formatting options
 * @returns Array of formatted errors
 */
export function formatFormErrors(
  errors: FormErrors,
  options?: ErrorFormatterOptions,
): FormattedError[] {
  const formatted: FormattedError[] = [];

  for (const [field, error] of Object.entries(errors)) {
    if (typeof error === 'string') {
      formatted.push({
        message: formatMessage(error, options),
        field,
        severity: DEFAULT_SEVERITY,
      });
    } else if (Array.isArray(error)) {
      error.forEach((err) => {
        if (typeof err === 'string') {
          formatted.push({
            message: formatMessage(err, options),
            field,
            severity: DEFAULT_SEVERITY,
          });
        } else {
          formatted.push(formatFieldError(err, options));
        }
      });
    } else {
      formatted.push(formatFieldError(error, options));
    }
  }

  return formatted;
}

/**
 * Format Zod validation errors
 * @param zodError - Zod error object
 * @param options - Formatting options
 * @returns Array of formatted errors
 */
export function formatZodError(
  zodError: { issues?: ExternalValidationError[] },
  options?: ErrorFormatterOptions,
): FormattedError[] {
  if (!zodError.issues) {
    return [];
  }

  return zodError.issues.map((issue) => {
    const field = Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path || '');

    return {
      message: formatMessage(issue.message, options, issue.type),
      field,
      severity: DEFAULT_SEVERITY,
      original: issue,
    };
  });
}

/**
 * Format React Hook Form errors
 * @param rhfErrors - React Hook Form errors object
 * @param options - Formatting options
 * @returns Array of formatted errors
 */
export function formatRHFError(
  rhfErrors: Record<string, { message?: string; type?: string }>,
  options?: ErrorFormatterOptions,
): FormattedError[] {
  const formatted: FormattedError[] = [];

  for (const [field, error] of Object.entries(rhfErrors)) {
    if (error.message) {
      formatted.push({
        message: formatMessage(error.message, options, error.type),
        field,
        severity: DEFAULT_SEVERITY,
        original: error,
      });
    }
  }

  return formatted;
}

/**
 * Extract field-specific errors from a list of formatted errors
 * @param errors - Array of formatted errors
 * @param fieldName - Field name to filter by
 * @returns Array of errors for the specified field
 */
export function getFieldErrors(errors: FormattedError[], fieldName: string): FormattedError[] {
  return errors.filter((error) => error.field === fieldName);
}

/**
 * Get the first error message for a field
 * @param errors - Array of formatted errors
 * @param fieldName - Field name
 * @returns First error message or null
 */
export function getFirstFieldError(errors: FormattedError[], fieldName: string): string | null {
  const fieldErrors = getFieldErrors(errors, fieldName);
  return fieldErrors.length > 0 ? fieldErrors[0].message : null;
}

/**
 * Check if a field has errors
 * @param errors - Array of formatted errors
 * @param fieldName - Field name
 * @returns True if field has errors
 */
export function hasFieldError(errors: FormattedError[], fieldName: string): boolean {
  return errors.some((error) => error.field === fieldName);
}

/**
 * Group errors by field name
 * @param errors - Array of formatted errors
 * @returns Errors grouped by field
 */
export function groupErrorsByField(errors: FormattedError[]): Record<string, FormattedError[]> {
  const grouped: Record<string, FormattedError[]> = {};

  for (const error of errors) {
    if (!grouped[error.field]) {
      grouped[error.field] = [];
    }
    grouped[error.field].push(error);
  }

  return grouped;
}

/**
 * Flatten nested form errors into a single array
 * @param errors - Form errors object
 * @returns Flattened array of error messages
 */
export function flattenFormErrors(errors: FormErrors): string[] {
  const messages: string[] = [];

  for (const error of Object.values(errors)) {
    if (typeof error === 'string') {
      messages.push(error);
    } else if (Array.isArray(error)) {
      error.forEach((err) => {
        if (typeof err === 'string') {
          messages.push(err);
        } else {
          messages.push(err.message);
        }
      });
    } else {
      messages.push(error.message);
    }
  }

  return messages;
}

/**
 * Create a field error object
 * @param field - Field name
 * @param message - Error message
 * @param options - Additional error properties
 * @returns Field error object
 */
export function createFieldError(
  field: string,
  message: string,
  options?: {
    severity?: ErrorSeverity;
    code?: string;
    source?: FieldError['source'];
    meta?: Record<string, unknown>;
  },
): FieldError {
  return {
    field,
    message,
    severity: options?.severity || DEFAULT_SEVERITY,
    code: options?.code,
    source: options?.source || 'validation',
    meta: options?.meta,
  };
}

/**
 * Merge multiple error arrays, removing duplicates
 * @param errorArrays - Arrays of formatted errors
 * @returns Merged array without duplicates
 */
export function mergeErrors(...errorArrays: FormattedError[][]): FormattedError[] {
  const seen = new Set<string>();
  const merged: FormattedError[] = [];

  for (const errors of errorArrays) {
    for (const error of errors) {
      const key = `${error.field}:${error.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(error);
      }
    }
  }

  return merged;
}

/**
 * Filter errors by severity
 * @param errors - Array of formatted errors
 * @param severity - Severity level to filter by
 * @returns Filtered errors
 */
export function filterErrorsBySeverity(
  errors: FormattedError[],
  severity: ErrorSeverity,
): FormattedError[] {
  return errors.filter((error) => error.severity === severity);
}

/**
 * Convert form errors object to a simple field-message map
 * @param errors - Form errors object
 * @returns Simple error map
 */
export function toErrorMap(errors: FormErrors): Record<string, string> {
  const map: Record<string, string> = {};

  for (const [field, error] of Object.entries(errors)) {
    if (typeof error === 'string') {
      map[field] = error;
    } else if (Array.isArray(error)) {
      const firstError = error[0];
      map[field] = typeof firstError === 'string' ? firstError : firstError.message;
    } else {
      map[field] = error.message;
    }
  }

  return map;
}
