/**
 * DateField - Custom date picker dropdown
 * Styled to match SelectField/MultiSelectField for consistency
 */

import { useState, useRef, useEffect, type JSX, type KeyboardEvent } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import { useI18n } from '../../hooks/useI18n';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for DateField
 */
type Props = {
  config: FieldConfig;
};

/**
 * DateField component for date selection
 * Custom calendar dropdown matching SelectField styling
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function DateField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();
  const { t, translations } = useI18n();

  // Get translated months and weekdays
  const MONTHS = [
    translations.datetime.months.january,
    translations.datetime.months.february,
    translations.datetime.months.march,
    translations.datetime.months.april,
    translations.datetime.months.may,
    translations.datetime.months.june,
    translations.datetime.months.july,
    translations.datetime.months.august,
    translations.datetime.months.september,
    translations.datetime.months.october,
    translations.datetime.months.november,
    translations.datetime.months.december,
  ];

  const WEEKDAYS = [
    translations.datetime.daysShort.sun,
    translations.datetime.daysShort.mon,
    translations.datetime.daysShort.tue,
    translations.datetime.daysShort.wed,
    translations.datetime.daysShort.thu,
    translations.datetime.daysShort.fri,
    translations.datetime.daysShort.sat,
  ];

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;

  // Parse current value
  const parseDate = (): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const d = new Date(String(value));
    return isNaN(d.getTime()) ? null : d;
  };

  const selectedDate = parseDate();

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date());
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const mouseDownInsideRef = useRef(false);

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  // Format date for display
  const formatDisplayDate = (): string => {
    if (!selectedDate) return config.placeholder ?? t('datetime.selectDate');
    return selectedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format date for value (YYYY-MM-DD)
  const formatValueDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get calendar days for current view
  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Previous month padding
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Helper to open dropdown with state reset
  const openDropdown = () => {
    if (isDisabled || config.readOnly) return;
    setViewDate(selectedDate ?? new Date());
    setFocusedDate(selectedDate ?? new Date());
    setIsOpen(true);
  };

  // Handle date selection
  const selectDate = (date: Date) => {
    if (isDisabled || config.readOnly) return;
    setValue(config.key, formatValueDate(date));
    setTouched(config.key, true);
    setIsOpen(false);
  };

  // Handle clear
  const clearSelection = () => {
    if (isDisabled || config.readOnly) return;
    setValue(config.key, '');
    setTouched(config.key, true);
  };

  // Navigate months
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Check if dates are same day
  const isSameDay = (a: Date | null, b: Date | null): boolean => {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
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
        } else if (focusedDate) {
          selectDate(focusedDate);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;

      case 'ArrowLeft':
        if (isOpen && focusedDate) {
          e.preventDefault();
          const newDate = new Date(focusedDate);
          newDate.setDate(newDate.getDate() - 1);
          setFocusedDate(newDate);
          if (newDate.getMonth() !== viewDate.getMonth()) {
            setViewDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
          }
        }
        break;

      case 'ArrowRight':
        if (isOpen && focusedDate) {
          e.preventDefault();
          const newDate = new Date(focusedDate);
          newDate.setDate(newDate.getDate() + 1);
          setFocusedDate(newDate);
          if (newDate.getMonth() !== viewDate.getMonth()) {
            setViewDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
          }
        }
        break;

      case 'ArrowUp':
        if (isOpen && focusedDate) {
          e.preventDefault();
          const newDate = new Date(focusedDate);
          newDate.setDate(newDate.getDate() - 7);
          setFocusedDate(newDate);
          if (newDate.getMonth() !== viewDate.getMonth()) {
            setViewDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
          }
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else if (focusedDate) {
          const newDate = new Date(focusedDate);
          newDate.setDate(newDate.getDate() + 7);
          setFocusedDate(newDate);
          if (newDate.getMonth() !== viewDate.getMonth()) {
            setViewDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
          }
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

  const calendarDays = getCalendarDays();

  return (
    <div className="formkit-date-field flex flex-col gap-1 mb-4" ref={containerRef}>
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
            formkit-date-control
            min-h-[42px] px-3 py-2
            border rounded-lg
            cursor-pointer
            transition-colors duration-150
            focus:outline-none focus:ring-2 ${showError ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
            ${showError ? 'border-red-500 hover:border-red-400' : 'border-gray-300 hover:border-gray-400'}
            ${isDisabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white'}
            ${config.readOnly ? 'bg-gray-50' : ''}
            ${isOpen ? (showError ? 'ring-2 ring-red-500 border-red-500' : 'ring-2 ring-blue-500 border-blue-500') : ''}
          `}
        >
          <div className="flex items-center gap-2">
            {/* Calendar icon */}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            {/* Selected value display */}
            <span className={`flex-1 ${selectedDate ? 'text-gray-900' : 'text-gray-400'}`}>
              {formatDisplayDate()}
            </span>

            {/* Clear button */}
            {selectedDate && !isDisabled && !config.readOnly && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                aria-label={t('field.clearSelection')}
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

        {/* Calendar dropdown */}
        {isOpen && !isDisabled && !config.readOnly && (
          <div
            ref={calendarRef}
            role="dialog"
            aria-label={t('datetime.selectDate')}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="
              formkit-date-dropdown
              absolute z-50 mt-[7px]
              bg-white border border-gray-300 rounded-lg shadow-lg
              p-3 w-72
            "
          >
            {/* Month/Year header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                aria-label={t('datetime.previousMonth')}
                className="p-1 hover:bg-gray-100 rounded-lg focus:outline-none"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-sm font-semibold text-gray-800">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                aria-label={t('datetime.nextMonth')}
                className="p-1 hover:bg-gray-100 rounded-lg focus:outline-none"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-0 mb-1">
              {WEEKDAYS.map((day) => (
                <div key={day} className="w-9 text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0" role="grid" aria-label={t('a11y.calendar')}>
              {calendarDays.map((date, index) => (
                <div key={index} role="gridcell" className="flex items-center justify-center">
                  {date ? (
                    <button
                      type="button"
                      onClick={() => selectDate(date)}
                      aria-selected={isSameDay(date, selectedDate)}
                      aria-current={isToday(date) ? 'date' : undefined}
                      className={`
                        w-9 h-9 text-sm rounded-lg
                        flex items-center justify-center
                        transition-colors duration-100
                        focus:outline-none
                        ${
                          isSameDay(date, selectedDate)
                            ? 'bg-blue-100 text-blue-800 text-sm font-medium'
                            : isSameDay(date, focusedDate)
                              ? 'bg-blue-100'
                              : isToday(date)
                                ? 'bg-gray-100 font-semibold'
                                : 'hover:bg-gray-100'
                        }
                      `}
                    >
                      {date.getDate()}
                    </button>
                  ) : (
                    <div className="w-9 h-9" />
                  )}
                </div>
              ))}
            </div>

            {/* Today button */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => selectDate(new Date())}
                className="
                  w-full px-3 py-1.5 text-sm
                  text-blue-600 hover:bg-blue-50 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              >
                {t('datetime.today')}
              </button>
            </div>
          </div>
        )}
      </div>

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as DateFieldProps };
