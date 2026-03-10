/**
 * TimeField - Custom time picker dropdown
 * Styled to match SelectField/MultiSelectField for consistency
 */

import { useState, useRef, useEffect, type JSX, type KeyboardEvent } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for TimeField
 */
type Props = {
  config: FieldConfig;
};

/**
 * TimeField component for time selection
 * Custom dropdown matching SelectField styling
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function TimeField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;

  // Parse current value (HH:mm format)
  const currentValue = typeof value === 'string' ? value : '';
  const [hours, minutes] = currentValue.split(':').map((v) => parseInt(v, 10) || 0);

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(hours || 0);
  const [selectedMinute, setSelectedMinute] = useState(minutes || 0);
  const [focusedColumn, setFocusedColumn] = useState<'hour' | 'minute'>('hour');

  const containerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLUListElement>(null);
  const minuteListRef = useRef<HTMLUListElement>(null);
  const mouseDownInsideRef = useRef(false);

  // Config options
  const timeStep = config.timeStep ?? 60; // in seconds, convert to minutes
  const minuteInterval = Math.max(1, Math.floor(timeStep / 60));

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  // Generate hour options (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  // Generate minute options based on interval
  const minuteOptions = Array.from(
    { length: Math.ceil(60 / minuteInterval) },
    (_, i) => i * minuteInterval,
  ).filter((m) => m < 60);

  // Format time for display
  const formatDisplayTime = (): string => {
    if (!currentValue) return config.placeholder ?? 'Select time...';
    const h = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${h}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  // Format time for value (HH:mm)
  const formatValueTime = (h: number, m: number): string => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Handle time selection
  const selectTime = (h: number, m: number) => {
    if (isDisabled || config.readOnly) return;
    setValue(config.key, formatValueTime(h, m));
    setTouched(config.key, true);
  };

  // Handle clear
  const clearSelection = () => {
    if (isDisabled || config.readOnly) return;
    setValue(config.key, '');
    setTouched(config.key, true);
  };

  // Handle confirm
  const confirmSelection = () => {
    selectTime(selectedHour, selectedMinute);
    setIsOpen(false);
  };

  // Helper to open dropdown with state reset
  const openDropdown = () => {
    if (isDisabled || config.readOnly) return;
    setSelectedHour(hours || 0);
    setSelectedMinute(minutes || 0);
    setFocusedColumn('hour');
    setIsOpen(true);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          confirmSelection();
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;

      case 'ArrowUp':
        if (isOpen) {
          e.preventDefault();
          if (focusedColumn === 'hour') {
            setSelectedHour((prev) => (prev - 1 + 24) % 24);
          } else {
            const idx = minuteOptions.indexOf(selectedMinute);
            const newIdx = (idx - 1 + minuteOptions.length) % minuteOptions.length;
            setSelectedMinute(minuteOptions[newIdx]);
          }
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          if (focusedColumn === 'hour') {
            setSelectedHour((prev) => (prev + 1) % 24);
          } else {
            const idx = minuteOptions.indexOf(selectedMinute);
            const newIdx = (idx + 1) % minuteOptions.length;
            setSelectedMinute(minuteOptions[newIdx]);
          }
        }
        break;

      case 'ArrowLeft':
        if (isOpen) {
          e.preventDefault();
          setFocusedColumn('hour');
        }
        break;

      case 'ArrowRight':
        if (isOpen) {
          e.preventDefault();
          setFocusedColumn('minute');
        }
        break;

      case 'Tab':
        if (isOpen) {
          e.preventDefault();
          setFocusedColumn((prev) => (prev === 'hour' ? 'minute' : 'hour'));
        }
        break;
    }
  };

  // Track mousedown inside container to prevent blur from closing dropdown
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      mouseDownInsideRef.current = containerRef.current?.contains(e.target as Node) ?? false;
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Close dropdown only if both mousedown and mouseup are outside
      if (!mouseDownInsideRef.current && !containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
      mouseDownInsideRef.current = false;
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Scroll selected items into view
  useEffect(() => {
    if (isOpen && hourListRef.current) {
      const selectedEl = hourListRef.current.querySelector('[aria-selected="true"]');
      if (selectedEl?.scrollIntoView) {
        selectedEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [isOpen, selectedHour]);

  useEffect(() => {
    if (isOpen && minuteListRef.current) {
      const selectedEl = minuteListRef.current.querySelector('[aria-selected="true"]');
      if (selectedEl?.scrollIntoView) {
        selectedEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [isOpen, selectedMinute]);

  return (
    <div className="formkit-time-field flex flex-col gap-1 mb-4" ref={containerRef}>
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      {config.description && !showError && (
        <p id={descId} className="text-xs text-gray-500">
          {config.description}
        </p>
      )}

      <div className="relative">
        {/* Main control area */}
        <div
          id={fieldId}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-invalid={showError}
          aria-required={config.required}
          aria-describedby={describedBy}
          tabIndex={isDisabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onClick={() =>
            !isDisabled && !config.readOnly && (isOpen ? setIsOpen(false) : openDropdown())
          }
          onBlur={(e) => {
            // Only set touched, don't close dropdown (handled by click-outside)
            if (
              !containerRef.current?.contains(e.relatedTarget as Node) &&
              !mouseDownInsideRef.current
            ) {
              setTouched(config.key, true);
            }
          }}
          className={`
            formkit-time-control
            min-h-[42px] px-3 py-2
            border rounded-lg
            cursor-pointer
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${showError ? 'border-red-500 hover:border-red-400' : 'border-gray-300 hover:border-gray-400'}
            ${isDisabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white'}
            ${config.readOnly ? 'bg-gray-50' : ''}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        >
          <div className="flex items-center gap-2">
            {/* Clock icon */}
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            {/* Selected value display */}
            <span className={`flex-1 ${currentValue ? 'text-gray-900' : 'text-gray-400'}`}>
              {formatDisplayTime()}
            </span>

            {/* Clear button */}
            {currentValue && !isDisabled && !config.readOnly && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                aria-label="Clear time"
                className="
                  p-1 text-gray-400 hover:text-gray-600
                  focus:outline-none focus:ring-1 focus:ring-blue-500 rounded
                "
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Dropdown arrow */}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Time picker dropdown */}
        {isOpen && !isDisabled && !config.readOnly && (
          <div
            role="dialog"
            aria-label="Choose time"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="
              formkit-time-dropdown
              absolute z-50 mt-[7px]
              bg-white border border-gray-300 rounded-lg shadow-lg
              p-3 w-52
            "
          >
            <div className="flex gap-3 justify-center">
              {/* Hours column */}
              <div className="flex flex-1 flex-col p-2 border border-gray-200 rounded-md">
                <span className="text-sm font-medium text-center mb-1">Hour</span>
                <ul
                  ref={hourListRef}
                  role="listbox"
                  aria-label="Hour"
                  className="h-48 overflow-auto py-1 scrollbar-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {hourOptions.map((h) => {
                    const displayHour = h % 12 || 12;
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    return (
                      <li
                        key={h}
                        role="option"
                        aria-selected={h === selectedHour}
                        onClick={() => {
                          setSelectedHour(h);
                          setFocusedColumn('minute');
                        }}
                        className={`
                          px-2 py-1.5 text-sm text-center rounded-md cursor-pointer
                          transition-colors duration-100
                          ${h === selectedHour ? 'bg-blue-100 text-blue-800 text-sm font-medium' : 'hover:bg-gray-100'}
                        `}
                      >
                        {displayHour} {ampm}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Minutes column */}
              <div className="flex flex-1 flex-col p-2 border border-gray-200 rounded-md">
                <span className="text-sm font-medium text-center mb-1">Min</span>
                <ul
                  ref={minuteListRef}
                  role="listbox"
                  aria-label="Minute"
                  className="h-48 overflow-auto py-1 scrollbar-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {minuteOptions.map((m) => (
                    <li
                      key={m}
                      role="option"
                      aria-selected={m === selectedMinute}
                      onClick={() => setSelectedMinute(m)}
                      className={`
                        px-2 py-1.5 text-sm text-center rounded-md cursor-pointer
                        transition-colors duration-100
                        ${m === selectedMinute ? 'bg-blue-100 text-blue-800 text-sm font-medium' : 'hover:bg-gray-100'}
                      `}
                    >
                      {String(m).padStart(2, '0')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Confirm button */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={confirmSelection}
                className="
                  w-full px-3 py-1.5 text-sm font-medium
                  bg-blue-600 text-white rounded-lg
                  hover:bg-blue-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                "
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as TimeFieldProps };
