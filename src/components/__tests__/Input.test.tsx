/**
 * Tests for Input component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';
import { required, email, minLength } from '../../validation/validators';

describe('Input', () => {
  describe('basic rendering', () => {
    it('renders input with name', () => {
      render(<Input name="username" />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('name', 'username');
    });

    it('renders with default text type', () => {
      render(<Input name="field" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with specified type', () => {
      render(<Input name="email" type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders with placeholder', () => {
      render(<Input name="field" placeholder="Enter value" />);
      const input = screen.getByPlaceholderText('Enter value');
      expect(input).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<Input name="field" defaultValue="test" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('test');
    });
  });

  describe('label and accessibility', () => {
    it('renders with label', () => {
      render(<Input name="username" label="Username" />);
      const label = screen.getByText('Username');
      expect(label).toBeInTheDocument();
    });

    it('associates label with input', () => {
      render(<Input name="username" label="Username" />);
      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<Input name="field" label="Required Field" required />);
      const required = screen.getByText('*');
      expect(required).toBeInTheDocument();
    });

    it('renders with hint text', () => {
      render(<Input name="field" hint="Enter at least 3 characters" />);
      const hint = screen.getByText('Enter at least 3 characters');
      expect(hint).toBeInTheDocument();
    });

    it('sets aria-describedby for hint', () => {
      render(<Input name="field" hint="Helper text" />);
      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
    });
  });

  describe('user interaction', () => {
    it('handles user input', async () => {
      const user = userEvent.setup();
      render(<Input name="field" />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'hello');
      expect(input).toHaveValue('hello');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Input name="field" onChange={onChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');
      expect(onChange).toHaveBeenCalled();
    });

    it('calls onBlur handler', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<Input name="field" onBlur={onBlur} />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus handler', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      render(<Input name="field" onFocus={onFocus} />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation', () => {
    it('shows error after validation fails', async () => {
      const user = userEvent.setup();
      render(
        <Input
          name="email"
          label="Email"
          validationRules={[{ validator: email() }]}
          validateOn="blur"
        />,
      );
      const input = screen.getByRole('textbox');

      await user.type(input, 'invalid-email');
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('shows required error', async () => {
      const user = userEvent.setup();
      render(
        <Input
          name="field"
          label="Required"
          required
          validationRules={[{ validator: required() }]}
          validateOn="blur"
        />,
      );
      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('This field is required');
    });

    it('validates on change when configured', async () => {
      const user = userEvent.setup();
      render(
        <Input
          name="username"
          validationRules={[{ validator: minLength(3) }]}
          validateOn="change"
        />,
      );
      const input = screen.getByRole('textbox');

      await user.type(input, 'ab');
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('does not show error when showError is false', async () => {
      const user = userEvent.setup();
      render(
        <Input
          name="field"
          validationRules={[{ validator: required() }]}
          validateOn="blur"
          showError={false}
        />,
      );
      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();

      const error = screen.queryByRole('alert');
      expect(error).not.toBeInTheDocument();
    });

    it('calls onValidationChange', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      render(
        <Input
          name="email"
          validationRules={[{ validator: email() }]}
          validateOn="blur"
          onValidationChange={onValidationChange}
        />,
      );
      const input = screen.getByRole('textbox');

      await user.type(input, 'test@example.com');
      await user.tab();

      expect(onValidationChange).toHaveBeenCalled();
    });
  });

  describe('input attributes', () => {
    it('sets maxLength attribute', () => {
      render(<Input name="field" maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('sets min and max for number input', () => {
      render(<Input name="age" type="number" min={0} max={100} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });

    it('sets step for number input', () => {
      render(<Input name="price" type="number" step={0.01} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.01');
    });

    it('sets pattern attribute', () => {
      render(<Input name="code" pattern="[0-9]{4}" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]{4}');
    });

    it('sets autoComplete attribute', () => {
      render(<Input name="email" autoComplete="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });
  });

  describe('states', () => {
    it('renders as disabled', () => {
      render(<Input name="field" disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('renders as readOnly', () => {
      render(<Input name="field" readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readOnly');
    });

    it('marks as required', () => {
      render(<Input name="field" required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('adds error class when has error', async () => {
      const user = userEvent.setup();
      render(
        <Input name="field" validationRules={[{ validator: required() }]} validateOn="blur" />,
      );
      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();

      await screen.findByRole('alert');
      expect(input).toHaveClass('formkit-input-error');
    });

    it('sets aria-invalid when has error', async () => {
      const user = userEvent.setup();
      render(
        <Input name="field" validationRules={[{ validator: required() }]} validateOn="blur" />,
      );
      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.tab();

      await screen.findByRole('alert');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('styling', () => {
    it('applies custom className to container', () => {
      const { container } = render(<Input name="field" className="custom-class" />);
      const inputContainer = container.querySelector('.formkit-input-container');
      expect(inputContainer).toHaveClass('custom-class');
    });

    it('applies custom inputClassName to input', () => {
      render(<Input name="field" inputClassName="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });
  });
});
