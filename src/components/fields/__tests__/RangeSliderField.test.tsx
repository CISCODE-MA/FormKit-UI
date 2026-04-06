/**
 * Tests for RangeSliderField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

describe('RangeSliderField', () => {
  const renderRangeSliderField = (
    fieldConfig: Partial<FieldConfig> = {},
    defaultValue = { from: 20, to: 80 },
  ) => {
    const fields: FieldConfig[] = [
      {
        key: 'priceRange',
        label: 'Price Range',
        type: FieldType.RANGE_SLIDER,
        ...fieldConfig,
      },
    ];

    return render(
      <DynamicForm
        schema={z.object({
          priceRange: z.object({ from: z.number(), to: z.number() }),
        })}
        fields={fields}
        defaultValues={{ priceRange: defaultValue }}
        onSubmit={vi.fn()}
      />,
    );
  };

  it('renders two sliders for from and to values', () => {
    renderRangeSliderField();
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
  });

  it('displays from and to input values', () => {
    renderRangeSliderField({ showValue: true }, { from: 25, to: 75 });
    // Use spinbutton role with specific aria-labels for the number inputs
    expect(screen.getByRole('spinbutton', { name: /minimum/i })).toHaveValue(25);
    expect(screen.getByRole('spinbutton', { name: /maximum/i })).toHaveValue(75);
  });

  it('uses custom min/max values', () => {
    renderRangeSliderField({ min: 100, max: 500 });
    const sliders = screen.getAllByRole('slider');
    sliders.forEach((slider) => {
      expect(slider).toHaveAttribute('min', '100');
      expect(slider).toHaveAttribute('max', '500');
    });
  });

  it('updates from value via slider', () => {
    renderRangeSliderField({ showValue: true }, { from: 20, to: 80 });
    const sliders = screen.getAllByRole('slider');

    fireEvent.change(sliders[0], { target: { value: '30' } });
    expect(screen.getByRole('spinbutton', { name: /minimum/i })).toHaveValue(30);
  });

  it('updates to value via slider', () => {
    renderRangeSliderField({ showValue: true }, { from: 20, to: 80 });
    const sliders = screen.getAllByRole('slider');

    fireEvent.change(sliders[1], { target: { value: '90' } });
    expect(screen.getByRole('spinbutton', { name: /maximum/i })).toHaveValue(90);
  });

  it('prevents from exceeding to value', () => {
    renderRangeSliderField({ showValue: true }, { from: 20, to: 50 });

    const fromInput = screen.getByRole('spinbutton', { name: /minimum/i });
    fireEvent.change(fromInput, { target: { value: '60' } });

    // Should clamp to 'to' value minus step (default step is 1)
    expect(fromInput).toHaveValue(49);
  });

  it('prevents to going below from value', () => {
    renderRangeSliderField({ showValue: true }, { from: 40, to: 80 });

    const toInput = screen.getByRole('spinbutton', { name: /maximum/i });
    fireEvent.change(toInput, { target: { value: '30' } });

    // Should clamp to 'from' value plus step (default step is 1)
    expect(toInput).toHaveValue(41);
  });

  it('shows required indicator', () => {
    renderRangeSliderField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('disables both sliders when disabled', () => {
    renderRangeSliderField({ disabled: true });
    const sliders = screen.getAllByRole('slider');
    sliders.forEach((slider) => {
      expect(slider).toBeDisabled();
    });
  });
});
