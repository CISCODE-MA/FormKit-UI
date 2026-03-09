/**
 * Tests for DateTimeField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

describe('DateTimeField', () => {
  const renderDateTimeField = (fieldConfig: Partial<FieldConfig> = {}, defaultValue = '') => {
    const fields: FieldConfig[] = [
      {
        key: 'appointment',
        label: 'Appointment',
        type: FieldType.DATETIME,
        ...fieldConfig,
      },
    ];

    return render(
      <DynamicForm
        schema={z.object({ appointment: z.string() })}
        fields={fields}
        defaultValues={{ appointment: defaultValue }}
        onSubmit={vi.fn()}
      />,
    );
  };

  it('renders datetime-local input', () => {
    renderDateTimeField();
    const input = screen.getByLabelText('Appointment');
    expect(input).toHaveAttribute('type', 'datetime-local');
  });

  it('displays default value', () => {
    renderDateTimeField({}, '2026-03-15T14:30');
    const input = screen.getByLabelText('Appointment');
    expect(input).toHaveValue('2026-03-15T14:30');
  });

  it('accepts datetime input', async () => {
    const user = userEvent.setup();
    renderDateTimeField();

    const input = screen.getByLabelText('Appointment');
    await user.clear(input);
    // Datetime-local inputs need specific format
    await user.type(input, '2026-12-25T10:00');

    expect(input).toHaveValue('2026-12-25T10:00');
  });

  it('uses timeStep for time portion', () => {
    renderDateTimeField({ timeStep: 1800 }); // 30 minutes
    const input = screen.getByLabelText('Appointment');
    expect(input).toHaveAttribute('step', '1800');
  });

  it('shows required indicator', () => {
    renderDateTimeField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows description', () => {
    renderDateTimeField({ description: 'Select date and time' });
    expect(screen.getByText('Select date and time')).toBeInTheDocument();
  });

  it('disables input when disabled', () => {
    renderDateTimeField({ disabled: true });
    expect(screen.getByLabelText('Appointment')).toBeDisabled();
  });

  it('sets readOnly attribute', () => {
    renderDateTimeField({ readOnly: true });
    expect(screen.getByLabelText('Appointment')).toHaveAttribute('readonly');
  });

  it('has proper aria attributes', () => {
    renderDateTimeField({ required: true });

    // Use regex to match label text that may include required asterisk
    const input = screen.getByLabelText(/Appointment/);
    expect(input).toHaveAttribute('aria-required', 'true');
  });
});
