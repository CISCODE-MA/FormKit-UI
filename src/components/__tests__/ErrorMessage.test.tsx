/**
 * Tests for ErrorMessage component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  describe('basic rendering', () => {
    it('renders error message', () => {
      render(<ErrorMessage message="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('sets role="alert"', () => {
      render(<ErrorMessage message="Error message" />);
      const error = screen.getByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('sets custom id', () => {
      render(<ErrorMessage message="Error message" id="custom-error-id" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveAttribute('id', 'custom-error-id');
    });

    it('renders without id', () => {
      render(<ErrorMessage message="Error message" />);
      const error = screen.getByRole('alert');
      expect(error).not.toHaveAttribute('id');
    });
  });

  describe('severity levels', () => {
    it('applies error severity class by default', () => {
      render(<ErrorMessage message="Error" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveClass('formkit-error-error');
    });

    it('applies warning severity class', () => {
      render(<ErrorMessage message="Warning" severity="warning" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveClass('formkit-error-warning');
    });

    it('applies info severity class', () => {
      render(<ErrorMessage message="Info" severity="info" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveClass('formkit-error-info');
    });
  });

  describe('error codes', () => {
    it('does not show code by default', () => {
      render(<ErrorMessage message="Error message" code="ERR_001" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText(/\[ERR_001\]/)).not.toBeInTheDocument();
    });

    it('shows code when showCode is true', () => {
      render(<ErrorMessage message="Error message" code="ERR_001" showCode />);
      expect(screen.getByText('[ERR_001] Error message')).toBeInTheDocument();
    });

    it('does not show code brackets when no code provided', () => {
      render(<ErrorMessage message="Error message" showCode />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText(/\[\]/)).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<ErrorMessage message="Error" className="custom-error" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveClass('custom-error');
    });

    it('applies base formkit-error class', () => {
      render(<ErrorMessage message="Error" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveClass('formkit-error');
    });

    it('applies dismissible class when dismissible', () => {
      render(<ErrorMessage message="Error" dismissible />);
      const error = screen.getByRole('alert');
      expect(error).toHaveClass('formkit-error-dismissible');
    });

    it('does not apply dismissible class when not dismissible', () => {
      render(<ErrorMessage message="Error" />);
      const error = screen.getByRole('alert');
      expect(error).not.toHaveClass('formkit-error-dismissible');
    });
  });

  describe('dismissible errors', () => {
    it('does not show dismiss button by default', () => {
      render(<ErrorMessage message="Error" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows dismiss button when dismissible and onDismiss provided', () => {
      const onDismiss = vi.fn();
      render(<ErrorMessage message="Error" dismissible onDismiss={onDismiss} />);
      expect(screen.getByRole('button', { name: 'Dismiss error' })).toBeInTheDocument();
    });

    it('does not show dismiss button when dismissible but no onDismiss', () => {
      render(<ErrorMessage message="Error" dismissible />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      render(<ErrorMessage message="Error" dismissible onDismiss={onDismiss} />);
      const dismissButton = screen.getByRole('button', { name: 'Dismiss error' });

      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('dismiss button has correct aria-label', () => {
      const onDismiss = vi.fn();
      render(<ErrorMessage message="Error" dismissible onDismiss={onDismiss} />);
      const dismissButton = screen.getByRole('button');
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss error');
    });

    it('dismiss button has type="button"', () => {
      const onDismiss = vi.fn();
      render(<ErrorMessage message="Error" dismissible onDismiss={onDismiss} />);
      const dismissButton = screen.getByRole('button');
      expect(dismissButton).toHaveAttribute('type', 'button');
    });
  });

  describe('complex scenarios', () => {
    it('renders with all props', () => {
      const onDismiss = vi.fn();
      render(
        <ErrorMessage
          message="Complex error"
          severity="warning"
          code="WARN_001"
          showCode
          id="complex-error"
          className="custom-class"
          dismissible
          onDismiss={onDismiss}
        />,
      );

      const error = screen.getByRole('alert');
      expect(error).toHaveAttribute('id', 'complex-error');
      expect(error).toHaveClass('formkit-error-warning');
      expect(error).toHaveClass('custom-class');
      expect(screen.getByText('[WARN_001] Complex error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Dismiss error' })).toBeInTheDocument();
    });

    it('handles multiple errors with different severities', () => {
      const { container } = render(
        <div>
          <ErrorMessage message="Error 1" severity="error" />
          <ErrorMessage message="Warning 1" severity="warning" />
          <ErrorMessage message="Info 1" severity="info" />
        </div>,
      );

      const errors = container.querySelectorAll('.formkit-error');
      expect(errors).toHaveLength(3);
      expect(errors[0]).toHaveClass('formkit-error-error');
      expect(errors[1]).toHaveClass('formkit-error-warning');
      expect(errors[2]).toHaveClass('formkit-error-info');
    });

    it('renders message text in span with correct class', () => {
      render(<ErrorMessage message="Test message" />);
      const messageSpan = screen.getByText('Test message');
      expect(messageSpan.tagName).toBe('SPAN');
      expect(messageSpan).toHaveClass('formkit-error-message');
    });
  });

  describe('accessibility', () => {
    it('has role="alert" for screen readers', () => {
      render(<ErrorMessage message="Accessible error" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('can be referenced by aria-describedby', () => {
      render(
        <div>
          <input aria-describedby="error-1" />
          <ErrorMessage message="Field error" id="error-1" />
        </div>,
      );
      const error = screen.getByRole('alert');
      expect(error).toHaveAttribute('id', 'error-1');
    });

    it('dismiss button is keyboard accessible', () => {
      const onDismiss = vi.fn();
      render(<ErrorMessage message="Error" dismissible onDismiss={onDismiss} />);
      const dismissButton = screen.getByRole('button');
      dismissButton.focus();
      expect(dismissButton).toHaveFocus();
    });
  });
});
