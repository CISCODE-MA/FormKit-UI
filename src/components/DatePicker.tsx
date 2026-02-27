/**
 * DatePicker component with calendar popup
 */

import { forwardRef, useId, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ValidationRule } from '../validation/types';
import { useFormField } from '../hooks/useFormField';
import { useValidation } from '../hooks/useValidation';
import { useFieldError } from '../hooks/useFieldError';

/**
 * Date format options
 */
export type DateFormat = 'yyyy-MM-dd' | 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'dd.MM.yyyy';

/**
 * Props for DatePicker component
 */
export interface DatePickerProps {
  /** Input name attribute */
  name: string;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Default value (Date or ISO string) */
  defaultValue?: Date | string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Custom CSS class name for the container */
  className?: string;
  /** Custom CSS class name for the input element */
  inputClassName?: string;
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
  /** Date display format */
  dateFormat?: DateFormat;
  /** First day of the week (0 = Sunday, 1 = Monday) */
  firstDayOfWeek?: 0 | 1;
  /** Show today button */
  showTodayButton?: boolean;
  /** Show clear button */
  showClearButton?: boolean;
  /** Change handler */
  onChange?: (value: Date | null) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Validation change handler */
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Format a date to a string
 */
export function formatDate(date: Date | null, format: DateFormat = 'yyyy-MM-dd'): string {
  if (!date || isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (format) {
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'MM/dd/yyyy':
      return `${month}/${day}/${year}`;
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'dd.MM.yyyy':
      return `${day}.${month}.${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Parse a date string to a Date object
 */
export function parseDate(value: string, format: DateFormat = 'yyyy-MM-dd'): Date | null {
  if (!value || value.trim() === '') return null;

  let year: number, month: number, day: number;

  try {
    switch (format) {
      case 'yyyy-MM-dd': {
        const [y, m, d] = value.split('-').map(Number);
        year = y;
        month = m;
        day = d;
        break;
      }
      case 'MM/dd/yyyy': {
        const [m, d, y] = value.split('/').map(Number);
        year = y;
        month = m;
        day = d;
        break;
      }
      case 'dd/MM/yyyy': {
        const [d, m, y] = value.split('/').map(Number);
        year = y;
        month = m;
        day = d;
        break;
      }
      case 'dd.MM.yyyy': {
        const [d, m, y] = value.split('.').map(Number);
        year = y;
        month = m;
        day = d;
        break;
      }
      default:
        return null;
    }

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;

    return date;
  } catch {
    return null;
  }
}

/**
 * Check if two dates are the same day
 */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Check if a date is within a range
 */
function isDateInRange(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
}

/**
 * Get days in a month
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get day of week for first day of month (0-6)
 */
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Month names
 */
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Short day names
 */
const DAY_NAMES_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Calendar icon
 */
function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

/**
 * Chevron left icon
 */
function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * Chevron right icon
 */
function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

/**
 * Calendar component
 */
interface CalendarProps {
  selectedDate: Date | null;
  viewDate: Date;
  minDate?: Date;
  maxDate?: Date;
  firstDayOfWeek: 0 | 1;
  showTodayButton: boolean;
  showClearButton: boolean;
  onSelectDate: (date: Date) => void;
  onClear: () => void;
  onNavigate: (date: Date) => void;
}

function Calendar({
  selectedDate,
  viewDate,
  minDate,
  maxDate,
  firstDayOfWeek,
  showTodayButton,
  showClearButton,
  onSelectDate,
  onClear,
  onNavigate,
}: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Adjust for first day of week
  const adjustedFirstDay = (firstDay - firstDayOfWeek + 7) % 7;

  // Day names adjusted for first day of week
  const dayNames = useMemo(() => {
    const names = [...DAY_NAMES_SHORT];
    if (firstDayOfWeek === 1) {
      names.push(names.shift()!);
    }
    return names;
  }, [firstDayOfWeek]);

  // Navigate to previous month
  const prevMonth = useCallback(() => {
    const newDate = new Date(year, month - 1, 1);
    onNavigate(newDate);
  }, [year, month, onNavigate]);

  // Navigate to next month
  const nextMonth = useCallback(() => {
    const newDate = new Date(year, month + 1, 1);
    onNavigate(newDate);
  }, [year, month, onNavigate]);

  // Select today
  const selectToday = useCallback(() => {
    onSelectDate(today);
  }, [today, onSelectDate]);

  // Generate calendar grid
  const days = useMemo(() => {
    const result: (number | null)[] = [];

    // Add empty cells for days before first day of month
    for (let i = 0; i < adjustedFirstDay; i++) {
      result.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      result.push(day);
    }

    return result;
  }, [adjustedFirstDay, daysInMonth]);

  return (
    <div className="formkit-calendar bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <span className="font-medium text-gray-800">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Next month"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((name) => (
          <div key={name} className="text-center text-xs font-medium text-gray-500 py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendar">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-8" />;
          }

          const date = new Date(year, month, day);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isToday = isSameDay(date, today);
          const isDisabled = !isDateInRange(date, minDate, maxDate);

          return (
            <button
              key={day}
              type="button"
              onClick={() => !isDisabled && onSelectDate(date)}
              disabled={isDisabled}
              className={`h-8 w-8 rounded text-sm transition-colors ${
                isSelected
                  ? 'bg-blue-500 text-white font-medium'
                  : isToday
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : isDisabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label={formatDate(date, 'yyyy-MM-dd')}
              aria-selected={isSelected || undefined}
              aria-current={isToday ? 'date' : undefined}
              role="gridcell"
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      {(showTodayButton || showClearButton) && (
        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
          {showTodayButton && (
            <button
              type="button"
              onClick={selectToday}
              className="flex-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              Today
            </button>
          )}
          {showClearButton && (
            <button
              type="button"
              onClick={onClear}
              className="flex-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * DatePicker component with calendar popup
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      name,
      label,
      placeholder = 'Select date',
      defaultValue,
      minDate,
      maxDate,
      required = false,
      disabled = false,
      readOnly = false,
      className = '',
      inputClassName = '',
      validationRules = [],
      validateOn = 'blur',
      debounce,
      showError = true,
      autoDismissError,
      hint,
      dateFormat = 'yyyy-MM-dd',
      firstDayOfWeek = 0,
      showTodayButton = true,
      showClearButton = true,
      onChange,
      onBlur,
      onFocus,
      onValidationChange,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = `date-${name}-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = hint ? `${fieldId}-hint` : undefined;

    // Internal refs
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Parse default value
    const initialDate = useMemo(() => {
      if (!defaultValue) return null;
      if (defaultValue instanceof Date) return defaultValue;
      return parseDate(defaultValue, dateFormat) || new Date(defaultValue);
    }, [defaultValue, dateFormat]);

    // State
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState<Date>(initialDate || new Date());

    // Display value
    const displayValue = selectedDate ? formatDate(selectedDate, dateFormat) : '';

    // Field state management
    const {
      isTouched,
      handleBlur: fieldBlur,
      handleFocus,
    } = useFormField({
      initialValue: displayValue,
      disabled,
      readOnly,
      onBlur: () => {
        onBlur?.();
        if (validateOn === 'blur') {
          validate(displayValue);
        }
      },
      onFocus,
    });

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
    if (errors.length > 0 && error !== errors[0]) {
      setErrors(errors);
    } else if (errors.length === 0 && error !== null) {
      setErrors([]);
    }

    // Handle date selection
    const handleSelectDate = useCallback(
      (date: Date) => {
        setSelectedDate(date);
        setViewDate(date);
        setIsOpen(false);
        onChange?.(date);
        if (validateOn === 'change') {
          validate(formatDate(date, dateFormat));
        }
      },
      [onChange, validateOn, validate, dateFormat],
    );

    // Handle clear
    const handleClear = useCallback(() => {
      setSelectedDate(null);
      setIsOpen(false);
      onChange?.(null);
      if (validateOn === 'change') {
        validate('');
      }
    }, [onChange, validateOn, validate]);

    // Handle navigation
    const handleNavigate = useCallback((date: Date) => {
      setViewDate(date);
    }, []);

    // Toggle calendar
    const toggleCalendar = useCallback(() => {
      if (!disabled && !readOnly) {
        setIsOpen((prev) => !prev);
      }
    }, [disabled, readOnly]);

    // Handle input change (manual typing)
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const parsed = parseDate(value, dateFormat);
        if (parsed && isDateInRange(parsed, minDate, maxDate)) {
          setSelectedDate(parsed);
          setViewDate(parsed);
          onChange?.(parsed);
        } else if (value === '') {
          setSelectedDate(null);
          onChange?.(null);
        }
      },
      [dateFormat, minDate, maxDate, onChange],
    );

    // Handle blur
    const handleBlur = useCallback(() => {
      fieldBlur();
    }, [fieldBlur]);

    // Close on click outside
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          inputRef.current?.focus();
        } else if (e.key === 'Enter' && !isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
      },
      [isOpen],
    );

    const hasError = isTouched && error !== null;
    const showHint = hint && !hasError;

    return (
      <div
        ref={containerRef}
        className={`formkit-datepicker-container ${className} mb-4 relative`}
        onKeyDown={handleKeyDown}
      >
        {label ? (
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        ) : (
          <label htmlFor={fieldId} className="sr-only">
            {name}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={(node) => {
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            id={fieldId}
            name={name}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onClick={toggleCalendar}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            className={`formkit-datepicker-input ${inputClassName} w-full pl-3 pr-10 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded transition-all duration-150 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:border-gray-300 cursor-pointer ${hasError ? 'formkit-datepicker-error border-red-500 focus:ring-red-500 focus:border-red-500 hover:border-red-400' : ''} ${isTouched && isValid ? 'border-green-500 focus:ring-green-500 focus:border-green-500 hover:border-green-400' : ''}`}
            aria-invalid={hasError}
            aria-describedby={
              [hasError ? errorId : undefined, showHint ? hintId : undefined]
                .filter(Boolean)
                .join(' ') || undefined
            }
            aria-expanded={isOpen}
            aria-haspopup="dialog"
          />
          <button
            type="button"
            onClick={toggleCalendar}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-blue-500 transition-colors disabled:opacity-50"
            aria-label="Open calendar"
            tabIndex={-1}
          >
            <CalendarIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar popup */}
        {isOpen && (
          <div
            className="absolute z-50 mt-1"
            role="dialog"
            aria-label="Choose date"
            aria-modal="true"
          >
            <Calendar
              selectedDate={selectedDate}
              viewDate={viewDate}
              minDate={minDate}
              maxDate={maxDate}
              firstDayOfWeek={firstDayOfWeek}
              showTodayButton={showTodayButton}
              showClearButton={showClearButton}
              onSelectDate={handleSelectDate}
              onClear={handleClear}
              onNavigate={handleNavigate}
            />
          </div>
        )}

        {showHint && (
          <div id={hintId} className="text-xs text-gray-500 mt-1">
            {hint}
          </div>
        )}
        {showError && hasError && (
          <div id={errorId} className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
            {error}
          </div>
        )}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';
