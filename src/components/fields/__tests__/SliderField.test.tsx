/**
 * Tests for SliderField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

describe('SliderField', () => {
  const renderSliderField = (fieldConfig: Partial<FieldConfig> = {}, defaultValue = 50) => {
    const fields: FieldConfig[] = [
      {
        key: 'volume',
        label: 'Volume',
        type: FieldType.SLIDER,
        ...fieldConfig,
      },
    ];

    return render(
      <DynamicForm
        schema={z.object({ volume: z.number() })}
        fields={fields}
        defaultValues={{ volume: defaultValue }}
        onSubmit={vi.fn()}
      />,
    );
  };

  it('renders slider with default value', () => {
    renderSliderField({}, 75);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('75');
  });

  it('uses custom min/max values', () => {
    renderSliderField({ min: 10, max: 200 });
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '200');
  });

  it('uses custom step value', () => {
    renderSliderField({ step: 5 });
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('step', '5');
  });

  it('shows current value when showValue is true', () => {
    renderSliderField({ showValue: true }, 42);
    // Use spinbutton role as it renders a number input
    expect(screen.getByRole('spinbutton')).toHaveValue(42);
  });

  it('updates value via slider change', () => {
    renderSliderField({}, 50);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, { target: { value: '80' } });
    expect(slider).toHaveValue('80');
  });

  it('syncs editable input with slider', async () => {
    const user = userEvent.setup();
    renderSliderField({ showValue: true }, 50);

    // Use spinbutton role for the editable number input
    const numberInput = screen.getByRole('spinbutton');
    await user.clear(numberInput);
    await user.type(numberInput, '75');
    await user.tab();

    expect(screen.getByRole('slider')).toHaveValue('75');
  });

  it('clamps value to min/max when editing', async () => {
    const user = userEvent.setup();
    renderSliderField({ min: 0, max: 100, showValue: true }, 50);

    // Use spinbutton role for the editable number input
    const numberInput = screen.getByRole('spinbutton');
    await user.clear(numberInput);
    await user.type(numberInput, '150');
    await user.tab();

    expect(screen.getByRole('slider')).toHaveValue('100');
  });

  it('shows required indicator', () => {
    renderSliderField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('disables slider when disabled is true', () => {
    renderSliderField({ disabled: true });
    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('has proper aria attributes', () => {
    renderSliderField({ min: 0, max: 100 }, 50);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });
});
