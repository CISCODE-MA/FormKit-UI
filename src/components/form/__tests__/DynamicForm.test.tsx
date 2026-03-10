/**
 * Integration tests for DynamicForm component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import DynamicForm from '../DynamicForm';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';

describe('DynamicForm', () => {
  describe('basic rendering', () => {
    it('renders form with fields', () => {
      const fields: FieldConfig[] = [
        { key: 'name', label: 'Name', type: FieldType.TEXT },
        { key: 'email', label: 'Email', type: FieldType.EMAIL },
      ];

      render(
        <DynamicForm
          schema={z.object({ name: z.string(), email: z.string() })}
          fields={fields}
          defaultValues={{ name: '', email: '' }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders submit button with custom label', () => {
      render(
        <DynamicForm
          schema={z.object({ name: z.string() })}
          fields={[{ key: 'name', label: 'Name', type: FieldType.TEXT }]}
          defaultValues={{ name: '' }}
          onSubmit={vi.fn()}
          submitLabel="Save"
        />,
      );

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('renders reset button when resetLabel is provided', () => {
      render(
        <DynamicForm
          schema={z.object({ name: z.string() })}
          fields={[{ key: 'name', label: 'Name', type: FieldType.TEXT }]}
          defaultValues={{ name: '' }}
          onSubmit={vi.fn()}
          resetLabel="Clear"
        />,
      );

      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });
  });

  describe('field types', () => {
    it('renders TextField for TEXT type', () => {
      const fields: FieldConfig[] = [{ key: 'name', label: 'Name', type: FieldType.TEXT }];

      render(
        <DynamicForm
          schema={z.object({ name: z.string() })}
          fields={fields}
          defaultValues={{ name: '' }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('type', 'text');
    });

    it('renders TextField for EMAIL type', () => {
      const fields: FieldConfig[] = [{ key: 'email', label: 'Email', type: FieldType.EMAIL }];

      render(
        <DynamicForm
          schema={z.object({ email: z.string() })}
          fields={fields}
          defaultValues={{ email: '' }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('type', 'email');
    });

    it('renders SelectField for SELECT type', async () => {
      const user = userEvent.setup();
      const fields: FieldConfig[] = [
        {
          key: 'role',
          label: 'Role',
          type: FieldType.SELECT,
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'user', label: 'User' },
          ],
        },
      ];

      render(
        <DynamicForm
          schema={z.object({ role: z.string() })}
          fields={fields}
          defaultValues={{ role: '' }}
          onSubmit={vi.fn()}
        />,
      );

      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeInTheDocument();

      // Click to open dropdown and verify options
      await user.click(combobox);
      expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'User' })).toBeInTheDocument();
    });

    it('renders CheckboxField for CHECKBOX type', () => {
      const fields: FieldConfig[] = [{ key: 'agree', label: 'I agree', type: FieldType.CHECKBOX }];

      render(
        <DynamicForm
          schema={z.object({ agree: z.boolean() })}
          fields={fields}
          defaultValues={{ agree: false }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByRole('checkbox', { name: 'I agree' })).toBeInTheDocument();
    });

    it('renders TextareaField for TEXTAREA type', () => {
      const fields: FieldConfig[] = [{ key: 'bio', label: 'Bio', type: FieldType.TEXTAREA }];

      render(
        <DynamicForm
          schema={z.object({ bio: z.string() })}
          fields={fields}
          defaultValues={{ bio: '' }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByRole('textbox', { name: 'Bio' })).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls onSubmit with form values', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      const fields: FieldConfig[] = [{ key: 'name', label: 'Name', type: FieldType.TEXT }];

      render(
        <DynamicForm
          schema={z.object({ name: z.string() })}
          fields={fields}
          defaultValues={{ name: '' }}
          onSubmit={onSubmit}
        />,
      );

      await user.type(screen.getByLabelText('Name'), 'John Doe');
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
      });
    });

    it('shows validation errors on invalid submission', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      const schema = z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
      });

      const fields: FieldConfig[] = [{ key: 'name', label: 'Name', type: FieldType.TEXT }];

      render(
        <DynamicForm
          schema={schema}
          fields={fields}
          defaultValues={{ name: '' }}
          onSubmit={onSubmit}
        />,
      );

      // Submit empty form
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Name must be at least 2 characters');
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('field interactions', () => {
    it('updates value on input change', async () => {
      const user = userEvent.setup();

      render(
        <DynamicForm
          schema={z.object({ name: z.string() })}
          fields={[{ key: 'name', label: 'Name', type: FieldType.TEXT }]}
          defaultValues={{ name: '' }}
          onSubmit={vi.fn()}
        />,
      );

      const input = screen.getByLabelText('Name');
      await user.type(input, 'Hello');

      expect(input).toHaveValue('Hello');
    });

    it('calls onChange when values change', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <DynamicForm
          schema={z.object({ name: z.string() })}
          fields={[{ key: 'name', label: 'Name', type: FieldType.TEXT }]}
          defaultValues={{ name: '' }}
          onSubmit={vi.fn()}
          onChange={onChange}
        />,
      );

      await user.type(screen.getByLabelText('Name'), 'A');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('reset functionality', () => {
    it('resets form to default values', async () => {
      const user = userEvent.setup();

      render(
        <DynamicForm
          schema={z.object({ name: z.string() })}
          fields={[{ key: 'name', label: 'Name', type: FieldType.TEXT }]}
          defaultValues={{ name: 'Initial' }}
          onSubmit={vi.fn()}
          resetLabel="Reset"
        />,
      );

      const input = screen.getByLabelText('Name');
      await user.clear(input);
      await user.type(input, 'Changed');

      expect(input).toHaveValue('Changed');

      await user.click(screen.getByRole('button', { name: 'Reset' }));

      expect(input).toHaveValue('Initial');
    });
  });

  describe('conditional fields', () => {
    it('shows field based on showWhen condition', async () => {
      const user = userEvent.setup();

      const fields: FieldConfig[] = [
        {
          key: 'role',
          label: 'Role',
          type: FieldType.SELECT,
          options: [
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' },
          ],
        },
        {
          key: 'permissions',
          label: 'Permissions',
          type: FieldType.TEXT,
          showWhen: { field: 'role', operator: 'equals', value: 'admin' },
        },
      ];

      render(
        <DynamicForm
          schema={z.object({ role: z.string(), permissions: z.string().optional() })}
          fields={fields}
          defaultValues={{ role: 'user', permissions: '' }}
          onSubmit={vi.fn()}
        />,
      );

      // Permissions should be hidden initially
      expect(screen.queryByLabelText('Permissions')).not.toBeInTheDocument();

      // Select admin role via custom dropdown
      const combobox = screen.getByRole('combobox');
      await user.click(combobox);
      await user.click(screen.getByRole('option', { name: 'Admin' }));

      // Permissions should now be visible
      expect(screen.getByLabelText('Permissions')).toBeInTheDocument();
    });

    it('hides field based on hideWhen condition', async () => {
      const user = userEvent.setup();

      const fields: FieldConfig[] = [
        { key: 'showExtra', label: 'Show Extra', type: FieldType.CHECKBOX },
        {
          key: 'extra',
          label: 'Extra Field',
          type: FieldType.TEXT,
          hideWhen: { field: 'showExtra', operator: 'equals', value: false },
        },
      ];

      render(
        <DynamicForm
          schema={z.object({ showExtra: z.boolean(), extra: z.string().optional() })}
          fields={fields}
          defaultValues={{ showExtra: false, extra: '' }}
          onSubmit={vi.fn()}
        />,
      );

      // Extra should be hidden when checkbox is unchecked
      expect(screen.queryByLabelText('Extra Field')).not.toBeInTheDocument();

      // Check the checkbox
      await user.click(screen.getByLabelText('Show Extra'));

      // Extra should now be visible
      expect(screen.getByLabelText('Extra Field')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('associates labels with inputs', () => {
      render(
        <DynamicForm
          schema={z.object({ name: z.string() })}
          fields={[{ key: 'name', label: 'Name', type: FieldType.TEXT }]}
          defaultValues={{ name: '' }}
          onSubmit={vi.fn()}
        />,
      );

      const input = screen.getByLabelText('Name');
      expect(input).toHaveAttribute('id', 'field-name');
    });

    it('sets aria-invalid on fields with errors', async () => {
      const user = userEvent.setup();

      const schema = z.object({ email: z.string().email('Invalid email') });

      render(
        <DynamicForm
          schema={schema}
          fields={[{ key: 'email', label: 'Email', type: FieldType.EMAIL }]}
          defaultValues={{ email: '' }}
          onSubmit={vi.fn()}
        />,
      );

      const input = screen.getByLabelText('Email');

      // Trigger blur to mark as touched
      await user.type(input, 'invalid');
      await user.tab();

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('shows required indicator for required fields', () => {
      render(
        <DynamicForm
          schema={z.object({ name: z.string() })}
          fields={[{ key: 'name', label: 'Name', type: FieldType.TEXT, required: true }]}
          defaultValues={{ name: '' }}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('no schema mode', () => {
    it('works without schema (no validation)', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <DynamicForm
          fields={[{ key: 'name', label: 'Name', type: FieldType.TEXT }]}
          defaultValues={{ name: '' }}
          onSubmit={onSubmit}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });
});
