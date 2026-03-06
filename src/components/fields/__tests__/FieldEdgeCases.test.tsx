/**
 * Comprehensive tests for individual field components
 * Tests edge cases, disabled state, descriptions, and error display
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import DynamicForm from '../../form/DynamicForm';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';

describe('TextField edge cases', () => {
  it('renders with description', () => {
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

  it('handles disabled function', () => {
    const fields: FieldConfig[] = [
      {
        key: 'lockField',
        label: 'Lock Field',
        type: FieldType.CHECKBOX,
      },
      {
        key: 'conditionalField',
        label: 'Conditional Field',
        type: FieldType.TEXT,
        disabled: (values) => values.lockField === true,
      },
    ];

    render(
      <DynamicForm
        schema={z.object({ lockField: z.boolean(), conditionalField: z.string() })}
        fields={fields}
        defaultValues={{ lockField: false, conditionalField: '' }}
        onSubmit={vi.fn()}
      />,
    );

    // Initially not disabled
    expect(screen.getByLabelText('Conditional Field')).not.toBeDisabled();
  });

  it('handles different input types correctly', async () => {
    const user = userEvent.setup();

    const fields: FieldConfig[] = [{ key: 'numField', label: 'Number', type: FieldType.NUMBER }];

    render(
      <DynamicForm
        schema={z.object({ numField: z.coerce.number() })}
        fields={fields}
        defaultValues={{ numField: 0 }}
        onSubmit={vi.fn()}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '42');

    expect(input).toHaveValue(42);
  });
});

describe('TextareaField edge cases', () => {
  it('renders with description', () => {
    const fields: FieldConfig[] = [
      {
        key: 'bio',
        label: 'Bio',
        type: FieldType.TEXTAREA,
        description: 'Tell us about yourself',
      },
    ];

    render(
      <DynamicForm
        schema={z.object({ bio: z.string() })}
        fields={fields}
        defaultValues={{ bio: '' }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    const fields: FieldConfig[] = [
      { key: 'bio', label: 'Bio', type: FieldType.TEXTAREA, disabled: true },
    ];

    render(
      <DynamicForm
        schema={z.object({ bio: z.string() })}
        fields={fields}
        defaultValues={{ bio: '' }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('displays validation error with role="alert"', async () => {
    const user = userEvent.setup();

    const fields: FieldConfig[] = [{ key: 'bio', label: 'Bio', type: FieldType.TEXTAREA }];

    render(
      <DynamicForm
        schema={z.object({ bio: z.string().min(10, 'Bio too short') })}
        fields={fields}
        defaultValues={{ bio: '' }}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Bio too short');
    });
  });
});

describe('SelectField edge cases', () => {
  it('renders with description', () => {
    const fields: FieldConfig[] = [
      {
        key: 'country',
        label: 'Country',
        type: FieldType.SELECT,
        description: 'Select your country',
        options: [{ value: 'us', label: 'United States' }],
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

    expect(screen.getByText('Select your country')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    const fields: FieldConfig[] = [
      {
        key: 'country',
        label: 'Country',
        type: FieldType.SELECT,
        disabled: true,
        options: [{ value: 'us', label: 'United States' }],
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

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('displays validation error', async () => {
    const user = userEvent.setup();

    const fields: FieldConfig[] = [
      {
        key: 'country',
        label: 'Country',
        type: FieldType.SELECT,
        options: [
          { value: '', label: 'Select...' },
          { value: 'us', label: 'United States' },
        ],
      },
    ];

    render(
      <DynamicForm
        schema={z.object({ country: z.string().min(1, 'Please select a country') })}
        fields={fields}
        defaultValues={{ country: '' }}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Please select a country');
    });
  });
});

describe('CheckboxField edge cases', () => {
  it('renders with description', () => {
    const fields: FieldConfig[] = [
      {
        key: 'agree',
        label: 'I agree',
        type: FieldType.CHECKBOX,
        description: 'You must agree to continue',
      },
    ];

    render(
      <DynamicForm
        schema={z.object({ agree: z.boolean() })}
        fields={fields}
        defaultValues={{ agree: false }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('You must agree to continue')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    const fields: FieldConfig[] = [
      { key: 'agree', label: 'I agree', type: FieldType.CHECKBOX, disabled: true },
    ];

    render(
      <DynamicForm
        schema={z.object({ agree: z.boolean() })}
        fields={fields}
        defaultValues={{ agree: false }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('displays validation error', async () => {
    const user = userEvent.setup();

    const fields: FieldConfig[] = [{ key: 'agree', label: 'I agree', type: FieldType.CHECKBOX }];

    render(
      <DynamicForm
        schema={z.object({
          agree: z.boolean().refine((v) => v === true, { message: 'You must agree' }),
        })}
        fields={fields}
        defaultValues={{ agree: false }}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('RadioGroupField edge cases', () => {
  it('renders with description', () => {
    const fields: FieldConfig[] = [
      {
        key: 'plan',
        label: 'Plan',
        type: FieldType.RADIO,
        description: 'Choose your subscription plan',
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

    expect(screen.getByText('Choose your subscription plan')).toBeInTheDocument();
  });

  it('handles disabled state on individual options', () => {
    const fields: FieldConfig[] = [
      {
        key: 'plan',
        label: 'Plan',
        type: FieldType.RADIO,
        disabled: true,
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

    expect(screen.getByLabelText('Free')).toBeDisabled();
    expect(screen.getByLabelText('Pro')).toBeDisabled();
  });

  it('displays validation error', async () => {
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
        schema={z.object({ plan: z.string().min(1, 'Please select a plan') })}
        fields={fields}
        defaultValues={{ plan: '' }}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Please select a plan');
    });
  });
});

describe('SwitchField edge cases', () => {
  it('renders with description', () => {
    const fields: FieldConfig[] = [
      {
        key: 'notifications',
        label: 'Enable notifications',
        type: FieldType.SWITCH,
        description: 'Receive email notifications',
      },
    ];

    render(
      <DynamicForm
        schema={z.object({ notifications: z.boolean() })}
        fields={fields}
        defaultValues={{ notifications: false }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Receive email notifications')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    const fields: FieldConfig[] = [
      {
        key: 'notifications',
        label: 'Enable notifications',
        type: FieldType.SWITCH,
        disabled: true,
      },
    ];

    render(
      <DynamicForm
        schema={z.object({ notifications: z.boolean() })}
        fields={fields}
        defaultValues={{ notifications: false }}
        onSubmit={vi.fn()}
      />,
    );

    // Switch uses button with disabled attribute
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('displays validation error', async () => {
    const user = userEvent.setup();

    const fields: FieldConfig[] = [
      { key: 'mustEnable', label: 'Must Enable', type: FieldType.SWITCH },
    ];

    render(
      <DynamicForm
        schema={z.object({
          mustEnable: z.boolean().refine((v) => v === true, { message: 'This must be enabled' }),
        })}
        fields={fields}
        defaultValues={{ mustEnable: false }}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('DateField edge cases', () => {
  it('renders with description', () => {
    const fields: FieldConfig[] = [
      {
        key: 'birthdate',
        label: 'Birth Date',
        type: FieldType.DATE,
        description: 'Enter your date of birth',
      },
    ];

    render(
      <DynamicForm
        schema={z.object({ birthdate: z.string() })}
        fields={fields}
        defaultValues={{ birthdate: '' }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Enter your date of birth')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    const fields: FieldConfig[] = [
      { key: 'birthdate', label: 'Birth Date', type: FieldType.DATE, disabled: true },
    ];

    render(
      <DynamicForm
        schema={z.object({ birthdate: z.string() })}
        fields={fields}
        defaultValues={{ birthdate: '' }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Birth Date')).toBeDisabled();
  });

  it('displays validation error', async () => {
    const user = userEvent.setup();

    const fields: FieldConfig[] = [{ key: 'birthdate', label: 'Birth Date', type: FieldType.DATE }];

    render(
      <DynamicForm
        schema={z.object({ birthdate: z.string().min(1, 'Date is required') })}
        fields={fields}
        defaultValues={{ birthdate: '' }}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Date is required');
    });
  });
});

describe('FileField edge cases', () => {
  it('renders with description', () => {
    const fields: FieldConfig[] = [
      {
        key: 'avatar',
        label: 'Avatar',
        type: FieldType.FILE,
        description: 'Upload your profile picture',
      },
    ];

    render(
      <DynamicForm
        schema={z.object({ avatar: z.any() })}
        fields={fields}
        defaultValues={{ avatar: null }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('Upload your profile picture')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    const fields: FieldConfig[] = [
      { key: 'avatar', label: 'Avatar', type: FieldType.FILE, disabled: true },
    ];

    render(
      <DynamicForm
        schema={z.object({ avatar: z.any() })}
        fields={fields}
        defaultValues={{ avatar: null }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Avatar')).toBeDisabled();
  });

  it('handles file upload', async () => {
    const user = userEvent.setup();
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });

    const fields: FieldConfig[] = [{ key: 'avatar', label: 'Avatar', type: FieldType.FILE }];

    render(
      <DynamicForm
        schema={z.object({ avatar: z.any() })}
        fields={fields}
        defaultValues={{ avatar: null }}
        onSubmit={vi.fn()}
      />,
    );

    const input = screen.getByLabelText('Avatar');
    await user.upload(input, file);

    // Input should have files
    expect((input as HTMLInputElement).files).toHaveLength(1);
    expect((input as HTMLInputElement).files?.[0]).toBe(file);
  });
});
