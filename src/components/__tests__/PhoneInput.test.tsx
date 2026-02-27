/**
 * Tests for PhoneInput component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PhoneInput,
  formatPhoneNumber,
  parsePhoneNumber,
  getFullPhoneNumber,
  DEFAULT_COUNTRIES,
  type CountryData,
} from '../PhoneInput';
import { required } from '../../validation/validators';

describe('PhoneInput', () => {
  describe('basic rendering', () => {
    it('renders input with name', () => {
      render(<PhoneInput name="phone" />);
      const input = document.querySelector('input[name="phone"]');
      expect(input).toBeInTheDocument();
    });

    it('renders with tel type', () => {
      render(<PhoneInput name="phone" />);
      const input = document.querySelector('input[name="phone"]');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('renders with placeholder', () => {
      render(<PhoneInput name="phone" placeholder="Your phone" />);
      const input = screen.getByPlaceholderText('Your phone');
      expect(input).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<PhoneInput name="phone" defaultValue="5551234567" />);
      const input = document.querySelector('input[name="phone"]') as HTMLInputElement;
      // Should be formatted for US
      expect(input.value).toBe('(555) 123-4567');
    });
  });

  describe('label and accessibility', () => {
    it('renders with label', () => {
      render(<PhoneInput name="phone" label="Phone Number" />);
      const label = screen.getByText('Phone Number');
      expect(label).toBeInTheDocument();
    });

    it('associates label with input', () => {
      render(<PhoneInput name="phone" label="Phone Number" />);
      const input = screen.getByLabelText('Phone Number');
      expect(input).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<PhoneInput name="phone" label="Phone" required />);
      const required = screen.getAllByText('*');
      expect(required.length).toBeGreaterThan(0);
    });

    it('renders with hint text', () => {
      render(<PhoneInput name="phone" hint="We will never share your phone" />);
      const hint = screen.getByText('We will never share your phone');
      expect(hint).toBeInTheDocument();
    });

    it('has proper sr-only label when no visible label', () => {
      render(<PhoneInput name="phone" />);
      const label = document.querySelector('label.sr-only');
      expect(label).toBeInTheDocument();
    });
  });

  describe('country selector', () => {
    it('renders country dropdown by default', () => {
      render(<PhoneInput name="phone" />);
      const dialCode = screen.getByText('+1');
      expect(dialCode).toBeInTheDocument();
    });

    it('shows US flag by default', () => {
      render(<PhoneInput name="phone" />);
      const flag = screen.getByText('🇺🇸');
      expect(flag).toBeInTheDocument();
    });

    it('can hide country selector', () => {
      render(<PhoneInput name="phone" showCountrySelect={false} />);
      const dialCode = screen.queryByText('+1');
      expect(dialCode).not.toBeInTheDocument();
    });

    it('opens country dropdown on click', async () => {
      const user = userEvent.setup();
      render(<PhoneInput name="phone" />);

      const countryButton = screen.getByRole('button', { name: /selected country/i });
      await user.click(countryButton);

      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });

    it('shows search input in dropdown', async () => {
      const user = userEvent.setup();
      render(<PhoneInput name="phone" />);

      const countryButton = screen.getByRole('button', { name: /selected country/i });
      await user.click(countryButton);

      const searchInput = screen.getByPlaceholderText('Search countries...');
      expect(searchInput).toBeInTheDocument();
    });

    it('filters countries on search', async () => {
      const user = userEvent.setup();
      render(<PhoneInput name="phone" />);

      const countryButton = screen.getByRole('button', { name: /selected country/i });
      await user.click(countryButton);

      const searchInput = screen.getByPlaceholderText('Search countries...');
      await user.type(searchInput, 'Germany');

      const germanyOption = screen.getByRole('option', { name: /germany/i });
      expect(germanyOption).toBeInTheDocument();
    });

    it('changes country on selection', async () => {
      const user = userEvent.setup();
      render(<PhoneInput name="phone" />);

      const countryButton = screen.getByRole('button', { name: /selected country/i });
      await user.click(countryButton);

      const ukOption = screen.getByRole('option', { name: /united kingdom/i });
      await user.click(ukOption);

      // Should now show UK dial code
      expect(screen.getByText('+44')).toBeInTheDocument();
      expect(screen.getByText('🇬🇧')).toBeInTheDocument();
    });

    it('calls onCountryChange when country changes', async () => {
      const user = userEvent.setup();
      const onCountryChange = vi.fn();
      render(<PhoneInput name="phone" onCountryChange={onCountryChange} />);

      const countryButton = screen.getByRole('button', { name: /selected country/i });
      await user.click(countryButton);

      const ukOption = screen.getByRole('option', { name: /united kingdom/i });
      await user.click(ukOption);

      expect(onCountryChange).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'GB', dialCode: '+44' }),
      );
    });

    it('closes dropdown on escape', async () => {
      const user = userEvent.setup();
      render(<PhoneInput name="phone" />);

      const countryButton = screen.getByRole('button', { name: /selected country/i });
      await user.click(countryButton);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('uses defaultCountry prop', () => {
      render(<PhoneInput name="phone" defaultCountry="GB" />);
      expect(screen.getByText('+44')).toBeInTheDocument();
      expect(screen.getByText('🇬🇧')).toBeInTheDocument();
    });
  });

  describe('phone formatting', () => {
    it('formats US phone number as user types', async () => {
      const user = userEvent.setup();
      render(<PhoneInput name="phone" />);
      const input = document.querySelector('input[name="phone"]') as HTMLInputElement;

      await user.type(input, '5551234567');
      expect(input.value).toBe('(555) 123-4567');
    });

    it('formats UK phone number correctly', async () => {
      const user = userEvent.setup();
      render(<PhoneInput name="phone" defaultCountry="GB" />);
      const input = document.querySelector('input[name="phone"]') as HTMLInputElement;

      await user.type(input, '7911123456');
      expect(input.value).toBe('7911 123456');
    });

    it('can disable auto-formatting', async () => {
      const user = userEvent.setup();
      render(<PhoneInput name="phone" autoFormat={false} />);
      const input = document.querySelector('input[name="phone"]') as HTMLInputElement;

      await user.type(input, '5551234567');
      expect(input.value).toBe('5551234567');
    });

    it('reformats when country changes', async () => {
      const user = userEvent.setup();
      render(<PhoneInput name="phone" defaultValue="5551234567" />);
      const input = document.querySelector('input[name="phone"]') as HTMLInputElement;

      // Initially formatted for US
      expect(input.value).toBe('(555) 123-4567');

      // Change to UK
      const countryButton = screen.getByRole('button', { name: /selected country/i });
      await user.click(countryButton);
      const ukOption = screen.getByRole('option', { name: /united kingdom/i });
      await user.click(ukOption);

      // Should reformat for UK
      expect(input.value).toBe('5551 234567');
    });
  });

  describe('user interaction', () => {
    it('handles user input', async () => {
      const user = userEvent.setup();
      render(<PhoneInput name="phone" autoFormat={false} />);
      const input = document.querySelector('input[name="phone"]') as HTMLInputElement;

      await user.type(input, '1234567890');
      expect(input.value).toBe('1234567890');
    });

    it('calls onChange with full phone number', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<PhoneInput name="phone" onChange={onChange} />);
      const input = document.querySelector('input[name="phone"]') as HTMLInputElement;

      await user.type(input, '5551234567');

      // Should be called with full number including country code
      expect(onChange).toHaveBeenCalledWith(
        '+15551234567',
        expect.objectContaining({ code: 'US' }),
      );
    });

    it('calls onBlur handler', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<PhoneInput name="phone" onBlur={onBlur} />);
      const input = document.querySelector('input[name="phone"]') as HTMLInputElement;

      await user.click(input);
      await user.tab();

      expect(onBlur).toHaveBeenCalled();
    });

    it('calls onFocus handler', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      render(<PhoneInput name="phone" onFocus={onFocus} />);
      const input = document.querySelector('input[name="phone"]') as HTMLInputElement;

      await user.click(input);
      expect(onFocus).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('shows required error', async () => {
      const user = userEvent.setup();
      render(
        <PhoneInput
          name="phone"
          label="Phone"
          required
          validationRules={[{ validator: required() }]}
          validateOn="blur"
        />,
      );
      const input = document.querySelector('input[name="phone"]') as HTMLInputElement;

      await user.click(input);
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('calls onValidationChange callback', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      render(
        <PhoneInput
          name="phone"
          validationRules={[{ validator: required() }]}
          validateOn="change"
          onValidationChange={onValidationChange}
        />,
      );
      const input = document.querySelector('input[name="phone"]') as HTMLInputElement;

      await user.type(input, '5551234567');
      expect(onValidationChange).toHaveBeenCalled();
    });
  });

  describe('disabled and readonly states', () => {
    it('renders disabled input', () => {
      render(<PhoneInput name="phone" disabled />);
      const input = document.querySelector('input[name="phone"]');
      expect(input).toBeDisabled();
    });

    it('renders readonly input', () => {
      render(<PhoneInput name="phone" readOnly />);
      const input = document.querySelector('input[name="phone"]');
      expect(input).toHaveAttribute('readonly');
    });

    it('disables country dropdown when disabled', () => {
      render(<PhoneInput name="phone" disabled />);
      const countryButton = screen.getByRole('button', { name: /selected country/i });
      expect(countryButton).toBeDisabled();
    });
  });

  describe('custom countries', () => {
    it('accepts custom country list', () => {
      const customCountries: CountryData[] = [
        { code: 'XX', name: 'Test Country', dialCode: '+99', flag: '🏳️' },
      ];
      render(<PhoneInput name="phone" countries={customCountries} />);

      expect(screen.getByText('+99')).toBeInTheDocument();
      expect(screen.getByText('🏳️')).toBeInTheDocument();
    });
  });
});

describe('formatPhoneNumber', () => {
  it('formats with US pattern', () => {
    expect(formatPhoneNumber('5551234567', '(###) ###-####')).toBe('(555) 123-4567');
  });

  it('formats with UK pattern', () => {
    expect(formatPhoneNumber('7911123456', '#### ######')).toBe('7911 123456');
  });

  it('returns raw digits when no format provided', () => {
    expect(formatPhoneNumber('5551234567')).toBe('5551234567');
  });

  it('handles partial input', () => {
    expect(formatPhoneNumber('555', '(###) ###-####')).toBe('(555');
  });

  it('handles extra digits beyond format', () => {
    expect(formatPhoneNumber('55512345678901', '(###) ###-####')).toBe('(555) 123-45678901');
  });

  it('returns empty string for empty input', () => {
    expect(formatPhoneNumber('', '(###) ###-####')).toBe('');
  });

  it('strips non-digits before formatting', () => {
    expect(formatPhoneNumber('(555) 123-4567', '(###) ###-####')).toBe('(555) 123-4567');
  });
});

describe('parsePhoneNumber', () => {
  it('extracts digits from formatted number', () => {
    expect(parsePhoneNumber('(555) 123-4567')).toBe('5551234567');
  });

  it('handles plain digits', () => {
    expect(parsePhoneNumber('5551234567')).toBe('5551234567');
  });

  it('handles international format', () => {
    expect(parsePhoneNumber('+1-555-123-4567')).toBe('15551234567');
  });

  it('returns empty string for non-numeric input', () => {
    expect(parsePhoneNumber('abc')).toBe('');
  });
});

describe('getFullPhoneNumber', () => {
  const usCountry: CountryData = {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
  };

  it('combines country code with phone number', () => {
    expect(getFullPhoneNumber('5551234567', usCountry)).toBe('+15551234567');
  });

  it('handles formatted input', () => {
    expect(getFullPhoneNumber('(555) 123-4567', usCountry)).toBe('+15551234567');
  });

  it('returns empty for empty phone', () => {
    expect(getFullPhoneNumber('', usCountry)).toBe('');
  });
});

describe('DEFAULT_COUNTRIES', () => {
  it('includes common countries', () => {
    const codes = DEFAULT_COUNTRIES.map((c) => c.code);
    expect(codes).toContain('US');
    expect(codes).toContain('GB');
    expect(codes).toContain('DE');
    expect(codes).toContain('FR');
    expect(codes).toContain('JP');
  });

  it('has valid dial codes', () => {
    DEFAULT_COUNTRIES.forEach((country) => {
      expect(country.dialCode).toMatch(/^\+\d+$/);
    });
  });

  it('has flags for all countries', () => {
    DEFAULT_COUNTRIES.forEach((country) => {
      expect(country.flag).toBeTruthy();
    });
  });
});
