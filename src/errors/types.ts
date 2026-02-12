/**
 * Error type definitions for FormKit UI
 */

/**
 * Error severity levels
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Source of the error
 */
export type ErrorSource = 'validation' | 'submission' | 'network' | 'custom';

/**
 * Form field error
 */
export interface FieldError {
  /** Field name that has the error */
  field: string;
  /** Error message */
  message: string;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Error source/type */
  source?: ErrorSource;
  /** Error code for programmatic handling */
  code?: string;
  /** Additional error metadata */
  meta?: Record<string, unknown>;
}

/**
 * Multiple field errors
 */
export interface FormErrors {
  /** Field name to error message mapping */
  [fieldName: string]: string | string[] | FieldError | FieldError[];
}

/**
 * Error formatting options
 */
export interface ErrorFormatterOptions {
  /** Show error code in message */
  showCode?: boolean;
  /** Prefix for error messages */
  prefix?: string;
  /** Custom error message templates */
  templates?: Record<string, string>;
}

/**
 * Result from error formatting
 */
export interface FormattedError {
  /** Formatted error message */
  message: string;
  /** Field name */
  field: string;
  /** Error severity */
  severity: ErrorSeverity;
  /** Original error if available */
  original?: unknown;
}

/**
 * Error handler callback
 */
export type ErrorHandler = (error: FieldError | FormErrors) => void;

/**
 * Error display configuration
 */
export interface ErrorDisplayConfig {
  /** Show errors inline with fields */
  inline?: boolean;
  /** Show errors in a summary at top */
  summary?: boolean;
  /** Animate error appearance */
  animate?: boolean;
  /** Auto-dismiss errors after delay (ms) */
  autoDismiss?: number;
  /** Custom error renderer */
  render?: (error: FormattedError) => React.ReactNode;
}

/**
 * External library error types (for adapters)
 */

/**
 * Generic validation error from external library
 */
export interface ExternalValidationError {
  /** Error message */
  message: string;
  /** Field path/name */
  path?: string | string[];
  /** Error type/code */
  type?: string;
  /** Additional error details */
  [key: string]: unknown;
}
