/**
 * Tests for TagsField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

describe('TagsField', () => {
  const renderTagsField = (fieldConfig: Partial<FieldConfig> = {}, defaultValue: string[] = []) => {
    const fields: FieldConfig[] = [
      {
        key: 'tags',
        label: 'Tags',
        type: FieldType.TAGS,
        ...fieldConfig,
      },
    ];

    return render(
      <DynamicForm
        schema={z.object({ tags: z.array(z.string()) })}
        fields={fields}
        defaultValues={{ tags: defaultValue }}
        onSubmit={vi.fn()}
      />,
    );
  };

  it('renders empty tag input', () => {
    renderTagsField();
    expect(screen.getByPlaceholderText('Type and press Enter')).toBeInTheDocument();
  });

  it('displays existing tags', () => {
    renderTagsField({}, ['react', 'typescript']);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('adds tag on Enter', async () => {
    const user = userEvent.setup();
    renderTagsField();

    const input = screen.getByPlaceholderText('Type and press Enter');
    await user.type(input, 'newtag{Enter}');

    expect(screen.getByText('newtag')).toBeInTheDocument();
  });

  it('adds tag on comma', async () => {
    const user = userEvent.setup();
    renderTagsField();

    const input = screen.getByPlaceholderText('Type and press Enter');
    await user.type(input, 'tag1,');

    expect(screen.getByText('tag1')).toBeInTheDocument();
  });

  it('removes tag on button click', async () => {
    const user = userEvent.setup();
    renderTagsField({}, ['removeme']);

    const removeButton = screen.getByRole('button', { name: 'Remove tag: removeme' });
    await user.click(removeButton);

    expect(screen.queryByText('removeme')).not.toBeInTheDocument();
  });

  it('removes last tag on backspace when input is empty', async () => {
    const user = userEvent.setup();
    renderTagsField({}, ['first', 'second']);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(screen.queryByText('second')).not.toBeInTheDocument();
    expect(screen.getByText('first')).toBeInTheDocument();
  });

  it('handles paste with comma-separated values', () => {
    renderTagsField();
    const input = screen.getByRole('textbox');

    fireEvent.paste(input, {
      clipboardData: { getData: () => 'one,two,three' },
    });

    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(screen.getByText('three')).toBeInTheDocument();
  });

  it('respects maxTags limit', async () => {
    const user = userEvent.setup();
    renderTagsField({ maxTags: 2 }, ['existing']);

    const input = screen.getByRole('textbox');
    await user.type(input, 'second{Enter}');
    expect(screen.getByText('second')).toBeInTheDocument();

    // Third tag should not be added
    await user.type(input, 'third{Enter}');
    expect(screen.queryByText('third')).not.toBeInTheDocument();
  });

  it('respects minTags and prevents deletion below minimum', () => {
    renderTagsField({ minTags: 1 }, ['required']);

    // Remove button should not be visible when at minimum
    expect(screen.queryByRole('button', { name: 'Remove required' })).not.toBeInTheDocument();
  });

  it('allows duplicates by default', async () => {
    const user = userEvent.setup();
    renderTagsField({}, ['existing']);

    const input = screen.getByRole('textbox');
    await user.type(input, 'existing{Enter}');

    // Default is allowDuplicates: true, so should have two "existing" tags
    const tags = screen.getAllByRole('option');
    expect(tags).toHaveLength(2);
  });

  it('prevents duplicates when allowDuplicates is false', async () => {
    const user = userEvent.setup();
    renderTagsField({ allowDuplicates: false }, ['tag']);

    const input = screen.getByRole('textbox');
    await user.type(input, 'tag{Enter}');

    // Should still only have one "tag"
    const tags = screen.getAllByRole('option');
    expect(tags).toHaveLength(1);
  });

  it('shows count when maxTags is set', () => {
    renderTagsField({ maxTags: 5 }, ['one', 'two']);
    expect(screen.getByText('2/5 tags')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    renderTagsField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('disables input when disabled', () => {
    renderTagsField({ disabled: true });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
