/**
 * Tests for React Hook Form adapter
 */

import { describe, it, expect } from 'vitest';
import {
  getFormKitProps,
  getInputProps,
  getTextareaProps,
  getSelectProps,
  getCheckboxProps,
  getRadioGroupProps,
  getErrorMessage,
  isTouched,
  isDirty,
  hasError,
} from '../react-hook-form';

// Mock React Hook Form controller
const createMockController = (
  overrides: {
    field?: Record<string, unknown>;
    fieldState?: Record<string, unknown>;
  } = {},
) => ({
  field: {
    onChange: () => {},
    onBlur: () => {},
    value: '',
    name: 'testField',
    ref: { current: null },
    ...(overrides.field || {}),
  },
  fieldState: {
    invalid: false,
    isTouched: false,
    isDirty: false,
    error: undefined,
    ...(overrides.fieldState || {}),
  },
});

describe('React Hook Form Adapter', () => {
  describe('getFormKitProps', () => {
    it('extracts basic field props', () => {
      const controller = createMockController();
      const props = getFormKitProps(controller);

      expect(props.name).toBe('testField');
      expect(props.value).toBe('');
      expect(props.isTouched).toBe(false);
      expect(props.isDirty).toBe(false);
      expect(props.hasError).toBe(false);
      expect(props.error).toBe(null);
    });

    it('includes error message when present', () => {
      const controller = createMockController({
        fieldState: {
          invalid: true,
          error: { message: 'Field is required' },
        },
      });
      const props = getFormKitProps(controller);

      expect(props.error).toBe('Field is required');
      expect(props.hasError).toBe(true);
    });

    it('includes touched state', () => {
      const controller = createMockController({
        fieldState: { isTouched: true },
      });
      const props = getFormKitProps(controller);

      expect(props.isTouched).toBe(true);
    });

    it('includes dirty state', () => {
      const controller = createMockController({
        fieldState: { isDirty: true },
      });
      const props = getFormKitProps(controller);

      expect(props.isDirty).toBe(true);
    });

    it('throws error for invalid controller', () => {
      expect(() => {
        getFormKitProps({});
      }).toThrow('Invalid React Hook Form controller provided');
    });

    it('throws error for null controller', () => {
      expect(() => {
        getFormKitProps(null);
      }).toThrow('Invalid React Hook Form controller provided');
    });
  });

  describe('getInputProps', () => {
    it('extracts input-specific props', () => {
      const controller = createMockController({
        field: { value: 'test value' },
      });
      const props = getInputProps(controller);

      expect(props.name).toBe('testField');
      expect(props.defaultValue).toBe('test value');
      expect(typeof props.onChange).toBe('function');
      expect(typeof props.onBlur).toBe('function');
    });

    it('handles text input change', () => {
      let capturedValue: unknown;
      const controller = createMockController({
        field: {
          onChange: (value: unknown) => {
            capturedValue = value;
          },
        },
      });
      const props = getInputProps(controller);

      const event = {
        target: { type: 'text', value: 'new value' },
      } as React.ChangeEvent<HTMLInputElement>;
      props.onChange(event);

      expect(capturedValue).toBe('new value');
    });

    it('handles number input change', () => {
      let capturedValue: unknown;
      const controller = createMockController({
        field: {
          onChange: (value: unknown) => {
            capturedValue = value;
          },
        },
      });
      const props = getInputProps(controller);

      const event = {
        target: { type: 'number', value: '42', valueAsNumber: 42 },
      } as React.ChangeEvent<HTMLInputElement>;
      props.onChange(event);

      expect(capturedValue).toBe(42);
    });
  });

  describe('getTextareaProps', () => {
    it('extracts textarea-specific props', () => {
      const controller = createMockController({
        field: { value: 'textarea content' },
      });
      const props = getTextareaProps(controller);

      expect(props.name).toBe('testField');
      expect(props.defaultValue).toBe('textarea content');
      expect(typeof props.onChange).toBe('function');
    });

    it('handles textarea change', () => {
      let capturedValue: unknown;
      const controller = createMockController({
        field: {
          onChange: (value: unknown) => {
            capturedValue = value;
          },
        },
      });
      const props = getTextareaProps(controller);

      const event = {
        target: { value: 'new content' },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      props.onChange(event);

      expect(capturedValue).toBe('new content');
    });
  });

  describe('getSelectProps', () => {
    it('extracts select-specific props', () => {
      const controller = createMockController({
        field: { value: 'option1' },
      });
      const props = getSelectProps(controller);

      expect(props.name).toBe('testField');
      expect(props.defaultValue).toBe('option1');
      expect(typeof props.onChange).toBe('function');
    });

    it('handles select change', () => {
      let capturedValue: unknown;
      const controller = createMockController({
        field: {
          onChange: (value: unknown) => {
            capturedValue = value;
          },
        },
      });
      const props = getSelectProps(controller);

      props.onChange('option2');

      expect(capturedValue).toBe('option2');
    });

    it('handles multiple select', () => {
      let capturedValue: unknown;
      const controller = createMockController({
        field: {
          value: ['option1', 'option2'],
          onChange: (value: unknown) => {
            capturedValue = value;
          },
        },
      });
      const props = getSelectProps(controller);

      expect(props.defaultValue).toEqual(['option1', 'option2']);
      props.onChange(['option1', 'option3']);
      expect(capturedValue).toEqual(['option1', 'option3']);
    });
  });

  describe('getCheckboxProps', () => {
    it('extracts checkbox-specific props', () => {
      const controller = createMockController({
        field: { value: true },
      });
      const props = getCheckboxProps(controller);

      expect(props.name).toBe('testField');
      expect(props.defaultChecked).toBe(true);
      expect(typeof props.onChange).toBe('function');
    });

    it('handles checkbox change', () => {
      let capturedValue: unknown;
      const controller = createMockController({
        field: {
          onChange: (value: unknown) => {
            capturedValue = value;
          },
        },
      });
      const props = getCheckboxProps(controller);

      props.onChange(true);

      expect(capturedValue).toBe(true);
    });
  });

  describe('getRadioGroupProps', () => {
    it('extracts radio group-specific props', () => {
      const controller = createMockController({
        field: { value: 'option1' },
      });
      const props = getRadioGroupProps(controller);

      expect(props.name).toBe('testField');
      expect(props.defaultValue).toBe('option1');
      expect(typeof props.onChange).toBe('function');
    });

    it('handles radio change', () => {
      let capturedValue: unknown;
      const controller = createMockController({
        field: {
          onChange: (value: unknown) => {
            capturedValue = value;
          },
        },
      });
      const props = getRadioGroupProps(controller);

      props.onChange('option2');

      expect(capturedValue).toBe('option2');
    });
  });

  describe('getErrorMessage', () => {
    it('returns error message when present', () => {
      const controller = createMockController({
        fieldState: {
          error: { message: 'Error message' },
        },
      });

      expect(getErrorMessage(controller)).toBe('Error message');
    });

    it('returns null when no error', () => {
      const controller = createMockController();
      expect(getErrorMessage(controller)).toBe(null);
    });

    it('returns null for invalid controller', () => {
      expect(getErrorMessage({})).toBe(null);
    });
  });

  describe('isTouched', () => {
    it('returns true when field is touched', () => {
      const controller = createMockController({
        fieldState: { isTouched: true },
      });

      expect(isTouched(controller)).toBe(true);
    });

    it('returns false when field is not touched', () => {
      const controller = createMockController();
      expect(isTouched(controller)).toBe(false);
    });

    it('returns false for invalid controller', () => {
      expect(isTouched({})).toBe(false);
    });
  });

  describe('isDirty', () => {
    it('returns true when field is dirty', () => {
      const controller = createMockController({
        fieldState: { isDirty: true },
      });

      expect(isDirty(controller)).toBe(true);
    });

    it('returns false when field is not dirty', () => {
      const controller = createMockController();
      expect(isDirty(controller)).toBe(false);
    });

    it('returns false for invalid controller', () => {
      expect(isDirty({})).toBe(false);
    });
  });

  describe('hasError', () => {
    it('returns true when field is invalid', () => {
      const controller = createMockController({
        fieldState: { invalid: true },
      });

      expect(hasError(controller)).toBe(true);
    });

    it('returns false when field is valid', () => {
      const controller = createMockController();
      expect(hasError(controller)).toBe(false);
    });

    it('returns false for invalid controller', () => {
      expect(hasError({})).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('handles complete field lifecycle', () => {
      let currentValue = '';
      const controller = createMockController({
        field: {
          value: currentValue,
          onChange: (value: unknown) => {
            currentValue = value as string;
          },
        },
        fieldState: {
          isTouched: false,
          isDirty: false,
        },
      });

      const props = getInputProps(controller);
      expect(props.defaultValue).toBe('');

      // Simulate user input
      const event = {
        target: { type: 'text', value: 'new value' },
      } as React.ChangeEvent<HTMLInputElement>;
      props.onChange(event);

      expect(currentValue).toBe('new value');
    });

    it('handles error state changes', () => {
      const withoutError = createMockController();
      expect(hasError(withoutError)).toBe(false);
      expect(getErrorMessage(withoutError)).toBe(null);

      const withError = createMockController({
        fieldState: {
          invalid: true,
          error: { message: 'Required field' },
        },
      });
      expect(hasError(withError)).toBe(true);
      expect(getErrorMessage(withError)).toBe('Required field');
    });

    it('handles different value types', () => {
      // String
      const stringController = createMockController({
        field: { value: 'text' },
      });
      expect(getFormKitProps(stringController).value).toBe('text');

      // Number
      const numberController = createMockController({
        field: { value: 42 },
      });
      expect(getFormKitProps(numberController).value).toBe(42);

      // Boolean
      const boolController = createMockController({
        field: { value: true },
      });
      expect(getFormKitProps(boolController).value).toBe(true);

      // Array
      const arrayController = createMockController({
        field: { value: ['a', 'b'] },
      });
      expect(getFormKitProps(arrayController).value).toEqual(['a', 'b']);
    });
  });

  describe('edge cases', () => {
    it('handles undefined error object', () => {
      const controller = createMockController({
        fieldState: {
          error: undefined,
        },
      });

      expect(getErrorMessage(controller)).toBe(null);
    });

    it('handles error without message', () => {
      const controller = createMockController({
        fieldState: {
          error: {},
        },
      });

      expect(getErrorMessage(controller)).toBe(null);
    });

    it('handles empty string value', () => {
      const controller = createMockController({
        field: { value: '' },
      });

      expect(getFormKitProps(controller).value).toBe('');
    });

    it('handles null value', () => {
      const controller = createMockController({
        field: { value: null },
      });

      expect(getFormKitProps(controller).value).toBe(null);
    });

    it('handles all states simultaneously', () => {
      const controller = createMockController({
        field: { value: 'test', name: 'complexField' },
        fieldState: {
          invalid: true,
          isTouched: true,
          isDirty: true,
          error: { message: 'Complex error' },
        },
      });

      expect(isTouched(controller)).toBe(true);
      expect(isDirty(controller)).toBe(true);
      expect(hasError(controller)).toBe(true);
      expect(getErrorMessage(controller)).toBe('Complex error');
    });
  });
});
