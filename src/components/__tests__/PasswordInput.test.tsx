/**
 * Tests for PasswordInput component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PasswordInput,
  calculatePasswordStrength,
  type PasswordStrengthResult,
} from '../PasswordInput';
import { required, minLength } from '../../validation/validators';

describe('PasswordInput', () => {
  describe('basic rendering', () => {
    it('renders input with name', () => {
      render(<PasswordInput name="password" />);
      const input = document.querySelector('input[name="password"]');
      expect(input).toBeInTheDocument();
    });

    it('renders with password type by default', () => {
      render(<PasswordInput name="password" />);
      const input = document.querySelector('input[name="password"]');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders with placeholder', () => {
      render(<PasswordInput name="password" placeholder="Enter password" />);
      const input = screen.getByPlaceholderText('Enter password');
      expect(input).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<PasswordInput name="password" defaultValue="secret" />);
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;
      expect(input.value).toBe('secret');
    });
  });

  describe('label and accessibility', () => {
    it('renders with label', () => {
      render(<PasswordInput name="password" label="Password" />);
      const label = screen.getByText('Password');
      expect(label).toBeInTheDocument();
    });

    it('associates label with input', () => {
      render(<PasswordInput name="password" label="Password" />);
      const input = screen.getByLabelText('Password');
      expect(input).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<PasswordInput name="password" label="Password" required />);
      const required = screen.getAllByText('*');
      expect(required.length).toBeGreaterThan(0);
    });

    it('renders with hint text', () => {
      render(<PasswordInput name="password" hint="Minimum 8 characters" />);
      const hint = screen.getByText('Minimum 8 characters');
      expect(hint).toBeInTheDocument();
    });

    it('has proper sr-only label when no visible label', () => {
      render(<PasswordInput name="password" />);
      const label = document.querySelector('label.sr-only');
      expect(label).toBeInTheDocument();
    });
  });

  describe('visibility toggle', () => {
    it('renders toggle button by default', () => {
      render(<PasswordInput name="password" />);
      const toggle = screen.getByRole('button', { name: /show password/i });
      expect(toggle).toBeInTheDocument();
    });

    it('does not render toggle when showToggle is false', () => {
      render(<PasswordInput name="password" showToggle={false} />);
      const toggle = screen.queryByRole('button', { name: /show password/i });
      expect(toggle).not.toBeInTheDocument();
    });

    it('does not render toggle when disabled', () => {
      render(<PasswordInput name="password" disabled />);
      const toggle = screen.queryByRole('button', { name: /show password/i });
      expect(toggle).not.toBeInTheDocument();
    });

    it('toggles password visibility on click', async () => {
      const user = userEvent.setup();
      render(<PasswordInput name="password" />);
      const input = document.querySelector('input[name="password"]');
      const toggle = screen.getByRole('button', { name: /show password/i });

      expect(input).toHaveAttribute('type', 'password');

      await user.click(toggle);
      expect(input).toHaveAttribute('type', 'text');

      // Button should now say "Hide password"
      const hideToggle = screen.getByRole('button', { name: /hide password/i });
      expect(hideToggle).toBeInTheDocument();

      await user.click(hideToggle);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('toggle button has no tab focus (tabIndex=-1)', () => {
      render(<PasswordInput name="password" />);
      const toggle = screen.getByRole('button', { name: /show password/i });
      expect(toggle).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('user interaction', () => {
    it('handles user input', async () => {
      const user = userEvent.setup();
      render(<PasswordInput name="password" />);
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.type(input, 'secret123');
      expect(input.value).toBe('secret123');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<PasswordInput name="password" onChange={onChange} />);
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.type(input, 'test');
      expect(onChange).toHaveBeenCalled();
    });

    it('calls onBlur handler', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<PasswordInput name="password" onBlur={onBlur} />);
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.click(input);
      await user.tab();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus handler', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      render(<PasswordInput name="password" onFocus={onFocus} />);
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.click(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation', () => {
    it('shows error after validation fails', async () => {
      const user = userEvent.setup();
      render(
        <PasswordInput
          name="password"
          label="Password"
          validationRules={[{ validator: minLength(8) }]}
          validateOn="blur"
        />,
      );
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.type(input, 'short');
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('shows required error', async () => {
      const user = userEvent.setup();
      render(
        <PasswordInput
          name="password"
          label="Password"
          required
          validationRules={[{ validator: required() }]}
          validateOn="blur"
        />,
      );
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.click(input);
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('calls onValidationChange callback', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          validationRules={[{ validator: required() }]}
          validateOn="change"
          onValidationChange={onValidationChange}
        />,
      );
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.type(input, 'test');
      expect(onValidationChange).toHaveBeenCalled();
    });
  });

  describe('password strength meter', () => {
    it('does not show strength meter by default', () => {
      render(<PasswordInput name="password" defaultValue="test" />);
      const strengthMeter = document.querySelector('.formkit-password-strength');
      expect(strengthMeter).not.toBeInTheDocument();
    });

    it('shows strength meter when enabled', async () => {
      const user = userEvent.setup();
      render(<PasswordInput name="password" showStrengthMeter />);
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.type(input, 'test');

      const strengthMeter = document.querySelector('.formkit-password-strength');
      expect(strengthMeter).toBeInTheDocument();
    });

    it('shows strength level text', async () => {
      const user = userEvent.setup();
      render(<PasswordInput name="password" showStrengthMeter />);
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.type(input, 'weak');
      expect(screen.getByText(/weak|fair|good|strong/i)).toBeInTheDocument();
    });

    it('strength meter has progressbar role', async () => {
      const user = userEvent.setup();
      render(<PasswordInput name="password" showStrengthMeter />);
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.type(input, 'test');

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('calls onStrengthChange callback', async () => {
      const user = userEvent.setup();
      const onStrengthChange = vi.fn();
      render(
        <PasswordInput name="password" showStrengthMeter onStrengthChange={onStrengthChange} />,
      );
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.type(input, 'StrongPass123!');
      expect(onStrengthChange).toHaveBeenCalled();
    });

    it('uses custom strength calculator', async () => {
      const user = userEvent.setup();
      const customCalculator = vi.fn(
        (): PasswordStrengthResult => ({
          strength: 'strong',
          score: 100,
          feedback: [],
        }),
      );

      render(
        <PasswordInput name="password" showStrengthMeter strengthCalculator={customCalculator} />,
      );
      const input = document.querySelector('input[name="password"]') as HTMLInputElement;

      await user.type(input, 'any');
      expect(customCalculator).toHaveBeenCalled();
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });
  });

  describe('disabled and readonly states', () => {
    it('renders disabled input', () => {
      render(<PasswordInput name="password" disabled />);
      const input = document.querySelector('input[name="password"]');
      expect(input).toBeDisabled();
    });

    it('renders readonly input', () => {
      render(<PasswordInput name="password" readOnly />);
      const input = document.querySelector('input[name="password"]');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('autocomplete attribute', () => {
    it('defaults to current-password', () => {
      render(<PasswordInput name="password" />);
      const input = document.querySelector('input[name="password"]');
      expect(input).toHaveAttribute('autocomplete', 'current-password');
    });

    it('accepts new-password for registration forms', () => {
      render(<PasswordInput name="password" autoComplete="new-password" />);
      const input = document.querySelector('input[name="password"]');
      expect(input).toHaveAttribute('autocomplete', 'new-password');
    });

    it('accepts off to disable autocomplete', () => {
      render(<PasswordInput name="password" autoComplete="off" />);
      const input = document.querySelector('input[name="password"]');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });
  });
});

describe('calculatePasswordStrength', () => {
  it('returns weak for empty password', () => {
    const result = calculatePasswordStrength('');
    expect(result.strength).toBe('weak');
    expect(result.score).toBe(0);
  });

  it('returns weak for short passwords', () => {
    const result = calculatePasswordStrength('abc');
    expect(result.strength).toBe('weak');
  });

  it('returns fair for medium passwords', () => {
    const result = calculatePasswordStrength('password1');
    expect(result.strength).toBe('fair');
  });

  it('returns good for decent passwords', () => {
    const result = calculatePasswordStrength('Password1');
    expect(result.strength).toBe('good');
  });

  it('returns strong for complex passwords', () => {
    const result = calculatePasswordStrength('MyP@ssword123!');
    expect(result.strength).toBe('strong');
  });

  it('provides feedback for missing lowercase', () => {
    const result = calculatePasswordStrength('PASSWORD123!');
    expect(result.feedback).toContain('Add lowercase letters');
  });

  it('provides feedback for missing uppercase', () => {
    const result = calculatePasswordStrength('password123!');
    expect(result.feedback).toContain('Add uppercase letters');
  });

  it('provides feedback for missing numbers', () => {
    const result = calculatePasswordStrength('Password!');
    expect(result.feedback).toContain('Add numbers');
  });

  it('provides feedback for missing special characters', () => {
    const result = calculatePasswordStrength('Password123');
    expect(result.feedback).toContain('Add special characters');
  });

  it('provides feedback for short length', () => {
    const result = calculatePasswordStrength('Pass1!');
    expect(result.feedback).toContain('Use at least 8 characters');
  });

  it('caps score at 100', () => {
    const result = calculatePasswordStrength('VeryLongComplexP@ssword123!@#$%');
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
