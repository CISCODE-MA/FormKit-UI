/**
 * Core type definitions for FormKit UI
 * Framework-FREE — no React imports allowed in this file
 */

/**
 * Field types supported by DynamicForm
 */
export enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NUMBER = 'number',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTI_SELECT = 'multi-select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SWITCH = 'switch',
  DATE = 'date',
  FILE = 'file',
  ARRAY = 'array',
}

/**
 * Conditional rule operators for showWhen/hideWhen
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
