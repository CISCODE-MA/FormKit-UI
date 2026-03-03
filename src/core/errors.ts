/**
 * Custom error classes for FormKit
 * Framework-FREE — no React imports allowed in this file
 */

/**
 * Base error class for FormKit errors
 */
export class FormKitError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'FORMKIT_ERROR') {
    super(message);
    this.name = 'FormKitError';
    this.code = code;
    Object.setPrototypeOf(this, FormKitError.prototype);
  }
}

/**
 * Error thrown when field validation fails
 */
export class FieldValidationError extends FormKitError {
  public readonly fieldKey: string;

  constructor(fieldKey: string, message: string) {
    super(message, 'FIELD_VALIDATION_ERROR');
    this.name = 'FieldValidationError';
    this.fieldKey = fieldKey;
    Object.setPrototypeOf(this, FieldValidationError.prototype);
  }
}

/**
 * Error thrown when form configuration is invalid
 */
export class ConfigurationError extends FormKitError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Error thrown when async validation fails due to network or timeout
 */
export class AsyncValidationError extends FormKitError {
  public readonly fieldKey: string;
  public readonly cause?: Error;

  constructor(fieldKey: string, message: string, cause?: Error) {
    super(message, 'ASYNC_VALIDATION_ERROR');
    this.name = 'AsyncValidationError';
    this.fieldKey = fieldKey;
    this.cause = cause;
    Object.setPrototypeOf(this, AsyncValidationError.prototype);
  }
}
