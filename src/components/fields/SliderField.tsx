/**
 * SliderField - Range slider input
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for SliderField
 */
type Props = {
  config: FieldConfig;
};

/**
 * SliderField component for numeric range input
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function SliderField({ config }: Readonly<Props>): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;
  const valueId = `${fieldId}-value`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;

  // Slider config with defaults
  const min = config.min ?? 0;
  const max = config.max ?? 100;
  const step = config.step ?? 1;
  const showValue = config.showValue !== false; // Default true

  // Current numeric value
  const numericValue = typeof value === 'number' ? value : min;

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  // Calculate percentage for styling the track fill
  const percentage = ((numericValue - min) / (max - min)) * 100;

  // Handle number input change with clamping
  const handleInputChange = (inputValue: string) => {
    const parsed = Number(inputValue);
    if (Number.isNaN(parsed)) return;
    // Clamp value to min/max range
    const clamped = Math.min(Math.max(parsed, min), max);
    setValue(config.key, clamped);
  };

  return (
    <div className="formkit-slider-field flex flex-col gap-2 mb-4">
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />
        {showValue && (
          <input
            id={valueId}
            type="number"
            min={min}
            max={max}
            step={step}
            value={numericValue}
            disabled={isDisabled}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={() => setTouched(config.key, true)}
            className={`
              formkit-slider-value
              w-16 text-center text-sm font-medium
              text-blue-600 bg-blue-50
              px-2 py-0.5 rounded
              border border-blue-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              [appearance:textfield]
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
        )}
      </div>

      <div className="relative">
        <input
          id={fieldId}
          name={config.key}
          type="range"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          disabled={isDisabled}
          aria-invalid={showError}
          aria-required={config.required}
          aria-describedby={describedBy}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={numericValue}
          onChange={(e) => setValue(config.key, Number(e.target.value))}
          onBlur={() => setTouched(config.key, true)}
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          }}
          className={`
            formkit-slider
            w-full h-3 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-blue-600
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-blue-600
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer
            ${showError ? '[&::-webkit-slider-thumb]:border-red-500 [&::-moz-range-thumb]:border-red-500' : ''}
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
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

export type { Props as SliderFieldProps };
