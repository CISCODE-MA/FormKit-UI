/**
 * Tests for Select component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, type SelectOption } from '../Select';
import { required } from '../../validation/validators';

const mockOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

const mockOptionsWithDisabled: SelectOption[] = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green', disabled: true },
  { value: 'blue', label: 'Blue' },
];

describe('Select', () => {
  describe('basic rendering', () => {
    it('renders select with name', () => {
      render(<Select name="fruit" options={mockOptions} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute('name', 'fruit');
    });

    it('renders with options', () => {
      render(<Select name="fruit" options={mockOptions} />);
      const apple = screen.getByRole('option', { name: 'Apple' });
      const banana = screen.getByRole('option', { name: 'Banana' });
      expect(apple).toBeInTheDocument();
      expect(banana).toBeInTheDocument();
    });

    it('renders with placeholder option', () => {
      render(<Select name="fruit" options={mockOptions} placeholder="Choose a fruit" />);
      const placeholder = screen.getByRole('option', { name: 'Choose a fruit' });
      expect(placeholder).toBeInTheDocument();
    });

    it('renders with emptyLabel', () => {
      render(<Select name="fruit" options={mockOptions} emptyLabel="-- Select --" />);
      const emptyOption = screen.getByRole('option', { name: '-- Select --' });
      expect(emptyOption).toBeInTheDocument();
    });

    it('emptyLabel takes precedence over placeholder', () => {
      render(
        <Select
          name="fruit"
          options={mockOptions}
          placeholder="placeholder"
          emptyLabel="empty label"
        />,
      );
      const emptyOption = screen.getByRole('option', { name: 'empty label' });
      expect(emptyOption).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'placeholder' })).not.toBeInTheDocument();
    });

    it('renders with default value', () => {
      render(<Select name="fruit" options={mockOptions} defaultValue="banana" />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('banana');
    });

    it('does not render empty option for multiple select', () => {
      render(<Select name="fruit" options={mockOptions} multiple placeholder="Choose fruits" />);
      const placeholder = screen.queryByRole('option', { name: 'Choose fruits' });
      expect(placeholder).not.toBeInTheDocument();
    });
  });

  describe('label and accessibility', () => {
    it('renders with label', () => {
      render(<Select name="fruit" options={mockOptions} label="Favorite Fruit" />);
      const label = screen.getByText('Favorite Fruit');
      expect(label).toBeInTheDocument();
    });

    it('associates label with select', () => {
      render(<Select name="fruit" options={mockOptions} label="Favorite Fruit" />);
      const select = screen.getByLabelText('Favorite Fruit');
      expect(select).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<Select name="fruit" options={mockOptions} label="Required Field" required />);
      const required = screen.getByText('*');
      expect(required).toBeInTheDocument();
    });

    it('renders with hint text', () => {
      render(<Select name="fruit" options={mockOptions} hint="Choose your favorite" />);
      const hint = screen.getByText('Choose your favorite');
      expect(hint).toBeInTheDocument();
    });

    it('sets aria-describedby for hint', () => {
      render(<Select name="fruit" options={mockOptions} hint="Helper text" />);
      const select = screen.getByRole('combobox');
      const describedBy = select.getAttribute('aria-describedby');
      expect(describedBy).toContain('hint');
    });
  });

  describe('user interaction', () => {
    it('handles user selection', async () => {
      const user = userEvent.setup();
      render(<Select name="fruit" options={mockOptions} />);
      const select = screen.getByRole('combobox');

      await user.selectOptions(select, 'cherry');
      expect(select).toHaveValue('cherry');
    });

    it('calls onChange handler', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Select name="fruit" options={mockOptions} onChange={onChange} />);
      const select = screen.getByRole('combobox');

      await user.selectOptions(select, 'banana');
      expect(onChange).toHaveBeenCalled();
    });

    it('calls onBlur handler', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<Select name="fruit" options={mockOptions} onBlur={onBlur} />);
      const select = screen.getByRole('combobox');

      await user.click(select);
      await user.tab();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus handler', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      render(<Select name="fruit" options={mockOptions} onFocus={onFocus} />);
      const select = screen.getByRole('combobox');

      await user.click(select);
      expect(onFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation', () => {
    it('shows error after validation fails', async () => {
      const user = userEvent.setup();
      render(
        <Select
          name="fruit"
          options={mockOptions}
          label="Fruit"
          validationRules={[{ validator: required() }]}
          validateOn="blur"
          defaultValue=""
        />,
      );
      const select = screen.getByRole('combobox');

      await user.click(select);
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('shows required error', async () => {
      const user = userEvent.setup();
      render(
        <Select
          name="fruit"
          options={mockOptions}
          label="Required"
          required
          validationRules={[{ validator: required() }]}
          validateOn="blur"
          placeholder="Select one"
        />,
      );
      const select = screen.getByRole('combobox');

      await user.click(select);
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('This field is required');
    });

    it('validates on change when configured', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      render(
        <Select
          name="fruit"
          options={mockOptions}
          validationRules={[{ validator: required() }]}
          validateOn="change"
          onValidationChange={onValidationChange}
          placeholder="Select one"
        />,
      );
      const select = screen.getByRole('combobox');

      // Select a valid option
      await user.selectOptions(select, 'apple');

      // Validation should run and pass
      expect(onValidationChange).toHaveBeenCalled();
    });

    it('does not show error when showError is false', async () => {
      const user = userEvent.setup();
      render(
        <Select
          name="fruit"
          options={mockOptions}
          validationRules={[{ validator: required() }]}
          validateOn="blur"
          showError={false}
          defaultValue=""
        />,
      );
      const select = screen.getByRole('combobox');

      await user.click(select);
      await user.tab();

      const error = screen.queryByRole('alert');
      expect(error).not.toBeInTheDocument();
    });

    it('calls onValidationChange', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      render(
        <Select
          name="fruit"
          options={mockOptions}
          validationRules={[{ validator: required() }]}
          validateOn="blur"
          onValidationChange={onValidationChange}
          defaultValue="apple"
        />,
      );
      const select = screen.getByRole('combobox');

      await user.selectOptions(select, 'banana');
      await user.tab();

      expect(onValidationChange).toHaveBeenCalled();
    });
  });

  describe('disabled options', () => {
    it('renders disabled options', () => {
      render(<Select name="color" options={mockOptionsWithDisabled} />);
      const greenOption = screen.getByRole('option', { name: 'Green' }) as HTMLOptionElement;
      expect(greenOption.disabled).toBe(true);
    });

    it('does not allow selecting disabled option', () => {
      render(<Select name="color" options={mockOptionsWithDisabled} defaultValue="red" />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const greenOption = screen.getByRole('option', { name: 'Green' }) as HTMLOptionElement;

      expect(greenOption.disabled).toBe(true);
      expect(select.value).toBe('red');
    });
  });

  describe('multiple selection', () => {
    it('renders as multiple select', () => {
      render(<Select name="fruits" options={mockOptions} multiple />);
      const select = screen.getByRole('listbox');
      expect(select).toHaveAttribute('multiple');
    });

    it('allows multiple selections', async () => {
      const user = userEvent.setup();
      render(<Select name="fruits" options={mockOptions} multiple defaultValue={[]} />);
      const select = screen.getByRole('listbox') as HTMLSelectElement;

      await user.selectOptions(select, ['apple', 'cherry']);

      const selectedOptions = Array.from(select.selectedOptions).map((opt) => opt.value);
      expect(selectedOptions).toContain('apple');
      expect(selectedOptions).toContain('cherry');
    });
  });

  describe('states', () => {
    it('renders as disabled', () => {
      render(<Select name="fruit" options={mockOptions} disabled />);
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('marks as required', () => {
      render(<Select name="fruit" options={mockOptions} required />);
      const select = screen.getByRole('combobox');
      expect(select).toBeRequired();
    });

    it('disables empty option when required', () => {
      render(<Select name="fruit" options={mockOptions} required placeholder="Select" />);
      const emptyOption = screen.getByRole('option', { name: 'Select' }) as HTMLOptionElement;
      expect(emptyOption.disabled).toBe(true);
    });

    it('adds error class when has error', async () => {
      const user = userEvent.setup();
      render(
        <Select
          name="fruit"
          options={mockOptions}
          validationRules={[{ validator: required() }]}
          validateOn="blur"
          defaultValue=""
        />,
      );
      const select = screen.getByRole('combobox');

      await user.click(select);
      await user.tab();

      await screen.findByRole('alert');
      expect(select).toHaveClass('formkit-select-error');
    });

    it('sets aria-invalid when has error', async () => {
      const user = userEvent.setup();
      render(
        <Select
          name="fruit"
          options={mockOptions}
          validationRules={[{ validator: required() }]}
          validateOn="blur"
          defaultValue=""
        />,
      );
      const select = screen.getByRole('combobox');

      await user.click(select);
      await user.tab();

      await screen.findByRole('alert');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('styling', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <Select name="fruit" options={mockOptions} className="custom-class" />,
      );
      const selectContainer = container.querySelector('.formkit-select-container');
      expect(selectContainer).toHaveClass('custom-class');
    });

    it('applies custom selectClassName to select', () => {
      render(<Select name="fruit" options={mockOptions} selectClassName="custom-select" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('custom-select');
    });
  });
});
