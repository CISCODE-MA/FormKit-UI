import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

describe('DateField', () => {
  const renderDateField = (fieldConfig: Partial<FieldConfig> = {}, defaultValue = '') => {
    const fields: FieldConfig[] = [
      {
        key: 'birthdate',
        label: 'Birth Date',
        type: FieldType.DATE,
        ...fieldConfig,
      },
    ];

    return render(
      <DynamicForm
        schema={z.object({ birthdate: z.string() })}
        fields={fields}
        defaultValues={{ birthdate: defaultValue }}
        onSubmit={vi.fn()}
      />,
    );
  };

  it('opens calendar and selects today', async () => {
    const user = userEvent.setup();
    renderDateField();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: 'Today' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('supports month navigation controls', async () => {
    const user = userEvent.setup();
    renderDateField();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('supports keyboard open/navigate/select', async () => {
    const user = userEvent.setup();
    renderDateField();

    const combobox = screen.getByRole('combobox');
    combobox.focus();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows clear button for existing value and clears it', async () => {
    const user = userEvent.setup();
    renderDateField({}, '2026-04-06');

    const clearButton = screen.getByRole('button', { name: 'Clear selection' });
    await user.click(clearButton);

    expect(screen.queryByText(/Apr 6, 2026/)).not.toBeInTheDocument();
  });

  it('does not open when readOnly', async () => {
    const user = userEvent.setup();
    renderDateField({ readOnly: true });

    await user.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports additional keyboard navigation directions', async () => {
    const user = userEvent.setup();
    renderDateField();

    const combobox = screen.getByRole('combobox');
    combobox.focus();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes calendar on escape key', async () => {
    const user = userEvent.setup();
    renderDateField();

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('toggles calendar open and closed on combobox click', async () => {
    const user = userEvent.setup();
    renderDateField();

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(combobox);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
