/**
 * Field Generator - Dynamically generate form fields from configuration
 */

import type { ReactElement } from 'react';
import type { ValidationRule } from '../validation/types';
import type {
  FieldValue,
  InputConfig,
  TextareaConfig,
  SelectConfig,
  CheckboxConfig,
  RadioGroupConfig,
} from '../utils/types';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { RadioGroup } from './RadioGroup';

/**
 * Union of all field config types
 */
export type FieldConfiguration =
  | ({ fieldType: 'input' } & InputConfig)
  | ({ fieldType: 'textarea' } & TextareaConfig)
  | ({ fieldType: 'select' } & SelectConfig)
  | ({ fieldType: 'checkbox' } & CheckboxConfig)
  | ({ fieldType: 'radio' } & RadioGroupConfig);

/**
 * Extended field configuration with validation
 */
export interface FieldGeneratorConfig {
  /** Base field configuration */
  config: FieldConfiguration;
  /** Validation rules to apply */
  validationRules?: ValidationRule[];
  /** When to validate */
  validateOn?: 'change' | 'blur' | 'submit';
  /** Debounce validation (ms) */
  debounce?: number;
  /** Show error message */
  showError?: boolean;
  /** Auto-dismiss errors after delay (ms) */
  autoDismissError?: number;
  /** Change handler */
  onChange?: (value: FieldValue) => void;
  /** Blur handler */
  onBlur?: () => void;
}

/**
 * Type guard to check if config is InputConfig
 */
export function isInputConfig(
  config: FieldConfiguration,
): config is { fieldType: 'input' } & InputConfig {
  return config.fieldType === 'input';
}

/**
 * Type guard to check if config is TextareaConfig
 */
export function isTextareaConfig(
  config: FieldConfiguration,
): config is { fieldType: 'textarea' } & TextareaConfig {
  return config.fieldType === 'textarea';
}

/**
 * Type guard to check if config is SelectConfig
 */
export function isSelectConfig(
  config: FieldConfiguration,
): config is { fieldType: 'select' } & SelectConfig {
  return config.fieldType === 'select';
}

/**
 * Type guard to check if config is CheckboxConfig
 */
export function isCheckboxConfig(
  config: FieldConfiguration,
): config is { fieldType: 'checkbox' } & CheckboxConfig {
  return config.fieldType === 'checkbox';
}

/**
 * Type guard to check if config is RadioGroupConfig
 */
export function isRadioGroupConfig(
  config: FieldConfiguration,
): config is { fieldType: 'radio' } & RadioGroupConfig {
  return config.fieldType === 'radio';
}

/**
 * Generate a single form field from configuration
 *
 * @param config - Field generator configuration
 * @returns React element for the field
 *
 * @example
 * ```tsx
 * const field = generateField({
 *   config: {
 *     fieldType: 'input',
 *     name: 'email',
 *     type: 'email',
 *     label: 'Email Address',
 *     required: true,
 *   },
 *   validationRules: [{ type: 'email' }],
 * });
 * ```
 */
