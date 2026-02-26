/**
 * Tests for Field Generator utilities
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  generateField,
  generateFields,
  generateFieldsFromMap,
  createFieldBuilder,
  isInputConfig,
  isTextareaConfig,
  isSelectConfig,
  isCheckboxConfig,
  isRadioGroupConfig,
  type FieldGeneratorConfig,
  type FieldConfiguration,
} from '../fieldGenerator';
import { email, minLength, min } from '../../validation/validators';

describe('fieldGenerator', () => {
  describe('Type Guards', () => {
    it('should identify input config', () => {
      const config: FieldConfiguration = {
        fieldType: 'input',
        name: 'test',
        type: 'text',
      };

      expect(isInputConfig(config)).toBe(true);
      expect(isTextareaConfig(config)).toBe(false);
      expect(isSelectConfig(config)).toBe(false);
      expect(isCheckboxConfig(config)).toBe(false);
      expect(isRadioGroupConfig(config)).toBe(false);
    });

    it('should identify textarea config', () => {
      const config: FieldConfiguration = {
        fieldType: 'textarea',
        name: 'test',
      };

      expect(isTextareaConfig(config)).toBe(true);
      expect(isInputConfig(config)).toBe(false);
    });

    it('should identify select config', () => {
      const config: FieldConfiguration = {
        fieldType: 'select',
        name: 'test',
        options: [],
      };

      expect(isSelectConfig(config)).toBe(true);
      expect(isInputConfig(config)).toBe(false);
    });

    it('should identify checkbox config', () => {
      const config: FieldConfiguration = {
        fieldType: 'checkbox',
        name: 'test',
      };

      expect(isCheckboxConfig(config)).toBe(true);
      expect(isInputConfig(config)).toBe(false);
    });

    it('should identify radio config', () => {
      const config: FieldConfiguration = {
        fieldType: 'radio',
        name: 'test',
        options: [],
      };

      expect(isRadioGroupConfig(config)).toBe(true);
      expect(isInputConfig(config)).toBe(false);
    });
  });

  describe('generateField', () => {
    it('should generate input field', () => {
      const config: FieldGeneratorConfig = {
        config: {
          fieldType: 'input',
          name: 'username',
          label: 'Username',
          type: 'text',
          required: true,
        },
      };

      render(<>{generateField(config)}</>);
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('should generate input field with validation rules', () => {
      const config: FieldGeneratorConfig = {
        config: {
          fieldType: 'input',
          name: 'email',
          label: 'Email',
          type: 'email',
        },
        validationRules: [{ validator: email() }],
        validateOn: 'blur',
        showError: true,
      };

      render(<>{generateField(config)}</>);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should generate input field with all props', () => {
      const onChange = vi.fn();
      const onBlur = vi.fn();

      const config: FieldGeneratorConfig = {
        config: {
          fieldType: 'input',
          name: 'age',
          label: 'Age',
          type: 'number',
          placeholder: 'Enter age',
          hint: 'Must be 18+',
          defaultValue: 25,
          required: true,
          disabled: false,
          readOnly: false,
          className: 'custom-input',
          min: 18,
          max: 100,
          step: 1,
        },
        validationRules: [{ validator: min(18) }],
        validateOn: 'change',
        debounce: 300,
        showError: true,
        autoDismissError: 5000,
        onChange,
        onBlur,
      };

      render(<>{generateField(config)}</>);
      const input = screen.getByLabelText(/age/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '18');
      expect(input).toHaveAttribute('max', '100');
      expect(screen.getByText('Must be 18+')).toBeInTheDocument();
    });

    it('should generate textarea field', () => {
      const config: FieldGeneratorConfig = {
        config: {
          fieldType: 'textarea',
          name: 'bio',
          label: 'Biography',
          placeholder: 'Tell us about yourself',
          rows: 5,
        },
      };

      render(<>{generateField(config)}</>);
      expect(screen.getByLabelText(/biography/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
    });

    it('should generate textarea field with all props', () => {
      const onChange = vi.fn();

      const config: FieldGeneratorConfig = {
        config: {
          fieldType: 'textarea',
          name: 'description',
          label: 'Description',
          placeholder: 'Enter description',
          defaultValue: 'Initial text',
          required: true,
          disabled: false,
          readOnly: false,
          className: 'custom-textarea',
          rows: 10,
          cols: 50,
          maxLength: 500,
          autoResize: true,
          showCount: true,
          hint: 'Max 500 characters',
        },
        onChange,
      };

      render(<>{generateField(config)}</>);
      const textarea = screen.getByLabelText(/description/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('maxlength', '500');
    });

    it('should generate select field', () => {
      const config: FieldGeneratorConfig = {
        config: {
          fieldType: 'select',
          name: 'country',
          label: 'Country',
          options: [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
          ],
        },
      };

      render(<>{generateField(config)}</>);
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should generate select field with multiple selection', () => {
      const config: FieldGeneratorConfig = {
        config: {
          fieldType: 'select',
          name: 'languages',
          label: 'Languages',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
          ],
          multiple: true,
          emptyLabel: 'Select languages',
        },
      };

      render(<>{generateField(config)}</>);
      expect(screen.getByLabelText(/languages/i)).toBeInTheDocument();
    });

    it('should generate checkbox field', () => {
      const config: FieldGeneratorConfig = {
        config: {
          fieldType: 'checkbox',
          name: 'terms',
          label: 'Terms',
          checkboxLabel: 'I agree to terms',
          required: true,
        },
      };

      render(<>{generateField(config)}</>);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText(/i agree to terms/i)).toBeInTheDocument();
    });

    it('should generate checkbox field with all props', () => {
      const onChange = vi.fn();

      const config: FieldGeneratorConfig = {
        config: {
          fieldType: 'checkbox',
          name: 'subscribe',
          label: 'Subscription',
          checkboxLabel: 'Subscribe to newsletter',
          defaultValue: true,
          indeterminate: false,
          required: false,
          disabled: false,
          readOnly: false,
          className: 'custom-checkbox',
          hint: 'You can unsubscribe anytime',
        },
        onChange,
      };

      render(<>{generateField(config)}</>);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should generate radio group field', () => {
      const config: FieldGeneratorConfig = {
        config: {
          fieldType: 'radio',
          name: 'size',
          label: 'Size',
          options: [
            { value: 's', label: 'Small' },
            { value: 'm', label: 'Medium' },
            { value: 'l', label: 'Large' },
          ],
          direction: 'horizontal',
        },
      };

      render(<>{generateField(config)}</>);
      expect(screen.getByText(/size/i)).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('should generate radio group field with all props', () => {
      const onChange = vi.fn();

      const config: FieldGeneratorConfig = {
        config: {
          fieldType: 'radio',
          name: 'plan',
          label: 'Subscription Plan',
          options: [
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
            { value: 'enterprise', label: 'Enterprise' },
          ],
          direction: 'vertical',
          defaultValue: 'free',
          required: true,
          disabled: false,
          readOnly: false,
          className: 'custom-radio',
          hint: 'Choose wisely',
        },
        onChange,
      };

      render(<>{generateField(config)}</>);
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('should throw error for unknown field type', () => {
      const invalidConfig = {
        config: {
          fieldType: 'unknown',
          name: 'test',
        } as unknown as FieldConfiguration,
      };

      expect(() => render(<>{generateField(invalidConfig)}</>)).toThrow('Unknown field type');
    });
  });

  describe('generateFields', () => {
    it('should generate multiple fields from array', () => {
      const configs: FieldGeneratorConfig[] = [
        {
          config: {
            fieldType: 'input',
            name: 'firstName',
            label: 'First Name',
          },
        },
        {
          config: {
            fieldType: 'input',
            name: 'lastName',
            label: 'Last Name',
          },
        },
        {
          config: {
            fieldType: 'input',
            name: 'email',
            label: 'Email',
            type: 'email',
          },
        },
      ];

      const fields = generateFields(configs);
      render(<>{fields}</>);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should generate mixed field types', () => {
      const configs: FieldGeneratorConfig[] = [
        {
          config: {
            fieldType: 'input',
            name: 'name',
            label: 'Name',
          },
        },
        {
          config: {
            fieldType: 'textarea',
            name: 'message',
            label: 'Message',
          },
        },
        {
          config: {
            fieldType: 'select',
            name: 'category',
            label: 'Category',
            options: [{ value: 'a', label: 'Option A' }],
          },
        },
        {
          config: {
            fieldType: 'checkbox',
            name: 'agree',
            checkboxLabel: 'I agree',
          },
        },
      ];

      const fields = generateFields(configs);
      render(<>{fields}</>);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should handle empty array', () => {
      const fields = generateFields([]);
      expect(fields).toEqual([]);
    });
  });

  describe('generateFieldsFromMap', () => {
    it('should generate fields from configuration map', () => {
      const configMap = {
        username: {
          config: {
            fieldType: 'input' as const,
            name: 'username',
            label: 'Username',
          },
        },
        password: {
          config: {
            fieldType: 'input' as const,
            name: 'password',
            label: 'Password',
            type: 'password' as const,
          },
        },
        remember: {
          config: {
            fieldType: 'checkbox' as const,
            name: 'remember',
            checkboxLabel: 'Remember me',
          },
        },
      };

      const fields = generateFieldsFromMap(configMap);
      render(<>{fields}</>);

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should handle empty map', () => {
      const fields = generateFieldsFromMap({});
      expect(fields).toEqual([]);
    });
  });

  describe('FieldBuilder', () => {
    it('should build input field with fluent API', () => {
      const field = createFieldBuilder('email')
        .input('email')
        .label('Email Address')
        .placeholder('Enter your email')
        .required()
        .build();

      render(<>{field}</>);
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('should build textarea field', () => {
      const field = createFieldBuilder('bio')
        .textarea()
        .label('Biography')
        .hint('Tell us about yourself')
        .build();

      render(<>{field}</>);
      expect(screen.getByLabelText(/biography/i)).toBeInTheDocument();
    });

    it('should build select field', () => {
      const field = createFieldBuilder('country')
        .select([
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
        ])
        .label('Country')
        .required()
        .build();

      render(<>{field}</>);
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    });

    it('should build select field with multiple selection', () => {
      const field = createFieldBuilder('tags')
        .select(
          [
            { value: '1', label: 'Tag 1' },
            { value: '2', label: 'Tag 2' },
          ],
          true,
        )
        .label('Tags')
        .build();

      render(<>{field}</>);
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    });

    it('should build checkbox field', () => {
      const field = createFieldBuilder('terms').checkbox().label('Agreement').required().build();

      render(<>{field}</>);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should build radio field', () => {
      const field = createFieldBuilder('size')
        .radio([
          { value: 's', label: 'Small' },
          { value: 'm', label: 'Medium' },
        ])
        .label('Size')
        .build();

      render(<>{field}</>);
      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    it('should build radio field with direction', () => {
      const field = createFieldBuilder('orientation')
        .radio(
          [
            { value: 'h', label: 'Horizontal' },
            { value: 'v', label: 'Vertical' },
          ],
          'horizontal',
        )
        .label('Orientation')
        .build();

      render(<>{field}</>);
      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    it('should support chaining all configuration methods', () => {
      const onChange = vi.fn();
      const onBlur = vi.fn();

      const field = createFieldBuilder('username')
        .input('text')
        .label('Username')
        .placeholder('Enter username')
        .hint('Min 3 characters')
        .defaultValue('john')
        .required()
        .disabled(false)
        .readOnly(false)
        .className('custom-class')
        .validation([{ validator: minLength(3) }])
        .validateOn('blur')
        .debounce(300)
        .showError()
        .autoDismissError(5000)
        .onChange(onChange)
        .onBlur(onBlur)
        .build();

      render(<>{field}</>);
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    it('should build configuration without generating element', () => {
      const config = createFieldBuilder('test').input().label('Test').buildConfig();

      expect(config.config.name).toBe('test');
      expect(config.config.label).toBe('Test');
      expect(config.config.fieldType).toBe('input');
    });

    it('should throw error when building without field type', () => {
      const builder = createFieldBuilder('test').label('Test');

      expect(() => builder.buildConfig()).toThrow('Field name and type are required');
    });

    it('should support disabled and readOnly flags', () => {
      const field = createFieldBuilder('readonly')
        .input()
        .label('Read Only Field')
        .readOnly()
        .disabled()
        .build();

      render(<>{field}</>);
      const input = screen.getByLabelText(/read only field/i);
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('readonly');
    });

    it('should support default values for different field types', () => {
      const inputField = createFieldBuilder('text')
        .input()
        .label('Text')
        .defaultValue('default text')
        .build();

      render(<>{inputField}</>);
      expect(screen.getByLabelText(/text/i)).toHaveValue('default text');
    });
  });

  describe('Integration Tests', () => {
    it('should generate complex form with all field types', () => {
      const formFields = generateFields([
        {
          config: {
            fieldType: 'input',
            name: 'fullName',
            label: 'Full Name',
            type: 'text',
            required: true,
          },
          validationRules: [{ validator: minLength(2) }],
        },
        {
          config: {
            fieldType: 'input',
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
          },
          validationRules: [{ validator: email() }],
        },
        {
          config: {
            fieldType: 'textarea',
            name: 'bio',
            label: 'Bio',
            rows: 5,
          },
        },
        {
          config: {
            fieldType: 'select',
            name: 'country',
            label: 'Country',
            options: [
              { value: 'us', label: 'United States' },
              { value: 'uk', label: 'United Kingdom' },
            ],
          },
        },
        {
          config: {
            fieldType: 'checkbox',
            name: 'newsletter',
            checkboxLabel: 'Subscribe to newsletter',
          },
        },
        {
          config: {
            fieldType: 'radio',
            name: 'gender',
            label: 'Gender',
            options: [
              { value: 'm', label: 'Male' },
              { value: 'f', label: 'Female' },
              { value: 'o', label: 'Other' },
            ],
          },
        },
      ]);

      render(<>{formFields}</>);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      expect(screen.getByText(/subscribe to newsletter/i)).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('should generate form using builder pattern', () => {
      const fields = [
        createFieldBuilder('username')
          .input('text')
          .label('Username')
          .required()
          .validation([{ validator: minLength(3) }])
          .build(),
        createFieldBuilder('password')
          .input('password')
          .label('Password')
          .required()
          .validation([{ validator: minLength(8) }])
          .build(),
        createFieldBuilder('remember').checkbox().label('Remember me').build(),
      ];

      render(<>{fields}</>);

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });
});
