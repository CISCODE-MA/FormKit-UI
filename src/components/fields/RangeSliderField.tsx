/**
 * RangeSliderField - Dual-thumb range slider for selecting a range
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Range value type
 */
export type RangeValue = {
  from: number;
  to: number;
};

/**
 * Props for RangeSliderField
 */
type Props = {
  config: FieldConfig;
};

/**
 * Parse stored value into RangeValue
 */
function parseRangeValue(value: unknown, min: number, max: number): RangeValue {
  if (typeof value === 'object' && value !== null) {
    const v = value as Partial<RangeValue>;
    return {
      from: typeof v.from === 'number' ? v.from : min,
      to: typeof v.to === 'number' ? v.to : max,
    };
  }
  return { from: min, to: max };
}

/**
 * RangeSliderField component for selecting a numeric range
 * Uses two overlapping range inputs for dual-thumb functionality
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function RangeSliderField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();

  const fieldId = `field-${config.key}`;
  const fromId = `${fieldId}-from`;
  const toId = `${fieldId}-to`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const rawValue = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;

  // Slider config with defaults
  const min = config.min ?? 0;
  const max = config.max ?? 100;
  const step = config.step ?? 1;
  const showValue = config.showValue !== false;

  // Current range values
  const rangeValue = parseRangeValue(rawValue, min, max);

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  // Calculate percentages for track fill
  const fromPercent = ((rangeValue.from - min) / (max - min)) * 100;
  const toPercent = ((rangeValue.to - min) / (max - min)) * 100;

  // Handle from slider change
  const handleFromChange = (newFrom: number) => {
    // Don't allow from to exceed to
    const clampedFrom = Math.min(newFrom, rangeValue.to - step);
    setValue(config.key, { from: Math.max(clampedFrom, min), to: rangeValue.to });
  };

  // Handle to slider change
  const handleToChange = (newTo: number) => {
    // Don't allow to to go below from
    const clampedTo = Math.max(newTo, rangeValue.from + step);
    setValue(config.key, { from: rangeValue.from, to: Math.min(clampedTo, max) });
  };

  // Handle number input change with clamping
  const handleFromInputChange = (inputValue: string) => {
    const parsed = Number(inputValue);
    if (isNaN(parsed)) return;
    const clamped = Math.min(Math.max(parsed, min), rangeValue.to - step);
    setValue(config.key, { from: clamped, to: rangeValue.to });
  };

  const handleToInputChange = (inputValue: string) => {
    const parsed = Number(inputValue);
    if (isNaN(parsed)) return;
    const clamped = Math.max(Math.min(parsed, max), rangeValue.from + step);
    setValue(config.key, { from: rangeValue.from, to: clamped });
  };

  // Shared thumb styles
  const thumbStyles = `
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
    [&::-webkit-slider-thumb]:relative
    [&::-webkit-slider-thumb]:z-30
    [&::-moz-range-thumb]:h-5
    [&::-moz-range-thumb]:w-5
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-white
    [&::-moz-range-thumb]:border-2
    [&::-moz-range-thumb]:border-blue-600
    [&::-moz-range-thumb]:shadow-md
    [&::-moz-range-thumb]:cursor-pointer
    [&::-moz-range-thumb]:border-0
    ${showError ? '[&::-webkit-slider-thumb]:border-red-500 [&::-moz-range-thumb]:border-red-500' : ''}
  `;

  const inputNumberStyles = `
    formkit-range-value
    w-16 text-center text-sm font-medium
    text-blue-600 bg-blue-50
    px-2 py-0.5 rounded
    border border-blue-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    [appearance:textfield]
    [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <div className="formkit-range-slider-field flex flex-col gap-2 mb-4">
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={fromId} label={config.label} required={config.required} />
      </div>

      {showValue && (
        <div className="flex justify-between">
          <input
            id={`${fieldId}-from-input`}
            type="number"
            min={min}
            max={rangeValue.to - step}
            step={step}
            value={rangeValue.from}
            disabled={isDisabled}
            aria-label={`${config.label} minimum`}
            onChange={(e) => handleFromInputChange(e.target.value)}
            onBlur={() => setTouched(config.key, true)}
            className={inputNumberStyles}
          />
          <input
            id={`${fieldId}-to-input`}
            type="number"
            min={rangeValue.from + step}
            max={max}
            step={step}
            value={rangeValue.to}
            disabled={isDisabled}
            aria-label={`${config.label} maximum`}
            onChange={(e) => handleToInputChange(e.target.value)}
            onBlur={() => setTouched(config.key, true)}
            className={inputNumberStyles}
          />
        </div>
      )}

      {/* Dual range slider container */}
      <div className="relative h-6">
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-3 bg-gray-200 rounded-lg" />

        {/* Active range highlight */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 bg-blue-500 rounded-lg"
          style={{
            left: `${fromPercent}%`,
            width: `${toPercent - fromPercent}%`,
          }}
        />

        {/* From slider */}
        <input
          id={fromId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={rangeValue.from}
          disabled={isDisabled}
          aria-label={`${config.label} minimum value`}
          aria-valuemin={min}
          aria-valuemax={rangeValue.to}
          aria-valuenow={rangeValue.from}
          aria-describedby={describedBy}
          onChange={(e) => handleFromChange(Number(e.target.value))}
          onBlur={() => setTouched(config.key, true)}
          className={`
                formkit-range-slider-from
                absolute top-0 w-full h-6
                appearance-none bg-transparent
                pointer-events-none
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:pointer-events-auto
                ${thumbStyles}
                ${isDisabled ? 'opacity-50' : ''}
            `}
        />

        {/* To slider */}
        <input
          id={toId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={rangeValue.to}
          disabled={isDisabled}
          aria-label={`${config.label} maximum value`}
          aria-invalid={showError}
          aria-required={config.required}
          aria-valuemin={rangeValue.from}
          aria-valuemax={max}
          aria-valuenow={rangeValue.to}
          onChange={(e) => handleToChange(Number(e.target.value))}
          onBlur={() => setTouched(config.key, true)}
          className={`
                formkit-range-slider-to
                absolute top-0 w-full h-6
                appearance-none bg-transparent
                pointer-events-none
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:pointer-events-auto
                ${thumbStyles}
                ${isDisabled ? 'opacity-50' : ''}
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

export type { Props as RangeSliderFieldProps };
