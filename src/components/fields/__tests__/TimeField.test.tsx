/**
 * Tests for TimeField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

describe('TimeField', () => {
  const renderTimeField = (fieldConfig: Partial<FieldConfig> = {}, defaultValue = '') => {
    const fields: FieldConfig[] = [
      {
        key: 'startTime',
        label: 'Start Time',
        type: FieldType.TIME,
        ...fieldConfig,
      },
    ];

    return render(
      <DynamicForm
        schema={z.object({ startTime: z.string() })}
        fields={fields}
        defaultValues={{ startTime: defaultValue }}
        onSubmit={vi.fn()}
      />,
    );
  };

  it('renders time input', () => {
    renderTimeField();
    const input = screen.getByLabelText('Start Time');
    expect(input).toHaveAttribute('type', 'time');
  });

  it('displays default value', () => {
    renderTimeField({}, '14:30');
    const input = screen.getByLabelText('Start Time');
    expect(input).toHaveValue('14:30');
  });

  it('accepts time input', async () => {
    const user = userEvent.setup();
    renderTimeField();

    const input = screen.getByLabelText('Start Time');
    await user.clear(input);
    await user.type(input, '09:00');

    expect(input).toHaveValue('09:00');
  });

  it('uses custom timeStep', () => {
    renderTimeField({ timeStep: 900 }); // 15 minutes
    const input = screen.getByLabelText('Start Time');
    expect(input).toHaveAttribute('step', '900');
  });

  it('shows required indicator', () => {
    renderTimeField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows description', () => {
    renderTimeField({ description: 'Select appointment time' });
    expect(screen.getByText('Select appointment time')).toBeInTheDocument();
  });

  it('disables input when disabled', () => {
    renderTimeField({ disabled: true });
    expect(screen.getByLabelText('Start Time')).toBeDisabled();
  });

  it('sets readOnly attribute', () => {
    renderTimeField({ readOnly: true });
    expect(screen.getByLabelText('Start Time')).toHaveAttribute('readonly');
  });

  it('has proper aria attributes', () => {
    renderTimeField({
      required: true,
      description: 'Pick a time',
    });

    // Use regex to match label text that includes the required asterisk
    const input = screen.getByLabelText(/Start Time/);
    expect(input).toHaveAttribute('aria-required', 'true');
  });
});
