/**
 * Tests for Textarea component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../Textarea';
import { required, minLength } from '../../validation/validators';

describe('Textarea', () => {
  describe('basic rendering', () => {
    it('renders textarea with name', () => {
      render(<Textarea name="description" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('name', 'description');
    });

    it('renders with placeholder', () => {
      render(<Textarea name="field" placeholder="Enter description" />);
      const textarea = screen.getByPlaceholderText('Enter description');
      expect(textarea).toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<Textarea name="field" defaultValue="test content" />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('test content');
    });

    it('renders with default 3 rows', () => {
      render(<Textarea name="field" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '3');
    });

    it('renders with custom rows', () => {
      render(<Textarea name="field" rows={5} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('renders with cols attribute', () => {
      render(<Textarea name="field" cols={50} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('cols', '50');
    });
  });

  describe('label and accessibility', () => {
    it('renders with label', () => {
      render(<Textarea name="description" label="Description" />);
      const label = screen.getByText('Description');
      expect(label).toBeInTheDocument();
    });

    it('associates label with textarea', () => {
      render(<Textarea name="description" label="Description" />);
      const textarea = screen.getByLabelText('Description');
      expect(textarea).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<Textarea name="field" label="Required Field" required />);
      const required = screen.getByText('*');
      expect(required).toBeInTheDocument();
    });

    it('renders with hint text', () => {
      render(<Textarea name="field" hint="Enter at least 10 characters" />);
      const hint = screen.getByText('Enter at least 10 characters');
      expect(hint).toBeInTheDocument();
    });

    it('sets aria-describedby for hint', () => {
      render(<Textarea name="field" hint="Helper text" />);
      const textarea = screen.getByRole('textbox');
      const describedBy = textarea.getAttribute('aria-describedby');
      expect(describedBy).toContain('hint');
    });
  });

  describe('user interaction', () => {
    it('handles user input', async () => {
      const user = userEvent.setup();
      render(<Textarea name="field" />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'hello world');
      expect(textarea).toHaveValue('hello world');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Textarea name="field" onChange={onChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'test');
      expect(onChange).toHaveBeenCalled();
    });

    it('calls onBlur handler', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<Textarea name="field" onBlur={onBlur} />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.tab();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus handler', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      render(<Textarea name="field" onFocus={onFocus} />);
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      expect(onFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation', () => {
    it('shows error after validation fails', async () => {
      const user = userEvent.setup();
      render(
        <Textarea
          name="description"
          label="Description"
          validationRules={[{ validator: minLength(5) }]}
          validateOn="blur"
        />,
      );
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'abc');
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('shows required error', async () => {
      const user = userEvent.setup();
      render(
        <Textarea
          name="field"
          label="Required"
          required
          validationRules={[{ validator: required() }]}
          validateOn="blur"
        />,
      );
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('This field is required');
    });

    it('validates on change when configured', async () => {
      const user = userEvent.setup();
      render(
        <Textarea
          name="content"
          validationRules={[{ validator: minLength(10) }]}
          validateOn="change"
        />,
      );
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'short');
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('does not show error when showError is false', async () => {
      const user = userEvent.setup();
      render(
        <Textarea
          name="field"
          validationRules={[{ validator: required() }]}
          validateOn="blur"
          showError={false}
        />,
      );
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.tab();

      const error = screen.queryByRole('alert');
      expect(error).not.toBeInTheDocument();
    });

    it('calls onValidationChange', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      render(
        <Textarea
          name="content"
          validationRules={[{ validator: minLength(5) }]}
          validateOn="blur"
          onValidationChange={onValidationChange}
        />,
      );
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'hello world');
      await user.tab();

      expect(onValidationChange).toHaveBeenCalled();
    });
  });

  describe('character count', () => {
    it('shows character count when showCount is true', async () => {
      const user = userEvent.setup();
      render(<Textarea name="field" showCount />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'hello');

      const count = screen.getByText(/5/);
      expect(count).toBeInTheDocument();
    });

    it('shows character count with maxLength', async () => {
      const user = userEvent.setup();
      render(<Textarea name="field" showCount maxLength={100} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'test');

      const count = screen.getByText('4 / 100');
      expect(count).toBeInTheDocument();
    });

    it('updates count as user types', async () => {
      const user = userEvent.setup();
      render(<Textarea name="field" showCount maxLength={50} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'hello');
      expect(screen.getByText('5 / 50')).toBeInTheDocument();

      await user.type(textarea, ' world');
      expect(screen.getByText('11 / 50')).toBeInTheDocument();
    });

    it('does not show count when showCount is false', () => {
      render(<Textarea name="field" showCount={false} maxLength={100} />);
      const count = screen.queryByText(/100/);
      expect(count).not.toBeInTheDocument();
    });

    it('marks count as over limit', () => {
      const { container } = render(
        <Textarea name="field" showCount maxLength={5} defaultValue="hello world" />,
      );

      const countElement = container.querySelector('.formkit-textarea-count-over');
      expect(countElement).toBeInTheDocument();
    });
  });

  describe('textarea attributes', () => {
    it('sets maxLength attribute', () => {
      render(<Textarea name="field" maxLength={200} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '200');
    });
  });

  describe('states', () => {
    it('renders as disabled', () => {
      render(<Textarea name="field" disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('renders as readOnly', () => {
      render(<Textarea name="field" readOnly />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readOnly');
    });

    it('marks as required', () => {
      render(<Textarea name="field" required />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
    });

    it('adds error class when has error', async () => {
      const user = userEvent.setup();
      render(
        <Textarea name="field" validationRules={[{ validator: required() }]} validateOn="blur" />,
      );
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.tab();

      await screen.findByRole('alert');
      expect(textarea).toHaveClass('formkit-textarea-error');
    });

    it('sets aria-invalid when has error', async () => {
      const user = userEvent.setup();
      render(
        <Textarea name="field" validationRules={[{ validator: required() }]} validateOn="blur" />,
      );
      const textarea = screen.getByRole('textbox');

      await user.click(textarea);
      await user.tab();

      await screen.findByRole('alert');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('adds auto-resize class when autoResize is true', () => {
      render(<Textarea name="field" autoResize />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('formkit-textarea-auto-resize');
    });
  });

  describe('styling', () => {
    it('applies custom className to container', () => {
      const { container } = render(<Textarea name="field" className="custom-class" />);
      const textareaContainer = container.querySelector('.formkit-textarea-container');
      expect(textareaContainer).toHaveClass('custom-class');
    });

    it('applies custom textareaClassName to textarea', () => {
      render(<Textarea name="field" textareaClassName="custom-textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-textarea');
    });
  });

  describe('auto-resize', () => {
    it('does not add auto-resize class by default', () => {
      render(<Textarea name="field" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).not.toHaveClass('formkit-textarea-auto-resize');
    });

    it('adds auto-resize class when enabled', () => {
      render(<Textarea name="field" autoResize />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('formkit-textarea-auto-resize');
    });
  });
});