export function generateField(config: FieldGeneratorConfig): ReactElement {
  const {
    config: fieldConfig,
    validationRules,
    validateOn,
    debounce,
    showError,
    autoDismissError,
    onChange,
    onBlur,
  } = config;

  // Input field
  if (isInputConfig(fieldConfig)) {
    return (
      <Input
        key={fieldConfig.name}
        name={fieldConfig.name}
        type={fieldConfig.type}
        label={fieldConfig.label}
        placeholder={fieldConfig.placeholder}
        defaultValue={fieldConfig.defaultValue as string | number | undefined}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
        readOnly={fieldConfig.readOnly}
        className={fieldConfig.className}
        maxLength={fieldConfig.maxLength}
        min={fieldConfig.min}
        max={fieldConfig.max}
        step={fieldConfig.step}
        pattern={fieldConfig.pattern}
        autoComplete={fieldConfig.autoComplete}
        hint={fieldConfig.hint}
        validationRules={validationRules}
        validateOn={validateOn}
        debounce={debounce}
        showError={showError}
        autoDismissError={autoDismissError}
        onChange={onChange as ((value: string | number) => void) | undefined}
        onBlur={onBlur}
      />
    );
  }

  // Textarea field
  if (isTextareaConfig(fieldConfig)) {
    return (
      <Textarea
        key={fieldConfig.name}
        name={fieldConfig.name}
        label={fieldConfig.label}
        placeholder={fieldConfig.placeholder}
        defaultValue={fieldConfig.defaultValue as string | undefined}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
        readOnly={fieldConfig.readOnly}
        className={fieldConfig.className}
        rows={fieldConfig.rows}
        cols={fieldConfig.cols}
        maxLength={fieldConfig.maxLength}
        autoResize={fieldConfig.autoResize}
        showCount={fieldConfig.showCount}
        hint={fieldConfig.hint}
        validationRules={validationRules}
        validateOn={validateOn}
        debounce={debounce}
        showError={showError}
        autoDismissError={autoDismissError}
        onChange={onChange as ((value: string) => void) | undefined}
        onBlur={onBlur}
      />
    );
  }

  // Select field
  if (isSelectConfig(fieldConfig)) {
    return (
      <Select
        key={fieldConfig.name}
        name={fieldConfig.name}
        options={fieldConfig.options}
        label={fieldConfig.label}
        placeholder={fieldConfig.placeholder}
        emptyLabel={fieldConfig.emptyLabel}
        defaultValue={fieldConfig.defaultValue as string | number | string[] | number[] | undefined}
        multiple={fieldConfig.multiple}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
        readOnly={fieldConfig.readOnly}
        className={fieldConfig.className}
        hint={fieldConfig.hint}
        validationRules={validationRules}
        validateOn={validateOn}
        debounce={debounce}
        showError={showError}
        autoDismissError={autoDismissError}
        onChange={onChange as ((value: string | number | string[] | number[]) => void) | undefined}
        onBlur={onBlur}
      />
    );
  }

  // Checkbox field
  if (isCheckboxConfig(fieldConfig)) {
    return (
      <Checkbox
        key={fieldConfig.name}
        name={fieldConfig.name}
        label={fieldConfig.label}
        checkboxLabel={fieldConfig.checkboxLabel}
        defaultChecked={fieldConfig.defaultValue as boolean | undefined}
        indeterminate={fieldConfig.indeterminate}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
        readOnly={fieldConfig.readOnly}
        className={fieldConfig.className}
        hint={fieldConfig.hint}
        validationRules={validationRules}
        validateOn={validateOn}
        debounce={debounce}
        showError={showError}
        autoDismissError={autoDismissError}
        onChange={onChange as ((value: boolean) => void) | undefined}
        onBlur={onBlur}
      />
    );
  }

  // Radio group field
  if (isRadioGroupConfig(fieldConfig)) {
    return (
      <RadioGroup
        key={fieldConfig.name}
        name={fieldConfig.name}
        options={fieldConfig.options}
        label={fieldConfig.label}
        direction={fieldConfig.direction}
        defaultValue={fieldConfig.defaultValue as string | number | undefined}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
        readOnly={fieldConfig.readOnly}
        className={fieldConfig.className}
        hint={fieldConfig.hint}
        validationRules={validationRules}
        validateOn={validateOn}
        debounce={debounce}
        showError={showError}
        autoDismissError={autoDismissError}
        onChange={onChange as ((value: string | number) => void) | undefined}
        onBlur={onBlur}
      />
    );
  }

  // Should never reach here with proper typing
  throw new Error(`Unknown field type: ${JSON.stringify(fieldConfig)}`);
}

/**
 * Generate multiple form fields from an array of configurations
 *
 * @param configs - Array of field generator configurations
 * @returns Array of React elements
 *
 * @example
 * ```tsx
 * const fields = generateFields([
 *   {
 *     config: { fieldType: 'input', name: 'firstName', label: 'First Name' },
 *   },
 *   {
 *     config: { fieldType: 'input', name: 'lastName', label: 'Last Name' },
 *   },
 * ]);
 * ```
 */
export function generateFields(configs: FieldGeneratorConfig[]): ReactElement[] {
  return configs.map((config) => generateField(config));
}

/**
 * Generate form fields from a configuration map
 *
 * @param configMap - Object mapping field names to configurations
 * @returns Array of React elements
 *
 * @example
 * ```tsx
 * const fields = generateFieldsFromMap({
 *   email: {
 *     config: { fieldType: 'input', name: 'email', type: 'email', label: 'Email' },
 *     validationRules: [{ type: 'email' }],
 *   },
 *   bio: {
 *     config: { fieldType: 'textarea', name: 'bio', label: 'Bio' },
 *   },
 * });
 * ```
 */
export function generateFieldsFromMap(
  configMap: Record<string, FieldGeneratorConfig>,
): ReactElement[] {
  return Object.values(configMap).map((config) => generateField(config));
}

/**
 * Create a field configuration builder for fluent API
 *
 * @example
 * ```tsx
 * const field = createFieldBuilder('email')
 *   .input('email')
 *   .label('Email Address')
 *   .required()
 *   .validation([{ type: 'email' }])
 *   .build();
 * ```
 */
