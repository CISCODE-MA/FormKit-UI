/**
 * Tests for Field component - universal field router
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

// Test Field routing through DynamicForm since Field uses FormKitContext
describe('Field routing', () => {
  describe('text input types', () => {
    it('routes TEXT to TextField with type="text"', () => {
      const fields: FieldConfig[] = [{ key: 'name', label: 'Name', type: FieldType.TEXT }];

      render(
        <DynamicForm
          schema={z.object({ name: z.string() })}
          fields={fields}
          defaultValues={{ name: '' }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('routes EMAIL to TextField with type="email"', () => {
      const fields: FieldConfig[] = [{ key: 'email', label: 'Email', type: FieldType.EMAIL }];

      render(
        <DynamicForm
          schema={z.object({ email: z.string() })}
          fields={fields}
          defaultValues={{ email: '' }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('routes PASSWORD to TextField with type="password"', () => {
      const fields: FieldConfig[] = [
        { key: 'password', label: 'Password', type: FieldType.PASSWORD },
      ];

      render(
        <DynamicForm
          schema={z.object({ password: z.string() })}
          fields={fields}
          defaultValues={{ password: '' }}
          onSubmit={vi.fn()}
        />,
      );

      // Password fields don't have textbox role
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('routes NUMBER to TextField with type="number"', () => {
      const fields: FieldConfig[] = [{ key: 'age', label: 'Age', type: FieldType.NUMBER }];

      render(
        <DynamicForm
          schema={z.object({ age: z.number() })}
          fields={fields}
          defaultValues={{ age: 0 }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
    });
  });

  describe('select and option types', () => {
    it('routes SELECT to SelectField', async () => {
      const user = userEvent.setup();
      const fields: FieldConfig[] = [
        {
          key: 'country',
          label: 'Country',
          type: FieldType.SELECT,
          options: [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
          ],
        },
      ];

      render(
        <DynamicForm
          schema={z.object({ country: z.string() })}
          fields={fields}
          defaultValues={{ country: '' }}
          onSubmit={vi.fn()}
        />,
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();

      // Click to open dropdown and verify options
      await user.click(select);
      expect(screen.getByRole('option', { name: 'United States' })).toBeInTheDocument();
    });

    it('routes RADIO to RadioGroupField', () => {
      const fields: FieldConfig[] = [
        {
          key: 'size',
          label: 'Size',
          type: FieldType.RADIO,
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ],
        },
      ];

      render(
        <DynamicForm
          schema={z.object({ size: z.string() })}
          fields={fields}
          defaultValues={{ size: '' }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });
  });

  describe('boolean types', () => {
    it('routes CHECKBOX to CheckboxField', () => {
      const fields: FieldConfig[] = [{ key: 'agree', label: 'I agree', type: FieldType.CHECKBOX }];

      render(
        <DynamicForm
          schema={z.object({ agree: z.boolean() })}
          fields={fields}
          defaultValues={{ agree: false }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('routes SWITCH to SwitchField', () => {
      const fields: FieldConfig[] = [
        { key: 'notifications', label: 'Enable notifications', type: FieldType.SWITCH },
      ];

      render(
        <DynamicForm
          schema={z.object({ notifications: z.boolean() })}
          fields={fields}
          defaultValues={{ notifications: false }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });
  });

  describe('multiline input', () => {
    it('routes TEXTAREA to TextareaField', () => {
      const fields: FieldConfig[] = [
        { key: 'description', label: 'Description', type: FieldType.TEXTAREA },
      ];

      render(
        <DynamicForm
          schema={z.object({ description: z.string() })}
          fields={fields}
          defaultValues={{ description: '' }}
          onSubmit={vi.fn()}
        />,
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });
  });

  describe('date input', () => {
    it('routes DATE to DateField', () => {
      const fields: FieldConfig[] = [{ key: 'birthday', label: 'Birthday', type: FieldType.DATE }];

      render(
        <DynamicForm
          schema={z.object({ birthday: z.string() })}
          fields={fields}
          defaultValues={{ birthday: '' }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByLabelText('Birthday')).toHaveAttribute('type', 'date');
    });
  });

  describe('file input', () => {
    it('routes FILE to FileField', () => {
      const fields: FieldConfig[] = [{ key: 'avatar', label: 'Avatar', type: FieldType.FILE }];

      render(
        <DynamicForm
          schema={z.object({ avatar: z.any() })}
          fields={fields}
          defaultValues={{ avatar: null }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByLabelText('Avatar')).toHaveAttribute('type', 'file');
    });
  });
});

describe('Field props', () => {
  it('renders placeholder when provided', () => {
    const fields: FieldConfig[] = [
      { key: 'name', label: 'Name', type: FieldType.TEXT, placeholder: 'Enter your name' },
    ];

    render(
      <DynamicForm
        schema={z.object({ name: z.string() })}
        fields={fields}
        defaultValues={{ name: '' }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    const fields: FieldConfig[] = [
      {
        key: 'username',
        label: 'Username',
        type: FieldType.TEXT,
        description: 'Choose a unique username',
      },
    ];

    render(
      <DynamicForm
        schema={z.object({ username: z.string() })}
        fields={fields}
        defaultValues={{ username: '' }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Choose a unique username')).toBeInTheDocument();
  });

  it('disables field when disabled is true', () => {
    const fields: FieldConfig[] = [
      { key: 'locked', label: 'Locked Field', type: FieldType.TEXT, disabled: true },
    ];

    render(
      <DynamicForm
        schema={z.object({ locked: z.string() })}
        fields={fields}
        defaultValues={{ locked: 'value' }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Locked Field')).toBeDisabled();
  });

  it('makes field read-only when readOnly is true', () => {
    const fields: FieldConfig[] = [
      { key: 'readonly', label: 'Read Only Field', type: FieldType.TEXT, readOnly: true },
    ];

    render(
      <DynamicForm
        schema={z.object({ readonly: z.string() })}
        fields={fields}
        defaultValues={{ readonly: 'value' }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Read Only Field')).toHaveAttribute('readonly');
  });
});

describe('Field interactions', () => {
  it('handles text input changes', async () => {
    const user = userEvent.setup();
    const fields: FieldConfig[] = [{ key: 'name', label: 'Name', type: FieldType.TEXT }];

    render(
      <DynamicForm
        schema={z.object({ name: z.string() })}
        fields={fields}
        defaultValues={{ name: '' }}
        onSubmit={vi.fn()}
      />,
    );

    const input = screen.getByLabelText('Name');
    await user.type(input, 'Test Value');

    expect(input).toHaveValue('Test Value');
  });

  it('handles checkbox toggle', async () => {
    const user = userEvent.setup();
    const fields: FieldConfig[] = [{ key: 'agree', label: 'I agree', type: FieldType.CHECKBOX }];

    render(
      <DynamicForm
        schema={z.object({ agree: z.boolean() })}
        fields={fields}
        defaultValues={{ agree: false }}
        onSubmit={vi.fn()}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('handles select change', async () => {
    const user = userEvent.setup();
    const fields: FieldConfig[] = [
      {
        key: 'color',
        label: 'Color',
        type: FieldType.SELECT,
        options: [
          { value: 'red', label: 'Red' },
          { value: 'blue', label: 'Blue' },
        ],
      },
    ];

    render(
      <DynamicForm
        schema={z.object({ color: z.string() })}
        fields={fields}
        defaultValues={{ color: '' }}
        onSubmit={vi.fn()}
      />,
    );

    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'Blue' }));

    // After selection, the selected option text should be visible
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('handles radio selection', async () => {
    const user = userEvent.setup();
    const fields: FieldConfig[] = [
      {
        key: 'plan',
        label: 'Plan',
        type: FieldType.RADIO,
        options: [
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
        ],
      },
    ];

    render(
      <DynamicForm
        schema={z.object({ plan: z.string() })}
        fields={fields}
        defaultValues={{ plan: '' }}
        onSubmit={vi.fn()}
      />,
    );

    const proRadio = screen.getByLabelText('Pro');
    await user.click(proRadio);

    expect(proRadio).toBeChecked();
    expect(screen.getByLabelText('Free')).not.toBeChecked();
  });

  it('handles switch toggle', async () => {
    const user = userEvent.setup();
    const fields: FieldConfig[] = [
      { key: 'enabled', label: 'Enable feature', type: FieldType.SWITCH },
    ];

    render(
      <DynamicForm
        schema={z.object({ enabled: z.boolean() })}
        fields={fields}
        defaultValues={{ enabled: false }}
        onSubmit={vi.fn()}
      />,
    );

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'false');

    await user.click(switchEl);
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });

  it('handles textarea input', async () => {
    const user = userEvent.setup();
    const fields: FieldConfig[] = [{ key: 'bio', label: 'Bio', type: FieldType.TEXTAREA }];

    render(
      <DynamicForm
        schema={z.object({ bio: z.string() })}
        fields={fields}
        defaultValues={{ bio: '' }}
        onSubmit={vi.fn()}
      />,
    );

    const textarea = screen.getByLabelText('Bio');
    await user.type(textarea, 'Hello\nWorld');

    expect(textarea).toHaveValue('Hello\nWorld');
  });
});
