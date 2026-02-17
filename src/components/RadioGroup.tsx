/**
 * RadioGroup component with validation and error handling
 */

import { forwardRef, useId, useEffect, useRef } from 'react';
import type { ValidationRule } from '../validation/types';
import type { FieldOption } from '../utils/types';
import { useFormField } from '../hooks/useFormField';
import { useValidation } from '../hooks/useValidation';
import { useFieldError } from '../hooks/useFieldError';

/**
 * Props for RadioGroup component
 */
export interface RadioGroupProps {
  /** Radio group name attribute */
  name: string;
  /** Available radio options */
  options: FieldOption[];
  /** Label text for the group */
  label?: string;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Default selected value */
  defaultValue?: string | number;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Custom CSS class name for the container */
  className?: string;
  /** Custom CSS class name for the radio wrapper */
  radioClassName?: string;
  /** Validation rules */
  validationRules?: ValidationRule[];
  /** When to validate */
  validateOn?: 'change' | 'blur' | 'submit';
  /** Debounce validation (ms) */
  debounce?: number;
  /** Show error message */
  showError?: boolean;
  /** Auto-dismiss errors after delay (ms) */
  autoDismissError?: number;
  /** Hint or help text */
  hint?: string;
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Validation change handler */
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * RadioGroup component with validation and error handling
 */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      name,
      options,
      label,
      direction = 'vertical',
      defaultValue = '',
      required = false,
      disabled = false,
      readOnly = false,
      className = '',
      radioClassName = '',
      validationRules = [],
      validateOn = 'change',
      debounce,
      showError = true,
      autoDismissError,
      hint,
      onChange,
      onBlur,
      onFocus,
      onValidationChange,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = `radio-${name}-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = hint ? `${fieldId}-hint` : undefined;

    const radioRefs = useRef<Map<string | number, HTMLInputElement>>(new Map());

    // Field state management
    const { value, isTouched, setValue, handleBlur, handleFocus } = useFormField({
      initialValue: defaultValue,
      disabled,
      readOnly,
      onBlur: () => {
        onBlur?.();
        if (validateOn === 'blur') {
          validate(value as string | number);
        }
      },
      onFocus,
    });

    // Custom handleChange for radio
    const handleRadioChange = (optionValue: string | number) => {
      if (disabled || readOnly) {
        return;
      }

      setValue(optionValue);
      onChange?.(optionValue);

      if (validateOn === 'change') {
        validate(optionValue);
      }
    };

    // Validation
    const { errors, isValid, validate } = useValidation({
      rules: validationRules,
      debounce,
    });

    // Notify parent of validation changes
    useEffect(() => {
      if (onValidationChange) {
        onValidationChange(isValid);
      }
    }, [isValid, onValidationChange]);

    // Error handling
    const { error, setErrors } = useFieldError({
      fieldName: name,
      autoDismiss: autoDismissError,
    });

    // Sync validation errors to field errors
    useEffect(() => {
      if (errors.length > 0) {
        setErrors(errors);
      } else if (error !== null) {
        setErrors([]);
      }
    }, [errors, error, setErrors]);

    // Handle keyboard navigation for radio groups
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
      if (disabled || readOnly) {
        return;
      }

      const isHorizontal = direction === 'horizontal';
      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

      if (event.key === nextKey || event.key === prevKey) {
        event.preventDefault();

        const enabledOptions = options.filter((opt) => !opt.disabled);
        const currentEnabledIndex = enabledOptions.findIndex(
          (opt) => opt.value === options[currentIndex].value,
        );

        let nextIndex: number;
        if (event.key === nextKey) {
          nextIndex = (currentEnabledIndex + 1) % enabledOptions.length;
        } else {
          nextIndex =
            currentEnabledIndex === 0 ? enabledOptions.length - 1 : currentEnabledIndex - 1;
        }

        const nextOption = enabledOptions[nextIndex];
        const nextInput = radioRefs.current.get(nextOption.value);

        if (nextInput) {
          nextInput.focus();
          handleRadioChange(nextOption.value);
        }
      }
    };

    const hasError = isTouched && error !== null;
    const showHint = hint && !hasError;

    return (
      <fieldset
        ref={ref}
        className={`formkit-radiogroup-container ${className}`}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : showHint ? hintId : undefined}
      >
        {label && (
          <legend className="formkit-radiogroup-label">
            {label}
            {required && <span className="formkit-radiogroup-required"> *</span>}
          </legend>
        )}
        <div
          className={`formkit-radiogroup-options formkit-radiogroup-${direction}`}
          role="radiogroup"
        >
          {options.map((option, index) => {
            const radioId = `${fieldId}-${option.value}`;
            const isChecked = value === option.value;
            const isDisabled = disabled || option.disabled;

            return (
              <div
                key={option.value}
                className={`formkit-radio-wrapper ${radioClassName} ${
                  isChecked ? 'formkit-radio-checked' : ''
                }`}
              >
                <input
                  ref={(el) => {
                    if (el) {
                      radioRefs.current.set(option.value, el);
                    } else {
                      radioRefs.current.delete(option.value);
                    }
                  }}
                  type="radio"
                  id={radioId}
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  onChange={() => handleRadioChange(option.value)}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={isDisabled}
                  required={required}
                  className={`formkit-radio ${hasError ? 'formkit-radio-error' : ''} ${
                    isTouched && isValid ? 'formkit-radio-valid' : ''
                  }`}
                  aria-invalid={hasError}
                />
                <label htmlFor={radioId} className="formkit-radio-label">
                  {option.label}
                </label>
              </div>
            );
          })}
        </div>
        {showHint && (
          <div id={hintId} className="formkit-radiogroup-hint">
            {hint}
          </div>
        )}
        {showError && hasError && (
          <div id={errorId} className="formkit-radiogroup-error-message" role="alert">
            {error}
          </div>
        )}
      </fieldset>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';