export class FieldBuilder {
  private fieldConfig: Partial<FieldConfiguration> = {};
  private generatorConfig: Partial<FieldGeneratorConfig> = {};

  constructor(name: string) {
    this.fieldConfig.name = name;
  }

  /**
   * Set field type to input
   */
  input(type?: InputConfig['type']): this {
    this.fieldConfig = { ...this.fieldConfig, fieldType: 'input', type } as FieldConfiguration;
    return this;
  }

  /**
   * Set field type to textarea
   */
  textarea(): this {
    this.fieldConfig = { ...this.fieldConfig, fieldType: 'textarea' } as FieldConfiguration;
    return this;
  }

  /**
   * Set field type to select
   */
  select(options: SelectConfig['options'], multiple?: boolean): this {
    this.fieldConfig = {
      ...this.fieldConfig,
      fieldType: 'select',
      options,
      multiple,
    } as FieldConfiguration;
    return this;
  }

  /**
   * Set field type to checkbox
   */
  checkbox(): this {
    this.fieldConfig = { ...this.fieldConfig, fieldType: 'checkbox' } as FieldConfiguration;
    return this;
  }

  /**
   * Set field type to radio
   */
  radio(options: RadioGroupConfig['options'], direction?: 'horizontal' | 'vertical'): this {
    this.fieldConfig = {
      ...this.fieldConfig,
      fieldType: 'radio',
      options,
      direction,
    } as FieldConfiguration;
    return this;
  }

  /**
   * Set field label
   */
  label(label: string): this {
    this.fieldConfig.label = label;
    return this;
  }

  /**
   * Set field placeholder
   */
  placeholder(placeholder: string): this {
    this.fieldConfig.placeholder = placeholder;
    return this;
  }

  /**
   * Set field hint
   */
  hint(hint: string): this {
    this.fieldConfig.hint = hint;
    return this;
  }

  /**
   * Set default value
   */
  defaultValue(value: FieldValue): this {
    this.fieldConfig.defaultValue = value;
    return this;
  }

  /**
   * Mark field as required
   */
  required(required = true): this {
    this.fieldConfig.required = required;
    return this;
  }

  /**
   * Set field disabled state
   */
  disabled(disabled = true): this {
    this.fieldConfig.disabled = disabled;
    return this;
  }

  /**
   * Set field read-only state
   */
  readOnly(readOnly = true): this {
    this.fieldConfig.readOnly = readOnly;
    return this;
  }

  /**
   * Set custom class name
   */
  className(className: string): this {
    this.fieldConfig.className = className;
    return this;
  }

  /**
   * Set validation rules
   */
  validation(rules: ValidationRule[]): this {
    this.generatorConfig.validationRules = rules;
    return this;
  }

  /**
   * Set validation trigger
   */
  validateOn(trigger: 'change' | 'blur' | 'submit'): this {
    this.generatorConfig.validateOn = trigger;
    return this;
  }

  /**
   * Set debounce delay
   */
  debounce(ms: number): this {
    this.generatorConfig.debounce = ms;
    return this;
  }

  /**
   * Show error messages
   */
  showError(show = true): this {
    this.generatorConfig.showError = show;
    return this;
  }

  /**
   * Set auto-dismiss error delay
   */
  autoDismissError(ms: number): this {
    this.generatorConfig.autoDismissError = ms;
    return this;
  }

  /**
   * Set change handler
   */
  onChange(handler: (value: FieldValue) => void): this {
    this.generatorConfig.onChange = handler;
    return this;
  }

  /**
   * Set blur handler
   */
  onBlur(handler: () => void): this {
    this.generatorConfig.onBlur = handler;
    return this;
  }

  /**
   * Build the field generator configuration
   */
  buildConfig(): FieldGeneratorConfig {
    if (!this.fieldConfig.name || !('fieldType' in this.fieldConfig)) {
      throw new Error('Field name and type are required');
    }

    return {
      config: this.fieldConfig as FieldConfiguration,
      ...this.generatorConfig,
    };
  }

  /**
   * Build and generate the field element
   */
  build(): ReactElement {
    return generateField(this.buildConfig());
  }
}

/**
 * Create a new field builder
 *
 * @param name - Field name
 * @returns Field builder instance
 *
 * @example
 * ```tsx
 * const emailField = createFieldBuilder('email')
 *   .input('email')
 *   .label('Email Address')
 *   .required()
 *   .build();
 * ```
 */
export function createFieldBuilder(name: string): FieldBuilder {
  return new FieldBuilder(name);
}
