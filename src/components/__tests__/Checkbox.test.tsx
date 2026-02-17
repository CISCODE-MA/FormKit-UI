/**
 * Tests for Checkbox component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../Checkbox';
import { required } from '../../validation/validators';

describe('Checkbox', () => {
  describe('basic rendering', () => {
    it('renders checkbox with name', () => {
      render(<Checkbox name="agree" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('name', 'agree');
    });

    it('renders unchecked by default', () => {
      render(<Checkbox name="agree" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('renders with default checked state', () => {
      render(<Checkbox name="agree" defaultChecked />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('renders with checkbox label', () => {
      render(<Checkbox name="agree" checkboxLabel="I agree to terms" />);
      const label = screen.getByText('I agree to terms');
      expect(label).toBeInTheDocument();
    });

    it('renders with container label', () => {
      render(<Checkbox name="agree" label="Agreements" checkboxLabel="I agree" />);
      const containerLabel = screen.getByText('Agreements');
      expect(containerLabel).toBeInTheDocument();
    });

    it('renders without any label', () => {
      render(<Checkbox name="agree" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('label and accessibility', () => {
    it('associates checkbox label with input', () => {
      render(<Checkbox name="agree" checkboxLabel="I agree to terms" />);
      const checkbox = screen.getByLabelText('I agree to terms');
      expect(checkbox).toBeInTheDocument();
    });

    it('shows required indicator on container label', () => {
      render(<Checkbox name="agree" label="Required Field" required />);
      const required = screen.getByText('*');
      expect(required).toBeInTheDocument();
    });

    it('renders with hint text', () => {
      render(<Checkbox name="agree" hint="Please check to continue" />);
      const hint = screen.getByText('Please check to continue');
      expect(hint).toBeInTheDocument();
    });

    it('sets aria-describedby for hint', () => {
      render(<Checkbox name="agree" hint="Helper text" />);
      const checkbox = screen.getByRole('checkbox');
      const describedBy = checkbox.getAttribute('aria-describedby');
      expect(describedBy).toContain('hint');
    });
  });

  describe('user interaction', () => {
    it('toggles checked state on click', async () => {
      const user = userEvent.setup();
      render(<Checkbox name="agree" />);
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).not.toBeChecked();
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Checkbox name="agree" onChange={onChange} />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      expect(onChange).toHaveBeenCalledWith(true);

      await user.click(checkbox);
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('calls onBlur handler', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<Checkbox name="agree" onBlur={onBlur} />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      await user.tab();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus handler', async () => {
      const onFocus = vi.fn();
      render(<Checkbox name="agree" onFocus={onFocus} />);
      const checkbox = screen.getByRole('checkbox');

      checkbox.focus();
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('can be checked by clicking label', async () => {
      const user = userEvent.setup();
      render(<Checkbox name="agree" checkboxLabel="I agree" />);
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('I agree');

      expect(checkbox).not.toBeChecked();
      await user.click(label);
      expect(checkbox).toBeChecked();
    });
  });

  describe('validation', () => {
    it('shows error after validation fails', async () => {
      const user = userEvent.setup();
      const mustBeChecked = () => (value: unknown) => {
        return value === true ? null : 'Must be checked';
      };

      render(
        <Checkbox
          name="agree"
          checkboxLabel="I agree"
          validationRules={[{ validator: mustBeChecked() }]}
          validateOn="blur"
        />,
      );
      const checkbox = screen.getByRole('checkbox');

      // Focus and blur without checking
      checkbox.focus();
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('shows required error', async () => {
      const user = userEvent.setup();
      render(
        <Checkbox
          name="agree"
          checkboxLabel="Required"
          required
          validationRules={[{ validator: required() }]}
          validateOn="blur"
        />,
      );
      const checkbox = screen.getByRole('checkbox');

      // Focus and blur without checking
      checkbox.focus();
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('This field is required');
    });

    it('validates on change when configured', async () => {
      const user = userEvent.setup();
      const mustBeChecked = () => (value: unknown) => {
        return value === true ? null : 'Must be checked';
      };

      render(
        <Checkbox
          name="agree"
          checkboxLabel="I agree"
          validationRules={[{ validator: mustBeChecked() }]}
          validateOn="change"
          defaultChecked
        />,
      );
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox); // Uncheck
      await user.tab(); // Blur to mark as touched

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('does not show error when showError is false', async () => {
      const user = userEvent.setup();
      render(
        <Checkbox
          name="agree"
          validationRules={[{ validator: required() }]}
          validateOn="blur"
          showError={false}
        />,
      );
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      await user.tab();

      const error = screen.queryByRole('alert');
      expect(error).not.toBeInTheDocument();
    });

    it('calls onValidationChange', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      render(
        <Checkbox
          name="agree"
          validationRules={[{ validator: required() }]}
          validateOn="change"
          onValidationChange={onValidationChange}
        />,
      );
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);

      expect(onValidationChange).toHaveBeenCalled();
    });
  });

  describe('indeterminate state', () => {
    it('sets indeterminate property', () => {
      render(<Checkbox name="agree" indeterminate />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });

    it('updates indeterminate state when prop changes', () => {
      const { rerender } = render(<Checkbox name="agree" indeterminate={false} />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);

      rerender(<Checkbox name="agree" indeterminate={true} />);
      expect(checkbox.indeterminate).toBe(true);
    });

    it('does not set indeterminate by default', () => {
      render(<Checkbox name="agree" />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(false);
    });
  });

  describe('states', () => {
    it('renders as disabled', () => {
      render(<Checkbox name="agree" disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('cannot be checked when disabled', async () => {
      const user = userEvent.setup();
      render(<Checkbox name="agree" disabled />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('renders as readOnly', () => {
      render(<Checkbox name="agree" readOnly />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('readOnly');
    });

    it('marks as required', () => {
      render(<Checkbox name="agree" required />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeRequired();
    });

    it('adds error class when has error', async () => {
      const user = userEvent.setup();
      const mustBeChecked = () => (value: unknown) => {
        return value === true ? null : 'Must be checked';
      };

      render(
        <Checkbox
          name="agree"
          validationRules={[{ validator: mustBeChecked() }]}
          validateOn="blur"
        />,
      );
      const checkbox = screen.getByRole('checkbox');

      // Focus and blur without checking
      checkbox.focus();
      await user.tab();

      await screen.findByRole('alert');
      expect(checkbox).toHaveClass('formkit-checkbox-error');
    });

    it('sets aria-invalid when has error', async () => {
      const user = userEvent.setup();
      const mustBeChecked = () => (value: unknown) => {
        return value === true ? null : 'Must be checked';
      };

      render(
        <Checkbox
          name="agree"
          validationRules={[{ validator: mustBeChecked() }]}
          validateOn="blur"
        />,
      );
      const checkbox = screen.getByRole('checkbox');

      // Focus and blur without checking
      checkbox.focus();
      await user.tab();

      await screen.findByRole('alert');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('styling', () => {
    it('applies custom className to container', () => {
      const { container } = render(<Checkbox name="agree" className="custom-class" />);
      const checkboxContainer = container.querySelector('.formkit-checkbox-container');
      expect(checkboxContainer).toHaveClass('custom-class');
    });

    it('applies custom checkboxClassName to wrapper', () => {
      const { container } = render(<Checkbox name="agree" checkboxClassName="custom-wrapper" />);
      const wrapper = container.querySelector('.formkit-checkbox-wrapper');
      expect(wrapper).toHaveClass('custom-wrapper');
    });
  });
});
