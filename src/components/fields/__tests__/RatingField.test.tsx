/**
 * Tests for RatingField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

describe('RatingField', () => {
  const renderRatingField = (fieldConfig: Partial<FieldConfig> = {}, defaultValue = 0) => {
    const fields: FieldConfig[] = [
      {
        key: 'rating',
        label: 'Rating',
        type: FieldType.RATING,
        ...fieldConfig,
      },
    ];

    return render(
      <DynamicForm
        schema={z.object({ rating: z.number() })}
        fields={fields}
        defaultValues={{ rating: defaultValue }}
        onSubmit={vi.fn()}
      />,
    );
  };

  it('renders 5 stars by default', () => {
    renderRatingField();
    const slider = screen.getByRole('slider');
    const stars = within(slider).getAllByRole('button', { hidden: true });
    expect(stars).toHaveLength(5);
  });

  it('renders custom number of stars via maxRating', () => {
    renderRatingField({ maxRating: 10 });
    const slider = screen.getByRole('slider');
    const stars = within(slider).getAllByRole('button', { hidden: true });
    expect(stars).toHaveLength(10);
  });

  it('displays current rating', () => {
    renderRatingField({}, 3);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('/ 5')).toBeInTheDocument();
  });

  it('shows "No rating" when value is 0', () => {
    renderRatingField({}, 0);
    expect(screen.getByText('No rating')).toBeInTheDocument();
  });

  it('sets rating on star click', async () => {
    const user = userEvent.setup();
    renderRatingField();

    const slider = screen.getByRole('slider');
    const stars = within(slider).getAllByRole('button', { hidden: true });
    await user.click(stars[3]); // Click 4th star

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('clears rating when clicking current rating', async () => {
    const user = userEvent.setup();
    renderRatingField({}, 3);

    const slider = screen.getByRole('slider');
    const stars = within(slider).getAllByRole('button', { hidden: true });
    await user.click(stars[2]); // Click 3rd star again

    expect(screen.getByText('No rating')).toBeInTheDocument();
  });

  it('supports keyboard navigation with arrow keys', async () => {
    const user = userEvent.setup();
    renderRatingField({}, 2);

    const container = screen.getByRole('slider');
    await user.click(container);
    await user.keyboard('{ArrowRight}');

    expect(screen.getByText('3')).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('supports Home and End keys', async () => {
    const user = userEvent.setup();
    renderRatingField({}, 3);

    const container = screen.getByRole('slider');
    await user.click(container);
    await user.keyboard('{End}');

    expect(screen.getByText('5')).toBeInTheDocument();

    await user.keyboard('{Home}');
    expect(screen.getByText('No rating')).toBeInTheDocument();
  });

  it('supports half-star ratings when allowHalf is true', async () => {
    const user = userEvent.setup();
    renderRatingField({ allowHalf: true }, 2.5);

    expect(screen.getByText('2.5')).toBeInTheDocument();

    const container = screen.getByRole('slider');
    await user.click(container);
    await user.keyboard('{ArrowRight}');

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('uses 0.5 step when allowHalf is true', async () => {
    const user = userEvent.setup();
    renderRatingField({ allowHalf: true }, 2);

    const container = screen.getByRole('slider');
    await user.click(container);
    await user.keyboard('{ArrowRight}');

    expect(screen.getByText('2.5')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    renderRatingField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('disables interaction when disabled', () => {
    renderRatingField({ disabled: true });
    const slider = screen.getByRole('slider');
    const stars = within(slider).getAllByRole('button', { hidden: true });
    expect(stars.length).toBe(5);
    stars.forEach((star) => {
      expect(star).toBeDisabled();
    });
  });

  it('has proper aria attributes', () => {
    renderRatingField({ maxRating: 5 }, 3);
    const slider = screen.getByRole('slider');

    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '5');
    expect(slider).toHaveAttribute('aria-valuenow', '3');
    expect(slider).toHaveAttribute('aria-valuetext', '3 out of 5 stars');
  });
});
