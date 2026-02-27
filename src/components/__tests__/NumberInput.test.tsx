/**
 * Tests for NumberInput component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberInput, formatNumber, parseFormattedNumber } from '../NumberInput';
import { required } from '../../validation/validators';

describe('NumberInput', () => {
  describe('basic rendering', () => {
    it('renders input with name', () => {
      render(<NumberInput name="quantity" />);
      const input = document.querySelector('input[name="quantity"]');
      expect(input).toBeInTheDocument();
    });

    it('renders with text type and decimal inputMode', () => {
      render(<NumberInput name="quantity" />);
      const input = document.querySelector('input[name="quantity"]');
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('inputMode', 'decimal');
    });

    it('renders with placeholder', () => {
      render(<NumberInput name="quantity" placeholder="Enter amount" />);
      const input = screen.getByPlaceholderText('Enter amount');
      expect(input).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<NumberInput name="quantity" defaultValue={42} />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;
      expect(input.value).toBe('42');
    });
  });

  describe('label and accessibility', () => {
    it('renders with label', () => {
      render(<NumberInput name="quantity" label="Quantity" />);
      const label = screen.getByText('Quantity');
      expect(label).toBeInTheDocument();
    });

    it('associates label with input', () => {
      render(<NumberInput name="quantity" label="Quantity" />);
      const input = screen.getByLabelText('Quantity');
      expect(input).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<NumberInput name="quantity" label="Quantity" required />);
      const required = screen.getAllByText('*');
      expect(required.length).toBeGreaterThan(0);
    });

    it('renders with hint text', () => {
      render(<NumberInput name="quantity" hint="Enter a number between 1-100" />);
      const hint = screen.getByText('Enter a number between 1-100');
      expect(hint).toBeInTheDocument();
    });

    it('has proper sr-only label when no visible label', () => {
      render(<NumberInput name="quantity" />);
      const label = document.querySelector('label.sr-only');
      expect(label).toBeInTheDocument();
    });

    it('sets aria-valuemin and aria-valuemax', () => {
      render(<NumberInput name="quantity" min={0} max={100} />);
      const input = document.querySelector('input[name="quantity"]');
      expect(input).toHaveAttribute('aria-valuemin', '0');
      expect(input).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('increment/decrement buttons', () => {
    it('renders increment and decrement buttons by default', () => {
      render(<NumberInput name="quantity" />);
      const increaseBtn = screen.getByRole('button', { name: /increase/i });
      const decreaseBtn = screen.getByRole('button', { name: /decrease/i });
      expect(increaseBtn).toBeInTheDocument();
      expect(decreaseBtn).toBeInTheDocument();
    });

    it('does not render buttons when showButtons is false', () => {
      render(<NumberInput name="quantity" showButtons={false} />);
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });

    it('increments value on button click', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="quantity" defaultValue={5} />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;
      const increaseBtn = screen.getByRole('button', { name: /increase/i });

      await user.click(increaseBtn);
      expect(input.value).toBe('6');
    });

    it('decrements value on button click', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="quantity" defaultValue={5} />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;
      const decreaseBtn = screen.getByRole('button', { name: /decrease/i });

      await user.click(decreaseBtn);
      expect(input.value).toBe('4');
    });

    it('respects step value', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="quantity" defaultValue={10} step={5} />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;
      const increaseBtn = screen.getByRole('button', { name: /increase/i });

      await user.click(increaseBtn);
      expect(input.value).toBe('15');
    });

    it('disables increment at max', async () => {
      render(<NumberInput name="quantity" defaultValue={10} max={10} />);
      const increaseBtn = screen.getByRole('button', { name: /increase/i });
      expect(increaseBtn).toBeDisabled();
    });

    it('disables decrement at min', async () => {
      render(<NumberInput name="quantity" defaultValue={0} min={0} />);
      const decreaseBtn = screen.getByRole('button', { name: /decrease/i });
      expect(decreaseBtn).toBeDisabled();
    });

    it('buttons have no tab focus (tabIndex=-1)', () => {
      render(<NumberInput name="quantity" />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('keyboard navigation', () => {
    it('increments on ArrowUp', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="quantity" defaultValue={5} />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;

      await user.click(input);
      await user.keyboard('{ArrowUp}');

      expect(input.value).toBe('6');
    });

    it('decrements on ArrowDown', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="quantity" defaultValue={5} />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;

      await user.click(input);
      await user.keyboard('{ArrowDown}');

      expect(input.value).toBe('4');
    });
  });

  describe('min/max constraints', () => {
    it('clamps value to max on blur', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="quantity" max={10} />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;

      await user.type(input, '15');
      await user.tab();

      expect(input.value).toBe('10');
    });

    it('clamps value to min on blur', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="quantity" min={5} />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;

      await user.type(input, '2');
      await user.tab();

      expect(input.value).toBe('5');
    });
  });

  describe('user interaction', () => {
    it('handles user input', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="quantity" />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;

      await user.type(input, '123');
      expect(input.value).toBe('123');
    });

    it('calls onChange handler with number', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<NumberInput name="quantity" onChange={onChange} />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;

      await user.type(input, '42');
      expect(onChange).toHaveBeenCalledWith(42);
    });

    it('calls onBlur handler', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<NumberInput name="quantity" onBlur={onBlur} />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;

      await user.click(input);
      await user.tab();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus handler', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      render(<NumberInput name="quantity" onFocus={onFocus} />);
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;

      await user.click(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation', () => {
    it('shows required error', async () => {
      const user = userEvent.setup();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          required
          validationRules={[{ validator: required() }]}
          validateOn="blur"
        />,
      );
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;

      await user.click(input);
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('calls onValidationChange callback', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          validationRules={[{ validator: required() }]}
          validateOn="change"
          onValidationChange={onValidationChange}
        />,
      );
      const input = document.querySelector('input[name="quantity"]') as HTMLInputElement;

      await user.type(input, '5');
      expect(onValidationChange).toHaveBeenCalled();
    });
  });

  describe('number formatting', () => {
    it('formats number with thousands separator', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="amount" format={{ thousandsSeparator: ',' }} />);
      const input = document.querySelector('input[name="amount"]') as HTMLInputElement;

      await user.type(input, '1000000');
      await user.tab();

      expect(input.value).toBe('1,000,000');
    });

    it('formats with prefix', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="price" format={{ prefix: '$', thousandsSeparator: ',' }} />);
      const input = document.querySelector('input[name="price"]') as HTMLInputElement;

      await user.type(input, '1000');
      await user.tab();

      expect(input.value).toBe('$1,000');
    });

    it('formats with suffix', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="percent" format={{ suffix: '%' }} />);
      const input = document.querySelector('input[name="percent"]') as HTMLInputElement;

      await user.type(input, '75');
      await user.tab();

      expect(input.value).toBe('75%');
    });

    it('formats with decimal places', async () => {
      const user = userEvent.setup();
      render(<NumberInput name="price" format={{ decimalPlaces: 2 }} />);
      const input = document.querySelector('input[name="price"]') as HTMLInputElement;

      await user.type(input, '10');
      await user.tab();

      expect(input.value).toBe('10.00');
    });

    it('displays formatted default value', () => {
      render(
        <NumberInput
          name="amount"
          defaultValue={1234567}
          format={{ thousandsSeparator: ',', prefix: '$' }}
        />,
      );
      const input = document.querySelector('input[name="amount"]') as HTMLInputElement;
      expect(input.value).toBe('$1,234,567');
    });
  });

  describe('disabled and readonly states', () => {
    it('renders disabled input', () => {
      render(<NumberInput name="quantity" disabled />);
      const input = document.querySelector('input[name="quantity"]');
      expect(input).toBeDisabled();
    });

    it('renders readonly input', () => {
      render(<NumberInput name="quantity" readOnly />);
      const input = document.querySelector('input[name="quantity"]');
      expect(input).toHaveAttribute('readonly');
    });

    it('does not increment/decrement when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<NumberInput name="quantity" defaultValue={5} disabled onChange={onChange} />);

      const increaseBtn = screen.getByRole('button', { name: /increase/i });
      await user.click(increaseBtn);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('button positions', () => {
    it('renders buttons on right by default', () => {
      render(<NumberInput name="quantity" />);
      const container = document.querySelector('.formkit-number-container');
      expect(container).toBeInTheDocument();
      // Both buttons should be present
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(2);
    });

    it('renders buttons on sides when buttonPosition is sides', () => {
      render(<NumberInput name="quantity" buttonPosition="sides" />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(2);
    });
  });
});

describe('formatNumber', () => {
  it('formats with thousands separator', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats with decimal places', () => {
    expect(formatNumber(123.4, { decimalPlaces: 2 })).toBe('123.40');
  });

  it('formats with prefix', () => {
    expect(formatNumber(100, { prefix: '$' })).toBe('$100');
  });

  it('formats with suffix', () => {
    expect(formatNumber(50, { suffix: '%' })).toBe('50%');
  });

  it('formats with custom separators', () => {
    expect(
      formatNumber(1234567.89, {
        thousandsSeparator: ' ',
        decimalSeparator: ',',
        decimalPlaces: 2,
      }),
    ).toBe('1 234 567,89');
  });

  it('returns empty string for null', () => {
    expect(formatNumber(null)).toBe('');
  });

  it('returns empty string for NaN', () => {
    expect(formatNumber(NaN)).toBe('');
  });
});

describe('parseFormattedNumber', () => {
  it('parses simple number', () => {
    expect(parseFormattedNumber('123')).toBe(123);
  });

  it('parses number with thousands separator', () => {
    expect(parseFormattedNumber('1,234,567')).toBe(1234567);
  });

  it('parses number with prefix', () => {
    expect(parseFormattedNumber('$1,000', { prefix: '$' })).toBe(1000);
  });

  it('parses number with suffix', () => {
    expect(parseFormattedNumber('50%', { suffix: '%' })).toBe(50);
  });

  it('parses number with custom separators', () => {
    expect(
      parseFormattedNumber('1 234,56', {
        thousandsSeparator: ' ',
        decimalSeparator: ',',
      }),
    ).toBe(1234.56);
  });

  it('returns null for empty string', () => {
    expect(parseFormattedNumber('')).toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(parseFormattedNumber('abc')).toBeNull();
  });
});
