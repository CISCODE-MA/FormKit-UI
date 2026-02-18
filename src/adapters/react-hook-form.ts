/**
 * React Hook Form adapter for FormKit UI
 * Provides hooks and utilities to integrate FormKit components with React Hook Form
 */

import type { FieldValue } from '../utils/types';

/**
 * Type guard to check if React Hook Form is available
 */
function isReactHookFormController(controller: unknown): controller is {
  field: {
    onChange: (value: unknown) => void;
    onBlur: () => void;
    value: unknown;
    name: string;
    ref: React.Ref<unknown>;
  };
  fieldState: {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
    error?: { message?: string };
  };
} {
  return (
    typeof controller === 'object' &&
    controller !== null &&
    'field' in controller &&
    'fieldState' in controller
  );
}

/**
 * Convert React Hook Form controller props to FormKit field props
 * @param controller - React Hook Form controller object from useController
 * @returns Props object for FormKit components
 */
export function getFormKitProps(controller: unknown) {
  if (!isReactHookFormController(controller)) {
    throw new Error(
      'Invalid React Hook Form controller provided. Make sure you are passing the result from useController.',
    );
  }

  const { field, fieldState } = controller;

  return {
    name: field.name,
    value: field.value as FieldValue,
    onChange: field.onChange,
    onBlur: field.onBlur,
    ref: field.ref,
    error: fieldState.error?.message ?? null,
    isTouched: fieldState.isTouched,
    isDirty: fieldState.isDirty,
    hasError: fieldState.invalid,
  };
}

/**
 * Helper to extract field props for Input components
 * @param controller - React Hook Form controller object
 * @returns Props for Input component
 */
export function getInputProps(controller: unknown) {
  const props = getFormKitProps(controller);
  return {
    name: props.name,
    defaultValue: props.value as string | number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'number' ? e.target.valueAsNumber : e.target.value;
      props.onChange(value);
    },
    onBlur: props.onBlur,
    ref: props.ref as React.Ref<HTMLInputElement>,
  };
}

/**
 * Helper to extract field props for Textarea components
 * @param controller - React Hook Form controller object
 * @returns Props for Textarea component
 */
export function getTextareaProps(controller: unknown) {
  const props = getFormKitProps(controller);
  return {
    name: props.name,
    defaultValue: props.value as string,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      props.onChange(e.target.value);
    },
    onBlur: props.onBlur,
    ref: props.ref as React.Ref<HTMLTextAreaElement>,
  };
}

/**
 * Helper to extract field props for Select components
 * @param controller - React Hook Form controller object
 * @returns Props for Select component
 */
export function getSelectProps(controller: unknown) {
  const props = getFormKitProps(controller);
  return {
    name: props.name,
    defaultValue: props.value as string | number | string[] | number[],
    onChange: (value: string | number | string[] | number[]) => {
      props.onChange(value);
    },
    onBlur: props.onBlur,
    ref: props.ref as React.Ref<HTMLSelectElement>,
  };
}

/**
 * Helper to extract field props for Checkbox components
 * @param controller - React Hook Form controller object
 * @returns Props for Checkbox component
 */
export function getCheckboxProps(controller: unknown) {
  const props = getFormKitProps(controller);
  return {
    name: props.name,
    defaultChecked: props.value as boolean,
    onChange: (checked: boolean) => {
      props.onChange(checked);
    },
    onBlur: props.onBlur,
    ref: props.ref as React.Ref<HTMLInputElement>,
  };
}

/**
 * Helper to extract field props for RadioGroup components
 * @param controller - React Hook Form controller object
 * @returns Props for RadioGroup component
 */
export function getRadioGroupProps(controller: unknown) {
  const props = getFormKitProps(controller);
  return {
    name: props.name,
    defaultValue: props.value as string | number,
    onChange: (value: string | number) => {
      props.onChange(value);
    },
    onBlur: props.onBlur,
    ref: props.ref as React.Ref<HTMLFieldSetElement>,
  };
}

/**
 * Get error message from React Hook Form controller
 * @param controller - React Hook Form controller object
 * @returns Error message or null
 */
export function getErrorMessage(controller: unknown): string | null {
  if (!isReactHookFormController(controller)) {
    return null;
  }
  return controller.fieldState.error?.message ?? null;
}

/**
 * Check if field is touched in React Hook Form
 * @param controller - React Hook Form controller object
 * @returns True if field is touched
 */
export function isTouched(controller: unknown): boolean {
  if (!isReactHookFormController(controller)) {
    return false;
  }
  return controller.fieldState.isTouched;
}

/**
 * Check if field is dirty in React Hook Form
 * @param controller - React Hook Form controller object
 * @returns True if field is dirty
 */
export function isDirty(controller: unknown): boolean {
  if (!isReactHookFormController(controller)) {
    return false;
  }
  return controller.fieldState.isDirty;
}

/**
 * Check if field has error in React Hook Form
 * @param controller - React Hook Form controller object
 * @returns True if field has error
 */
export function hasError(controller: unknown): boolean {
  if (!isReactHookFormController(controller)) {
    return false;
  }
  return controller.fieldState.invalid;
}
