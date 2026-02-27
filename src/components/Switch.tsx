/**
 * Switch Component
 *
 * A toggle switch component with customizable appearance and behavior.
 */

import { forwardRef, useId, useState, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export type SwitchSize = 'sm' | 'md' | 'lg';
export type SwitchColor = 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'gray';

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'onChange'
> {
  /** Input name for form submission */
  name: string;
  /** Whether the switch is on (controlled) */
  checked?: boolean;
  /** Initial checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Callback when switch state changes */
  onChange?: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Position of the label */
  labelPosition?: 'left' | 'right';
  /** Description text under the label */
  description?: string;
  /** Text shown when switch is on */
  onLabel?: string;
  /** Text shown when switch is off */
  offLabel?: string;
  /** Size of the switch */
  size?: SwitchSize;
  /** Color theme when on */
  color?: SwitchColor;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Whether the switch is required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Additional class for the container */
  className?: string;
  /** Show on/off icons inside the switch */
  showIcons?: boolean;
}

// ============================================================================
// Size configurations
// ============================================================================

const sizeStyles: Record<
  SwitchSize,
  {
    track: string;
    thumb: string;
    thumbTranslate: string;
    icon: string;
    label: string;
  }
> = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    thumbTranslate: 'translate-x-4',
    icon: 'w-2 h-2',
    label: 'text-sm',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    thumbTranslate: 'translate-x-5',
    icon: 'w-3 h-3',
    label: 'text-base',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    thumbTranslate: 'translate-x-7',
    icon: 'w-4 h-4',
    label: 'text-lg',
  },
};

// ============================================================================
// Color configurations
// ============================================================================

const colorStyles: Record<
  SwitchColor,
  {
    on: string;
    focus: string;
  }
> = {
  blue: {
    on: 'bg-blue-600',
    focus: 'focus:ring-blue-500',
  },
  green: {
    on: 'bg-green-600',
    focus: 'focus:ring-green-500',
  },
  red: {
    on: 'bg-red-600',
    focus: 'focus:ring-red-500',
  },
  purple: {
    on: 'bg-purple-600',
    focus: 'focus:ring-purple-500',
  },
  orange: {
    on: 'bg-orange-600',
    focus: 'focus:ring-orange-500',
  },
  gray: {
    on: 'bg-gray-600',
    focus: 'focus:ring-gray-500',
  },
};

// ============================================================================
// Switch Component
// ============================================================================

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      name,
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      label,
      labelPosition = 'right',
      description,
      onLabel,
      offLabel,
      size = 'md',
      color = 'blue',
      disabled = false,
      required = false,
      error,
      className = '',
      showIcons = false,
      id: propId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = propId || generatedId;
    const errorId = `${id}-error`;
    const descriptionId = `${id}-description`;

    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isChecked = isControlled ? controlledChecked : internalChecked;

    const sizeConfig = sizeStyles[size];
    const colorConfig = colorStyles[color];

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = e.target.checked;

        if (!isControlled) {
          setInternalChecked(newChecked);
        }

        onChange?.(newChecked);
      },
      [isControlled, onChange],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLLabelElement>) => {
        if (disabled) return;

        // Toggle on Space or Enter
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          const newChecked = !isChecked;

          if (!isControlled) {
            setInternalChecked(newChecked);
          }

          onChange?.(newChecked);
        }
      },
      [disabled, isChecked, isControlled, onChange],
    );

    const renderSwitch = () => (
      <div className="relative inline-flex flex-shrink-0">
        {/* Hidden actual checkbox */}
        <input
          ref={ref}
          type="checkbox"
          id={id}
          name={name}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className="sr-only peer"
          aria-invalid={!!error}
          aria-describedby={
            [description ? descriptionId : '', error ? errorId : ''].filter(Boolean).join(' ') ||
            undefined
          }
          {...props}
        />

        {/* Track */}
        <label
          htmlFor={id}
          onKeyDown={handleKeyDown}
          className={`
            ${sizeConfig.track}
            inline-flex items-center rounded-full cursor-pointer transition-colors duration-200
            ${isChecked ? colorConfig.on : 'bg-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            peer-focus:ring-2 peer-focus:ring-offset-2 ${colorConfig.focus}
          `}
          role="switch"
          aria-checked={isChecked}
          tabIndex={disabled ? -1 : 0}
        >
          {/* Icons inside track */}
          {showIcons && (
            <>
              {/* Check icon (shown when on) */}
              <span
                className={`
                  absolute left-1 transition-opacity duration-200
                  ${isChecked ? 'opacity-100' : 'opacity-0'}
                `}
                aria-hidden="true"
              >
                <svg
                  className={`${sizeConfig.icon} text-white`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>

              {/* X icon (shown when off) */}
              <span
                className={`
                  absolute right-1 transition-opacity duration-200
                  ${isChecked ? 'opacity-0' : 'opacity-100'}
                `}
                aria-hidden="true"
              >
                <svg
                  className={`${sizeConfig.icon} text-gray-400`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
            </>
          )}

          {/* Thumb */}
          <span
            className={`
              ${sizeConfig.thumb}
              inline-block rounded-full bg-white shadow-md transform transition-transform duration-200
              ${isChecked ? sizeConfig.thumbTranslate : 'translate-x-0.5'}
            `}
            aria-hidden="true"
          />
        </label>

        {/* On/Off text labels inside track - alternative to icons */}
        {(onLabel || offLabel) && !showIcons && (
          <span
            className={`
              absolute inset-0 flex items-center justify-center pointer-events-none
              ${sizeConfig.label} font-medium
            `}
            aria-hidden="true"
          >
            <span
              className={`
                absolute left-1.5 text-xs text-white transition-opacity
                ${isChecked ? 'opacity-100' : 'opacity-0'}
              `}
            >
              {onLabel}
            </span>
            <span
              className={`
                absolute right-1.5 text-xs text-gray-500 transition-opacity
                ${isChecked ? 'opacity-0' : 'opacity-100'}
              `}
            >
              {offLabel}
            </span>
          </span>
        )}
      </div>
    );

    const renderLabel = () => (
      <div className={`flex flex-col ${labelPosition === 'left' ? 'mr-3' : 'ml-3'}`}>
        <span className={`${sizeConfig.label} font-medium text-gray-900`}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {description && (
          <span id={descriptionId} className="text-sm text-gray-500">
            {description}
          </span>
        )}
      </div>
    );

    return (
      <div className={`flex flex-col ${className}`}>
        <div
          className={`
            flex items-start
            ${disabled ? 'opacity-50' : ''}
          `}
        >
          {label && labelPosition === 'left' && renderLabel()}
          {renderSwitch()}
          {label && labelPosition === 'right' && renderLabel()}
        </div>

        {/* Error Message */}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Switch.displayName = 'Switch';

export default Switch;
