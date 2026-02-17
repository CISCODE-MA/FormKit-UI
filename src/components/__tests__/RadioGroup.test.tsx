/**
 * Tests for RadioGroup component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from '../RadioGroup';
import { required } from '../../validation/validators';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('RadioGroup', () => {
  describe('basic rendering', () => {
    it('renders with minimal props', () => {
      render(<RadioGroup name="choice" options={mockOptions} />);
      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();
    });

    it('renders all radio options', () => {
      render(<RadioGroup name="choice" options={mockOptions} />);
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);
    });

    it('renders with label', () => {
      render(<RadioGroup name="choice" options={mockOptions} label="Choose an option" />);
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('shows required indicator when required', () => {
      render(<RadioGroup name="choice" options={mockOptions} label="Required" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with hint text', () => {
      render(<RadioGroup name="choice" options={mockOptions} hint="Select one option" />);
      expect(screen.getByText('Select one option')).toBeInTheDocument();
    });

    it('renders with default value selected', () => {
      render(<RadioGroup name="choice" options={mockOptions} defaultValue="option2" />);
      const radio = screen.getByLabelText('Option 2') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });
  });

  describe('layout and accessibility', () => {
    it('applies vertical layout by default', () => {
      render(<RadioGroup name="choice" options={mockOptions} />);
      const container = screen.getByRole('radiogroup').parentElement;
      expect(container?.querySelector('.formkit-radiogroup-vertical')).toBeInTheDocument();
    });

    it('applies horizontal layout when specified', () => {
      render(<RadioGroup name="choice" options={mockOptions} direction="horizontal" />);
      const container = screen.getByRole('radiogroup').parentElement;
      expect(container?.querySelector('.formkit-radiogroup-horizontal')).toBeInTheDocument();
    });

    it('sets aria-invalid when has error', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup
          name="choice"
          options={mockOptions}
          validationRules={[{ validator: required() }]}
          validateOn="blur"
        />,
      );

      const firstRadio = screen.getAllByRole('radio')[0];
      firstRadio.focus();
      await user.tab();

      await screen.findByRole('alert');
      const fieldset = screen.getByRole('group');
      expect(fieldset).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for hint', () => {
      render(<RadioGroup name="choice" options={mockOptions} hint="Help text" />);
      const fieldset = screen.getByRole('group');
      const describedBy = fieldset.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(screen.getByText('Help text')).toHaveAttribute('id', describedBy!);
    });
  });

  describe('user interaction', () => {
    it('can select a radio option', async () => {
      const user = userEvent.setup();
      render(<RadioGroup name="choice" options={mockOptions} />);
      const radio = screen.getByLabelText('Option 2');

      await user.click(radio);

      expect(radio).toBeChecked();
    });

    it('calls onChange when selection changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<RadioGroup name="choice" options={mockOptions} onChange={onChange} />);
      const radio = screen.getByLabelText('Option 2');

      await user.click(radio);

      expect(onChange).toHaveBeenCalledWith('option2');
    });

    it('calls onBlur handler', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<RadioGroup name="choice" options={mockOptions} onBlur={onBlur} />);
      const radio = screen.getByLabelText('Option 1');

      radio.focus();
      await user.tab();

      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus handler', async () => {
      const onFocus = vi.fn();
      render(<RadioGroup name="choice" options={mockOptions} onFocus={onFocus} />);
      const radio = screen.getByLabelText('Option 1');

      radio.focus();

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('can be selected by clicking label', async () => {
      const user = userEvent.setup();
      render(<RadioGroup name="choice" options={mockOptions} />);
      const label = screen.getByText('Option 2');
      const radio = screen.getByLabelText('Option 2');

      await user.click(label);

      expect(radio).toBeChecked();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates to next option with ArrowDown in vertical layout', async () => {
      const user = userEvent.setup();
      render(<RadioGroup name="choice" options={mockOptions} direction="vertical" />);
      const firstRadio = screen.getByLabelText('Option 1') as HTMLInputElement;

      firstRadio.focus();
      await user.keyboard('{ArrowDown}');

      const secondRadio = screen.getByLabelText('Option 2') as HTMLInputElement;
      expect(secondRadio).toBeChecked();
      expect(secondRadio).toHaveFocus();
    });

    it('navigates to previous option with ArrowUp in vertical layout', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup
          name="choice"
          options={mockOptions}
          direction="vertical"
          defaultValue="option2"
        />,
      );
      const secondRadio = screen.getByLabelText('Option 2') as HTMLInputElement;

      secondRadio.focus();
      await user.keyboard('{ArrowUp}');

      const firstRadio = screen.getByLabelText('Option 1') as HTMLInputElement;
      expect(firstRadio).toBeChecked();
      expect(firstRadio).toHaveFocus();
    });

    it('navigates to next option with ArrowRight in horizontal layout', async () => {
      const user = userEvent.setup();
      render(<RadioGroup name="choice" options={mockOptions} direction="horizontal" />);
      const firstRadio = screen.getByLabelText('Option 1') as HTMLInputElement;

      firstRadio.focus();
      await user.keyboard('{ArrowRight}');

      const secondRadio = screen.getByLabelText('Option 2') as HTMLInputElement;
      expect(secondRadio).toBeChecked();
      expect(secondRadio).toHaveFocus();
    });

    it('navigates to previous option with ArrowLeft in horizontal layout', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup
          name="choice"
          options={mockOptions}
          direction="horizontal"
          defaultValue="option2"
        />,
      );
      const secondRadio = screen.getByLabelText('Option 2') as HTMLInputElement;

      secondRadio.focus();
      await user.keyboard('{ArrowLeft}');

      const firstRadio = screen.getByLabelText('Option 1') as HTMLInputElement;
      expect(firstRadio).toBeChecked();
      expect(firstRadio).toHaveFocus();
    });

    it('wraps around when navigating past last option', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup
          name="choice"
          options={mockOptions}
          direction="vertical"
          defaultValue="option3"
        />,
      );
      const thirdRadio = screen.getByLabelText('Option 3') as HTMLInputElement;

      thirdRadio.focus();
      await user.keyboard('{ArrowDown}');

      const firstRadio = screen.getByLabelText('Option 1') as HTMLInputElement;
      expect(firstRadio).toBeChecked();
      expect(firstRadio).toHaveFocus();
    });

    it('wraps around when navigating before first option', async () => {
      const user = userEvent.setup();
      render(<RadioGroup name="choice" options={mockOptions} direction="vertical" />);
      const firstRadio = screen.getByLabelText('Option 1') as HTMLInputElement;

      firstRadio.focus();
      await user.keyboard('{ArrowUp}');

      const thirdRadio = screen.getByLabelText('Option 3') as HTMLInputElement;
      expect(thirdRadio).toBeChecked();
      expect(thirdRadio).toHaveFocus();
    });

    it('skips disabled options during keyboard navigation', async () => {
      const user = userEvent.setup();
      const optionsWithDisabled = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
        { value: 'option3', label: 'Option 3' },
      ];
      render(<RadioGroup name="choice" options={optionsWithDisabled} direction="vertical" />);
      const firstRadio = screen.getByLabelText('Option 1') as HTMLInputElement;

      firstRadio.focus();
      await user.keyboard('{ArrowDown}');

      const thirdRadio = screen.getByLabelText('Option 3') as HTMLInputElement;
      expect(thirdRadio).toBeChecked();
      expect(thirdRadio).toHaveFocus();
    });
  });

  describe('validation', () => {
    it('shows error after validation fails', async () => {
      const user = userEvent.setup();
      const validator = vi.fn(() => (value: unknown) => {
        return value ? null : 'Selection required';
      });
      render(
        <RadioGroup
          name="choice"
          options={mockOptions}
          validationRules={[{ validator: validator() }]}
          validateOn="blur"
        />,
      );
      const firstRadio = screen.getAllByRole('radio')[0];

      firstRadio.focus();
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('Selection required');
    });

    it('shows required error', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup
          name="choice"
          options={mockOptions}
          required
          validationRules={[{ validator: required() }]}
          validateOn="blur"
        />,
      );
      const firstRadio = screen.getAllByRole('radio')[0];

      firstRadio.focus();
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('This field is required');
    });

    it('validates on change when configured', async () => {
      const user = userEvent.setup();
      const validator = vi.fn(() => (value: unknown) => {
        return value === 'option1' ? null : 'Must select option 1';
      });
      render(
        <RadioGroup
          name="choice"
          options={mockOptions}
          validationRules={[{ validator: validator() }]}
          validateOn="change"
        />,
      );
      const secondRadio = screen.getByLabelText('Option 2');

      await user.click(secondRadio);
      await user.tab();

      const error = await screen.findByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('does not show error when showError is false', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup
          name="choice"
          options={mockOptions}
          validationRules={[{ validator: required() }]}
          validateOn="blur"
          showError={false}
        />,
      );
      const firstRadio = screen.getAllByRole('radio')[0];

      firstRadio.focus();
      await user.tab();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('calls onValidationChange', async () => {
      const user = userEvent.setup();
      const onValidationChange = vi.fn();
      render(
        <RadioGroup
          name="choice"
          options={mockOptions}
          validationRules={[{ validator: required() }]}
          onValidationChange={onValidationChange}
        />,
      );
      const firstRadio = screen.getByLabelText('Option 1');

      await user.click(firstRadio);

      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe('states', () => {
    it('renders as disabled', () => {
      render(<RadioGroup name="choice" options={mockOptions} disabled />);
      const fieldset = screen.getByRole('group');
      expect(fieldset).toBeDisabled();
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('cannot be selected when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<RadioGroup name="choice" options={mockOptions} disabled onChange={onChange} />);
      const radio = screen.getByLabelText('Option 1');

      await user.click(radio);

      expect(onChange).not.toHaveBeenCalled();
      expect(radio).not.toBeChecked();
    });

    it('renders as readOnly', () => {
      render(<RadioGroup name="choice" options={mockOptions} readOnly />);
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);
    });

    it('cannot be selected when readOnly', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<RadioGroup name="choice" options={mockOptions} readOnly onChange={onChange} />);
      const radio = screen.getByLabelText('Option 1');

      await user.click(radio);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('marks as required', () => {
      render(<RadioGroup name="choice" options={mockOptions} required />);
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeRequired();
      });
    });

    it('disables individual options', () => {
      const optionsWithDisabled = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2', disabled: true },
        { value: 'option3', label: 'Option 3' },
      ];
      render(<RadioGroup name="choice" options={optionsWithDisabled} />);
      const option2 = screen.getByLabelText('Option 2');
      expect(option2).toBeDisabled();
    });

    it('adds error class when has error', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup
          name="choice"
          options={mockOptions}
          validationRules={[{ validator: required() }]}
          validateOn="blur"
        />,
      );
      const firstRadio = screen.getAllByRole('radio')[0];

      firstRadio.focus();
      await user.tab();

      await screen.findByRole('alert');
      expect(firstRadio).toHaveClass('formkit-radio-error');
    });

    it('adds checked class to wrapper', async () => {
      const user = userEvent.setup();
      render(<RadioGroup name="choice" options={mockOptions} />);
      const radio = screen.getByLabelText('Option 2');

      await user.click(radio);

      const wrapper = radio.closest('.formkit-radio-wrapper');
      expect(wrapper).toHaveClass('formkit-radio-checked');
    });
  });

  describe('styling', () => {
    it('applies custom className to container', () => {
      render(<RadioGroup name="choice" options={mockOptions} className="custom-class" />);
      const fieldset = screen.getByRole('group');
      expect(fieldset).toHaveClass('custom-class');
    });

    it('applies custom radioClassName to radio wrappers', () => {
      render(<RadioGroup name="choice" options={mockOptions} radioClassName="custom-radio" />);
      const wrapper = screen.getAllByRole('radio')[0].closest('.formkit-radio-wrapper');
      expect(wrapper).toHaveClass('custom-radio');
    });
  });
});
