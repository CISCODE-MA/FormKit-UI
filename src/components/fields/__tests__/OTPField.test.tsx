/**
 * Tests for OTPField component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FieldType } from '../../../core/types';
import type { FieldConfig } from '../../../models/FieldConfig';
import DynamicForm from '../../form/DynamicForm';

describe('OTPField', () => {
  const renderOTPField = (fieldConfig: Partial<FieldConfig> = {}, defaultValue = '') => {
    const fields: FieldConfig[] = [
      {
        key: 'code',
        label: 'Verification Code',
        type: FieldType.OTP,
        ...fieldConfig,
      },
    ];

    return render(
      <DynamicForm
        schema={z.object({ code: z.string() })}
        fields={fields}
        defaultValues={{ code: defaultValue }}
        onSubmit={vi.fn()}
      />,
    );
  };

  it('renders 6 input boxes by default', () => {
    renderOTPField();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('renders custom number of inputs via otpLength', () => {
    renderOTPField({ otpLength: 4 });
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
  });

  it('accepts single digit input', async () => {
    const user = userEvent.setup();
    renderOTPField();

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '5');

    expect(inputs[0]).toHaveValue('5');
  });

  it('auto-advances focus to next input', async () => {
    const user = userEvent.setup();
    renderOTPField();

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '1');

    expect(inputs[1]).toHaveFocus();
  });

  it('handles backspace to previous input', async () => {
    const user = userEvent.setup();
    renderOTPField({}, '12');

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[2]);
    await user.keyboard('{Backspace}');

    expect(inputs[1]).toHaveFocus();
  });

  it('handles paste to fill all inputs', async () => {
    renderOTPField();
    const inputs = screen.getAllByRole('textbox');

    // Simulate paste
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '123456' },
    });

    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('4');
    expect(inputs[4]).toHaveValue('5');
    expect(inputs[5]).toHaveValue('6');
  });

  it('filters non-numeric input', async () => {
    const user = userEvent.setup();
    renderOTPField();

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'abc');

    expect(inputs[0]).toHaveValue('');
  });

  it('supports arrow key navigation', async () => {
    const user = userEvent.setup();
    renderOTPField({}, '123456');

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[2]);
    await user.keyboard('{ArrowLeft}');

    expect(inputs[1]).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(inputs[2]).toHaveFocus();
  });

  it('shows required indicator', () => {
    renderOTPField({ required: true });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('disables all inputs when disabled', () => {
    renderOTPField({ disabled: true });
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('has proper aria-label for each input', () => {
    renderOTPField({ otpLength: 4 });
    expect(screen.getByLabelText('Digit 1 of 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 4 of 4')).toBeInTheDocument();
  });

  it('displays pre-filled value', () => {
    renderOTPField({}, '1234');
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('4');
  });
});
