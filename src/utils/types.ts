/**
 * Base type definitions for FormKit UI
 */

/**
 * Possible field value types
 */
export type FieldValue = string | number | boolean | null | undefined | File | File[];

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
 * Field state describing user interaction
 */
export interface FieldState {
  /** Current field value */
  value: FieldValue;
  /** Whether the field has been touched (focused then blurred) */
  touched: boolean;
  /** Whether the field value has changed from initial */
  dirty: boolean;
  /** Whether the field is currently disabled */
  disabled: boolean;
  /** Whether the field is read-only */
  readOnly: boolean;
}

/**
 * Base configuration for a form field
 */
export interface FieldConfig {
  /** Unique field identifier */
  name: string;
  /** Field label for display */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Help text or hint */
  hint?: string;
  /** Default/initial value */
  defaultValue?: FieldValue;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Custom CSS class name */
  className?: string;
}

/**
 * Configuration for input fields specifically
 */
export interface InputConfig extends FieldConfig {
  /** Input type */
  type?: InputType;
  /** Maximum length for text inputs */
  maxLength?: number;
  /** Minimum value for number inputs */
  min?: number;
  /** Maximum value for number inputs */
  max?: number;
  /** Step value for number inputs */
  step?: number;
  /** Pattern for validation (regex string) */
  pattern?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
}

/**
 * Configuration for textarea fields
 */
export interface TextareaConfig extends FieldConfig {
  /** Number of visible text rows */
  rows?: number;
  /** Number of visible text columns */
  cols?: number;
  /** Maximum length */
  maxLength?: number;
  /** Whether to auto-resize based on content */
  autoResize?: boolean;
  /** Show character count */
  showCount?: boolean;
}

/**
 * Option for select, radio, or checkbox groups
 */
export interface FieldOption {
  /** Option value */
  value: string | number;
  /** Option display label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
}

/**
 * Configuration for select fields
 */
export interface SelectConfig extends FieldConfig {
  /** Available options */
  options: FieldOption[];
  /** Allow multiple selections */
  multiple?: boolean;
  /** Placeholder for empty selection */
  emptyLabel?: string;
}

/**
 * Configuration for checkbox fields
 */
export interface CheckboxConfig extends FieldConfig {
  /** Checkbox label (can differ from field label) */
  checkboxLabel?: string;
  /** Whether checkbox is in indeterminate state */
  indeterminate?: boolean;
}

/**
 * Configuration for radio group
 */
export interface RadioGroupConfig extends FieldConfig {
  /** Available radio options */
  options: FieldOption[];
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
}
