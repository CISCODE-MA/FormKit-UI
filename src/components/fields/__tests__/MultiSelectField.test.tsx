/**
 * Tests for MultiSelectField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

describe('MultiSelectField', () => {
  const defaultOptions = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Date', value: 'date' },
    { label: 'Elderberry', value: 'elderberry' },
  ];

  const renderMultiSelectField = (
    fieldConfig: Partial<FieldConfig> = {},
    defaultValue: string[] = [],
  ) => {
    const fields: FieldConfig[] = [
      {
        key: 'fruits',
        label: 'Fruits',
        type: FieldType.MULTI_SELECT,
        options: defaultOptions,
        ...fieldConfig,
      },
    ];

    return render(
      <DynamicForm
        schema={z.object({ fruits: z.array(z.string()) })}
        fields={fields}
        defaultValues={{ fruits: defaultValue }}
        onSubmit={vi.fn()}
      />,
    );
  };

  it('renders multiselect with placeholder', () => {
    renderMultiSelectField({ placeholder: 'Choose fruits...' });
    expect(screen.getByText('Choose fruits...')).toBeInTheDocument();
  });

  it('displays selected values as tags', () => {
    renderMultiSelectField({}, ['apple', 'banana']);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    renderMultiSelectField();

    const control = screen.getByRole('combobox');
    await user.click(control);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('selects option on click', async () => {
    const user = userEvent.setup();
    renderMultiSelectField();

    const control = screen.getByRole('combobox');
    await user.click(control);

    // Click on the option's parent li element
    const options = screen.getAllByRole('option');
    await user.click(options[0]); // Apple

    // Should show the tag (look for Remove button which indicates tag exists)
    expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeInTheDocument();
  });

  it('deselects option on second click', async () => {
    const user = userEvent.setup();
    renderMultiSelectField({}, ['apple']);

    // Initially has Apple tag
    expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeInTheDocument();

    const control = screen.getByRole('combobox');
    await user.click(control);

    // Click on Apple option to deselect
    const options = screen.getAllByRole('option');
    await user.click(options[0]); // Apple

    // Tag should be removed
    expect(screen.queryByRole('button', { name: 'Remove Apple' })).not.toBeInTheDocument();
  });

  it('removes tag via X button', async () => {
    const user = userEvent.setup();
    renderMultiSelectField({}, ['apple', 'banana']);

    const removeButton = screen.getByRole('button', { name: 'Remove Apple' });
    await user.click(removeButton);

    // Apple tag should be removed
    expect(screen.queryByRole('button', { name: 'Remove Apple' })).not.toBeInTheDocument();
    // Banana should still exist
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('clears all selections via clear button', async () => {
    const user = userEvent.setup();
    renderMultiSelectField({}, ['apple', 'banana', 'cherry']);

    const clearButton = screen.getByRole('button', { name: 'Clear selection' });
    await user.click(clearButton);

    // All tags should be removed
    expect(screen.queryByRole('button', { name: /Remove/i })).not.toBeInTheDocument();
    expect(screen.getByText('Select an option...')).toBeInTheDocument();
  });

  it('filters options via search', async () => {
    const user = userEvent.setup();
    renderMultiSelectField();

    const control = screen.getByRole('combobox');
    await user.click(control);

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'ban');

    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText('Banana')).toBeInTheDocument();
    expect(within(listbox).queryByText('Apple')).not.toBeInTheDocument();
  });

  it('shows "No options found" when search has no matches', async () => {
    const user = userEvent.setup();
    renderMultiSelectField();

    const control = screen.getByRole('combobox');
    await user.click(control);

    const searchInput = screen.getByPlaceholderText('Search...');
    await user.type(searchInput, 'xyz');

    expect(screen.getByText('No options found')).toBeInTheDocument();
  });

  it('displays selection count', async () => {
    const user = userEvent.setup();
    renderMultiSelectField({}, ['apple', 'banana']);

    const control = screen.getByRole('combobox');
    await user.click(control);

    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('supports keyboard navigation to open dropdown', async () => {
    const user = userEvent.setup();
    renderMultiSelectField();

    const control = screen.getByRole('combobox');
    control.focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('navigates options with arrow keys', async () => {
    const user = userEvent.setup();
    renderMultiSelectField();

    const control = screen.getByRole('combobox');
    await user.click(control);

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    // Second option (Banana) should be selected - verify via remove button on tag
    expect(screen.getByLabelText('Remove Banana')).toBeInTheDocument();
  });

  it('closes dropdown with Escape', async () => {
    const user = userEvent.setup();
    renderMultiSelectField();

    const control = screen.getByRole('combobox');
    await user.click(control);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows required indicator', () => {
    renderMultiSelectField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows description', () => {
    renderMultiSelectField({ description: 'Select your favorite fruits' });
    expect(screen.getByText('Select your favorite fruits')).toBeInTheDocument();
  });

  it('disables interaction when disabled', () => {
    renderMultiSelectField({ disabled: true }, ['apple']);
    const control = screen.getByRole('combobox');
    expect(control).toHaveAttribute('tabindex', '-1');
  });

  it('has proper aria attributes', () => {
    renderMultiSelectField({ required: true });
    const control = screen.getByRole('combobox');

    expect(control).toHaveAttribute('aria-haspopup', 'listbox');
    expect(control).toHaveAttribute('aria-expanded', 'false');
    expect(control).toHaveAttribute('aria-required', 'true');
  });

  it('updates aria-expanded when dropdown opens', async () => {
    const user = userEvent.setup();
    renderMultiSelectField();

    const control = screen.getByRole('combobox');
    expect(control).toHaveAttribute('aria-expanded', 'false');

    await user.click(control);
    expect(control).toHaveAttribute('aria-expanded', 'true');
  });

  it('marks selected options with aria-selected', async () => {
    const user = userEvent.setup();
    renderMultiSelectField({}, ['apple']);

    const control = screen.getByRole('combobox');
    await user.click(control);

    const options = screen.getAllByRole('option');
    const appleOption = options.find((opt) => opt.textContent?.includes('Apple'));
    expect(appleOption).toHaveAttribute('aria-selected', 'true');
  });
});
