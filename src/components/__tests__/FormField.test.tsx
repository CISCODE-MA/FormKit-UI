/**
 * Tests for FormField component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';

describe('FormField', () => {
  describe('basic rendering', () => {
    it('renders children', () => {
      render(
        <FormField>
          <input type="text" data-testid="test-input" />
        </FormField>,
      );
      expect(screen.getByTestId('test-input')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(
        <FormField>
          <input type="text" />
        </FormField>,
      );
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('renders with label', () => {
      render(
        <FormField label="Username">
          <input type="text" />
        </FormField>,
      );
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('shows required indicator when required', () => {
      render(
        <FormField label="Required Field" required>
          <input type="text" />
        </FormField>,
      );
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not show required indicator when not required', () => {
      render(
        <FormField label="Optional Field">
          <input type="text" />
        </FormField>,
      );
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('hints', () => {
    it('renders hint text', () => {
      render(
        <FormField hint="Enter your username">
          <input type="text" />
        </FormField>,
      );
      expect(screen.getByText('Enter your username')).toBeInTheDocument();
    });

    it('sets correct ID on hint', () => {
      render(
        <FormField hint="Help text" fieldId="test-field">
          <input type="text" />
        </FormField>,
      );
      const hint = screen.getByText('Help text');
      expect(hint).toHaveAttribute('id', 'test-field-hint');
    });

    it('hides hint when error is present', () => {
      render(
        <FormField hint="Help text" error="Error message">
          <input type="text" />
        </FormField>,
      );
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('errors', () => {
    it('renders error message', () => {
      render(
        <FormField error="This field is required">
          <input type="text" />
        </FormField>,
      );
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('sets role="alert" on error message', () => {
      render(
        <FormField error="Error message">
          <input type="text" />
        </FormField>,
      );
      const error = screen.getByText('Error message');
      expect(error).toHaveAttribute('role', 'alert');
    });

    it('sets correct ID on error', () => {
      render(
        <FormField error="Error message" fieldId="test-field">
          <input type="text" />
        </FormField>,
      );
      const error = screen.getByText('Error message');
      expect(error).toHaveAttribute('id', 'test-field-error');
    });

    it('does not show error when showError is false', () => {
      render(
        <FormField error="Error message" showError={false}>
          <input type="text" />
        </FormField>,
      );
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });

    it('does not show error when error is null', () => {
      render(
        <FormField error={null}>
          <input type="text" />
        </FormField>,
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not show error when error is undefined', () => {
      render(
        <FormField error={undefined}>
          <input type="text" />
        </FormField>,
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not show error when error is empty string', () => {
      render(
        <FormField error="">
          <input type="text" />
        </FormField>,
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('label association', () => {
    it('associates label with field via htmlFor', () => {
      render(
        <FormField label="Email" fieldId="email-field">
          <input type="email" id="email-field" />
        </FormField>,
      );
      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'email-field');
    });

    it('does not set htmlFor when fieldId is not provided', () => {
      render(
        <FormField label="Email">
          <input type="email" />
        </FormField>,
      );
      const label = screen.getByText('Email');
      expect(label).not.toHaveAttribute('for');
    });
  });

  describe('styling', () => {
    it('applies custom className to container', () => {
      render(
        <FormField className="custom-container">
          <input type="text" data-testid="test-input" />
        </FormField>,
      );
      const container = screen.getByTestId('test-input').closest('.formkit-field');
      expect(container).toHaveClass('custom-container');
    });

    it('applies custom labelClassName', () => {
      render(
        <FormField label="Custom" labelClassName="custom-label">
          <input type="text" />
        </FormField>,
      );
      const label = screen.getByText('Custom');
      expect(label).toHaveClass('custom-label');
    });

    it('applies custom hintClassName', () => {
      render(
        <FormField hint="Hint" hintClassName="custom-hint">
          <input type="text" />
        </FormField>,
      );
      const hint = screen.getByText('Hint');
      expect(hint).toHaveClass('custom-hint');
    });

    it('applies custom errorClassName', () => {
      render(
        <FormField error="Error" errorClassName="custom-error">
          <input type="text" />
        </FormField>,
      );
      const error = screen.getByText('Error');
      expect(error).toHaveClass('custom-error');
    });

    it('adds error class to container when has error', () => {
      render(
        <FormField error="Error message">
          <input type="text" data-testid="test-input" />
        </FormField>,
      );
      const container = screen.getByTestId('test-input').closest('.formkit-field');
      expect(container).toHaveClass('formkit-field-error');
    });

    it('does not add error class when no error', () => {
      render(
        <FormField>
          <input type="text" data-testid="test-input" />
        </FormField>,
      );
      const container = screen.getByTestId('test-input').closest('.formkit-field');
      expect(container).not.toHaveClass('formkit-field-error');
    });
  });

  describe('multiple children', () => {
    it('renders multiple children', () => {
      render(
        <FormField label="Multiple inputs">
          <input type="text" data-testid="input1" />
          <input type="text" data-testid="input2" />
        </FormField>,
      );
      expect(screen.getByTestId('input1')).toBeInTheDocument();
      expect(screen.getByTestId('input2')).toBeInTheDocument();
    });

    it('wraps children in control div', () => {
      render(
        <FormField>
          <input type="text" data-testid="test-input" />
        </FormField>,
      );
      const input = screen.getByTestId('test-input');
      expect(input.parentElement).toHaveClass('formkit-field-control');
    });
  });

  describe('complex scenarios', () => {
    it('renders with all props', () => {
      render(
        <FormField
          label="Full Example"
          required
          hint="Hint text"
          error="Error message"
          fieldId="full-example"
          className="custom-container"
          labelClassName="custom-label"
          hintClassName="custom-hint"
          errorClassName="custom-error"
        >
          <input type="text" id="full-example" />
        </FormField>,
      );

      expect(screen.getByText('Full Example')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.queryByText('Hint text')).not.toBeInTheDocument(); // Hidden by error
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('switches from hint to error', () => {
      const { rerender } = render(
        <FormField hint="Help text">
          <input type="text" />
        </FormField>,
      );

      expect(screen.getByText('Help text')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      rerender(
        <FormField hint="Help text" error="Error occurred">
          <input type="text" />
        </FormField>,
      );

      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('wraps complex component structures', () => {
      render(
        <FormField label="Complex">
          <div>
            <input type="text" data-testid="input1" />
            <button data-testid="button">Submit</button>
          </div>
        </FormField>,
      );

      expect(screen.getByTestId('input1')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });
  });
});
