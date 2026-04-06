/**
 * Tests for DateTimeField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('renders datetime picker', () => {
    renderDateTimeField();
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('displays default value formatted', () => {
    renderDateTimeField({}, '2026-03-15T14:30');
    // Should display formatted as "Mar 15, 2026, 2:30 PM"
    expect(screen.getByText(/Mar 15, 2026/)).toBeInTheDocument();
  });

  it('opens picker with date and time tabs', async () => {
    const user = userEvent.setup();
    renderDateTimeField();

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Date/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Time/i })).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    renderDateTimeField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows description', () => {
    renderDateTimeField({ description: 'Select date and time' });
    expect(screen.getByText('Select date and time')).toBeInTheDocument();
  });

  it('disables interaction when disabled', () => {
    renderDateTimeField({ disabled: true });
    expect(screen.getByRole('combobox')).toHaveAttribute('tabindex', '-1');
  });

  it('has proper aria attributes', () => {
    renderDateTimeField({ required: true });
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-required', 'true');
  });

  it('closes dropdown on escape', async () => {
    const user = userEvent.setup();
    renderDateTimeField();

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows Today button in calendar', async () => {
    const user = userEvent.setup();
    renderDateTimeField();

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
  });

  it('lets user select date and time then confirm', async () => {
    const user = userEvent.setup();
    renderDateTimeField();

    await user.click(screen.getByRole('combobox'));

    // Pick a date cell and switch to time tab
    const dateCells = screen.getAllByRole('gridcell');
    const clickableDate = dateCells
      .map((cell) => cell.querySelector('button'))
      .find((btn): btn is HTMLButtonElement => btn instanceof HTMLButtonElement);
    expect(clickableDate).toBeDefined();
    if (!clickableDate) return;
    await user.click(clickableDate);

    await user.click(screen.getByRole('button', { name: /Time/i }));
    await user.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('supports month navigation controls', async () => {
    const user = userEvent.setup();
    renderDateTimeField();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows clear button for existing value and clears it', async () => {
    const user = userEvent.setup();
    renderDateTimeField({}, '2026-03-15T14:30');

    const clearButton = screen.getByRole('button', { name: 'Clear selection' });
    await user.click(clearButton);

    expect(screen.queryByText(/Mar 15, 2026/)).not.toBeInTheDocument();
  });

  it('keeps confirm disabled when no date is selected', async () => {
    const user = userEvent.setup();
    renderDateTimeField();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: /Time/i }));

    expect(screen.getByRole('button', { name: /Confirm/i })).toBeDisabled();
  });

  it('supports keyboard open with Enter and closes with Escape', async () => {
    const user = userEvent.setup();
    renderDateTimeField();

    const combobox = screen.getByRole('combobox');
    combobox.focus();

    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('moves from date tab to time tab via Today button', async () => {
    const user = userEvent.setup();
    renderDateTimeField();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: 'Today' }));

    expect(screen.getByText('Hour')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm/i })).not.toBeDisabled();
  });

  it('does not open dropdown when readOnly', async () => {
    const user = userEvent.setup();
    renderDateTimeField({ readOnly: true });

    await user.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('toggles dropdown open and closed on combobox click', async () => {
    const user = userEvent.setup();
    renderDateTimeField();

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(combobox);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
