/**
 * OTPField - One-Time Password / Verification code input
 */

import { useRef, useState, type JSX, type KeyboardEvent, type ClipboardEvent } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for OTPField
 */
type Props = {
  config: FieldConfig;
};

/**
 * OTPField component for verification code input
 * Supports 4-6 digit codes with auto-advance and paste support
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function OTPField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;

  // OTP config with defaults
  const length = config.otpLength ?? 6;

  // Parse current value into array of digits
  const currentValue = typeof value === 'string' ? value : '';
  const digits = currentValue.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  // Track focused index for styling
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Refs for each input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  // Update the full OTP value
  const updateValue = (newDigits: string[]) => {
    const newValue = newDigits.join('');
    setValue(config.key, newValue);
  };

  // Handle single digit input
  const handleInput = (index: number, inputValue: string) => {
    // Only allow single digit
    const digit = inputValue.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    updateValue(newDigits);

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Backspace':
        if (!digits[index] && index > 0) {
          // Move to previous input on backspace when current is empty
          inputRefs.current[index - 1]?.focus();
          const newDigits = [...digits];
          newDigits[index - 1] = '';
          updateValue(newDigits);
          e.preventDefault();
        } else {
          // Clear current
          const newDigits = [...digits];
          newDigits[index] = '';
          updateValue(newDigits);
        }
        break;

      case 'ArrowLeft':
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
          e.preventDefault();
        }
        break;

      case 'ArrowRight':
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus();
          e.preventDefault();
        }
        break;

      case 'Delete': {
        const newDigits = [...digits];
        newDigits[index] = '';
        updateValue(newDigits);
        break;
      }
    }
  };

  // Handle paste - fill all inputs from clipboard
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    if (pastedData) {
      const newDigits = pastedData.split('');
      while (newDigits.length < length) {
        newDigits.push('');
      }
      updateValue(newDigits);

      // Focus last filled input or last input
      const lastFilledIndex = Math.min(pastedData.length, length) - 1;
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  // Check if OTP is complete
  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="formkit-otp-field flex flex-col gap-2 mb-4">
      <FieldLabel htmlFor={`${fieldId}-0`} label={config.label} required={config.required} />

      <div
        className="flex gap-2 sm:gap-3"
        role="group"
        aria-label={`${config.label} - ${length} digit code`}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            id={`${fieldId}-${index}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            disabled={isDisabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={showError}
            aria-describedby={index === 0 ? describedBy : undefined}
            onChange={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => {
              setFocusedIndex(index);
              // Select content on focus
              inputRefs.current[index]?.select();
            }}
            onBlur={() => {
              setFocusedIndex(null);
              setTouched(config.key, true);
            }}
            className={`
              formkit-otp-input
              w-10 h-12 sm:w-12 sm:h-14
              text-center text-xl sm:text-2xl font-semibold
              border-2 rounded-lg
              transition-all duration-150
              focus:outline-none
              ${
                showError
                  ? 'border-red-500'
                  : digit
                    ? 'border-blue-500'
                    : focusedIndex === index
                      ? 'border-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
              }
              ${isComplete && !showError ? 'border-green-500 bg-green-50' : 'bg-white'}
              ${isDisabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}
            `}
          />
        ))}
      </div>

      {config.description && !showError && (
        <p id={descId} className="text-xs text-gray-500">
          {config.description}
        </p>
      )}

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as OTPFieldProps };
