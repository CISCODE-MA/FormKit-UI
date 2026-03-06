/**
 * Core type definitions for FormKit UI
 * Framework-FREE — no React imports allowed in this file
 */

/**
 * Field types supported by DynamicForm
 *
 * @example
 * ```typescript
 * const fields: FieldConfig[] = [
 *   { key: 'email', label: 'Email', type: FieldType.EMAIL },
 *   { key: 'role', label: 'Role', type: FieldType.SELECT, options: [...] },
 * ];
 * ```
 */
export enum FieldType {
  /** Single-line text input */
  TEXT = 'text',
  /** Email input with validation */
  EMAIL = 'email',
  /** Password input (masked) */
  PASSWORD = 'password',
  /** Numeric input */
  NUMBER = 'number',
  /** Multi-line text area */
  TEXTAREA = 'textarea',
  /** Dropdown select */
  SELECT = 'select',
  /** Multi-select with checkboxes */
  MULTI_SELECT = 'multi-select',
  /** Single checkbox (boolean) */
  CHECKBOX = 'checkbox',
  /** Radio button group */
  RADIO = 'radio',
  /** Toggle switch (boolean) */
  SWITCH = 'switch',
  /** Date picker */
  DATE = 'date',
  /** File upload */
  FILE = 'file',
  /** Phone number with country code */
  PHONE = 'phone',
  /** Repeatable field group */
  ARRAY = 'array',
}

/**
 * Conditional rule operators for showWhen/hideWhen
 *
 * - `equals`: Field value equals the specified value
 * - `not_equals`: Field value does not equal the specified value
 * - `contains`: Field value contains the specified substring (strings only)
 * - `is_empty`: Field is empty, null, or undefined
 * - `is_not_empty`: Field has a non-empty value
 * - `gt`: Field value is greater than the specified number
 * - `lt`: Field value is less than the specified number
 */
export type ConditionalOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'is_empty'
  | 'is_not_empty'
  | 'gt'
  | 'lt';

/**
 * Conditional rule for field visibility
 */
export interface ConditionalRule {
  /** Field key to check */
  readonly field: string;
  /** Comparison operator */
  readonly operator: ConditionalOperator;
  /** Value to compare against (not required for is_empty/is_not_empty) */
  readonly value?: unknown;
}

/**
 * Possible field value types
 */
export type FieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | File
  | File[]
  | string[]
  | number[]
  | FieldValue[]
  | Record<string, unknown>
  | Record<string, unknown>[];

/**
 * Form values object
 */
export type FormValues = Record<string, FieldValue>;

/**
 * HTML input types supported by FormKit
 */
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'color';

/**
 * Validation trigger timing
 */
export type ValidationMode = 'onSubmit' | 'onChange' | 'onBlur';

/**
 * Default configuration constants
 */
export const DEFAULT_DEBOUNCE_MS = 300;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
