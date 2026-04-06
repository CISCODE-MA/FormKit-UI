/**
 * Tests for PasswordField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

describe('PasswordField', () => {
  const renderPasswordField = (fieldConfig: Partial<FieldConfig> = {}, defaultValue = '') => {
    const fields: FieldConfig[] = [
      {
        key: 'password',
        label: 'Password',
        type: FieldType.PASSWORD,
        ...fieldConfig,
      },
    ];

    return render(
      <DynamicForm
        schema={z.object({ password: z.string() })}
        fields={fields}
        defaultValues={{ password: defaultValue }}
        onSubmit={vi.fn()}
      />,
    );
  };

  it('renders password input with hidden value by default', () => {
    renderPasswordField();
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility when clicking show button', async () => {
    const user = userEvent.setup();
    renderPasswordField();

    const input = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(input).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    renderPasswordField();

    const input = screen.getByLabelText('Password');
    await user.type(input, 'secret123');

    expect(input).toHaveValue('secret123');
  });

  it('shows placeholder when provided', () => {
    renderPasswordField({ placeholder: 'Enter password' });
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    renderPasswordField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('disables input when disabled is true', () => {
    renderPasswordField({ disabled: true });
    expect(screen.getByLabelText('Password')).toBeDisabled();
  });

  it('disables toggle button when field is disabled', () => {
    renderPasswordField({ disabled: true });
    expect(screen.getByRole('button', { name: /show password/i })).toBeDisabled();
  });

  it('has proper aria attributes', () => {
    renderPasswordField({ required: true, description: 'Min 8 chars' });

    // Use regex to match label text that may include required asterisk
    const input = screen.getByLabelText(/Password/);
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('Min 8 chars')).toBeInTheDocument();
  });

  it('toggle button has aria-pressed attribute', async () => {
    const user = userEvent.setup();
    renderPasswordField();

    const toggle = screen.getByRole('button', { name: /show password/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });
});
