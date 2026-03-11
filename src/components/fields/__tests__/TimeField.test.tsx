/**
 * Tests for TimeField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('renders time picker', () => {
    renderTimeField();
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('displays default value formatted', () => {
    renderTimeField({}, '14:30');
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  it('opens time picker dropdown on click', async () => {
    const user = userEvent.setup();
    renderTimeField();

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Hour')).toBeInTheDocument();
    expect(screen.getByText('Minute')).toBeInTheDocument();
  });

  it('selects time via dropdown', async () => {
    const user = userEvent.setup();
    renderTimeField();

    await user.click(screen.getByRole('combobox'));

    // The time picker shows hour and minute columns with confirm button
    const hours = screen.getAllByRole('option');
    expect(hours.length).toBeGreaterThan(0);

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmBtn).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    renderTimeField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows description', () => {
    renderTimeField({ description: 'Select appointment time' });
    expect(screen.getByText('Select appointment time')).toBeInTheDocument();
  });

  it('disables interaction when disabled', () => {
    renderTimeField({ disabled: true });
    expect(screen.getByRole('combobox')).toHaveAttribute('tabindex', '-1');
  });

  it('has proper aria attributes', () => {
    renderTimeField({ required: true });
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-required', 'true');
  });

  it('closes dropdown on escape', async () => {
    const user = userEvent.setup();
    renderTimeField();

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
