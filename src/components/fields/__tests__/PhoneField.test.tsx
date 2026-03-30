/**
 * Tests for PhoneField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

describe('PhoneField', () => {
  const DEFAULT_PHONE_VALUE = { countryCode: 'US', dialCode: '+1', number: '' };

  const renderPhoneField = (
    fieldConfig: Partial<FieldConfig> = {},
    defaultValue = DEFAULT_PHONE_VALUE,
  ) => {
    const fields: FieldConfig[] = [
      {
        key: 'phone',
        label: 'Phone Number',
        type: FieldType.PHONE,
        ...fieldConfig,
      },
    ];

    return render(
      <DynamicForm
        schema={z.object({
          phone: z.object({
            countryCode: z.string(),
            dialCode: z.string(),
            number: z.string(),
          }),
        })}
        fields={fields}
        defaultValues={{ phone: defaultValue }}
        onSubmit={vi.fn()}
      />,
    );
  };

  it('renders phone input with country selector', () => {
    renderPhoneField();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select country/i })).toBeInTheDocument();
  });

  it('displays country flag', () => {
    renderPhoneField();
    // Flag images are aria-hidden with empty alt for a11y
    const images = document.querySelectorAll('img[aria-hidden="true"]');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('src', expect.stringContaining('flagcdn.com'));
  });

  it('displays dial code', () => {
    renderPhoneField({}, { countryCode: 'US', dialCode: '+1', number: '' });
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('accepts phone number input', async () => {
    const user = userEvent.setup();
    renderPhoneField();

    const input = screen.getByLabelText('Phone Number');
    await user.type(input, '5551234567');

    expect(input).toHaveValue('5551234567');
  });

  it('opens country dropdown on selector click', async () => {
    const user = userEvent.setup();
    renderPhoneField();

    const selector = screen.getByRole('button', { name: /Select country/i });
    await user.click(selector);

    // Should show country options listbox
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('selects a country from dropdown', async () => {
    const user = userEvent.setup();
    renderPhoneField();

    // Open dropdown
    const selector = screen.getByRole('button', { name: /Select country/i });
    await user.click(selector);

    // Click on UK option
    const ukOption = screen.getByText('United Kingdom');
    await user.click(ukOption);

    // Should show UK dial code
    expect(screen.getByText('+44')).toBeInTheDocument();
  });

  it('closes dropdown on country selection', async () => {
    const user = userEvent.setup();
    renderPhoneField();

    const selector = screen.getByRole('button', { name: /Select country/i });
    await user.click(selector);

    // Listbox should be visible
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Select a country
    await user.click(screen.getByText('Germany'));

    // Dropdown should close (listbox hidden)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows required indicator', () => {
    renderPhoneField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('disables both selector and input when disabled', () => {
    renderPhoneField({ disabled: true });
    expect(screen.getByLabelText('Phone Number')).toBeDisabled();
    // Country selector is a button, not a combobox
    expect(screen.getByRole('button', { name: /Select country/i })).toBeDisabled();
  });

  it('shows description', () => {
    renderPhoneField({ description: 'Include area code' });
    expect(screen.getByText('Include area code')).toBeInTheDocument();
  });

  it('preserves phone value structure', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    const fields: FieldConfig[] = [{ key: 'phone', label: 'Phone', type: FieldType.PHONE }];

    render(
      <DynamicForm
        schema={z.object({
          phone: z.object({
            countryCode: z.string(),
            dialCode: z.string(),
            number: z.string(),
          }),
        })}
        fields={fields}
        defaultValues={{ phone: { countryCode: 'US', dialCode: '+1', number: '' } }}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText('Phone'), '1234567890');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: expect.objectContaining({
          countryCode: 'US',
          dialCode: '+1',
          number: '1234567890',
        }),
      }),
    );
  });
});
