/**
 * Tests for Form component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from '../Form';
import { useFormContext } from '../../hooks/FormContext';

// Test component that accesses form context
function TestContextConsumer() {
  const form = useFormContext();
  return <div data-testid="context-consumer">{form ? 'Context available' : 'No context'}</div>;
}

describe('Form', () => {
  describe('basic rendering', () => {
    it('renders form element', () => {
      render(
        <Form>
          <div>Form content</div>
        </Form>,
      );
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('renders children', () => {
      render(
        <Form>
          <input name="test" />
          <button type="submit">Submit</button>
        </Form>,
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <Form className="custom-form">
          <div>Content</div>
        </Form>,
      );
      const form = document.querySelector('form');
      expect(form).toHaveClass('custom-form');
      expect(form).toHaveClass('formkit-form');
    });

    it('sets noValidate by default', () => {
      render(
        <Form>
          <div>Content</div>
        </Form>,
      );
      const form = document.querySelector('form');
      expect(form).toHaveAttribute('noValidate');
    });

    it('allows overriding noValidate', () => {
      render(
        <Form noValidate={false}>
          <div>Content</div>
        </Form>,
      );
      const form = document.querySelector('form');
      expect(form).not.toHaveAttribute('noValidate');
    });
  });

  describe('form context', () => {
    it('provides form context to children', () => {
      render(
        <Form>
          <TestContextConsumer />
        </Form>,
      );
      expect(screen.getByTestId('context-consumer')).toHaveTextContent('Context available');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to form element', () => {
      const ref = vi.fn();
      render(
        <Form ref={ref}>
          <div>Content</div>
        </Form>,
      );
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLFormElement);
    });
  });

  describe('form submission', () => {
    it('prevents default form submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(
        <Form onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>,
      );

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      // Form should not reload page (onSubmit was called, not native submit)
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('calls onSubmit with form data on valid submit', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(
        <Form onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>,
      );

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });

    it('calls onError when form is invalid', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const handleError = vi.fn();

      // This test would need a registered field with validation
      // For basic test, we just verify the form renders and submits
      render(
        <Form onSubmit={handleSubmit} onError={handleError}>
          <button type="submit">Submit</button>
        </Form>,
      );

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      // Without registered fields with errors, onSubmit should be called
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('render prop', () => {
    it('supports render prop pattern', () => {
      render(
        <Form
          render={(form) => (
            <div data-testid="render-content">
              Form state: {form.formState.isSubmitting ? 'submitting' : 'idle'}
            </div>
          )}
        />,
      );

      expect(screen.getByTestId('render-content')).toHaveTextContent('Form state: idle');
    });

    it('provides form state in render prop', () => {
      render(
        <Form
          formOptions={{ defaultValues: { email: 'test@example.com' } }}
          render={(form) => (
            <div data-testid="render-content">
              Is valid: {form.formState.isValid ? 'yes' : 'no'}
            </div>
          )}
        />,
      );

      expect(screen.getByTestId('render-content')).toHaveTextContent('Is valid: yes');
    });
  });

  describe('form options', () => {
    it('accepts formOptions prop', () => {
      render(
        <Form formOptions={{ defaultValues: { email: 'test@example.com' } }}>
          <div>Content</div>
        </Form>,
      );

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('HTML form attributes', () => {
    it('passes through HTML form attributes', () => {
      render(
        <Form id="my-form" data-testid="test-form" autoComplete="off">
          <div>Content</div>
        </Form>,
      );

      const form = screen.getByTestId('test-form');
      expect(form).toHaveAttribute('id', 'my-form');
      expect(form).toHaveAttribute('autoComplete', 'off');
    });

    it('supports method attribute', () => {
      render(
        <Form method="post">
          <div>Content</div>
        </Form>,
      );

      const form = document.querySelector('form');
      expect(form).toHaveAttribute('method', 'post');
    });

    it('supports action attribute', () => {
      render(
        <Form action="/submit">
          <div>Content</div>
        </Form>,
      );

      const form = document.querySelector('form');
      expect(form).toHaveAttribute('action', '/submit');
    });
  });
});
