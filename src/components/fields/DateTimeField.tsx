/**
 * DateTimeField - Combined date and time picker dropdown
 * Styled to match SelectField/MultiSelectField for consistency
 */

import { useState, useRef, useEffect, type JSX, type KeyboardEvent } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import { useI18n } from '../../hooks/useI18n';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for DateTimeField
 */
type Props = {
  config: FieldConfig;
};

/**
 * DateTimeField component for combined date and time selection
 * Custom dropdown matching SelectField styling
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function DateTimeField({ config }: Readonly<Props>): JSX.Element {
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

  // Parse current value (YYYY-MM-DDTHH:mm format)
  const parseDateTime = (): { date: Date | null; hours: number; minutes: number } => {
    const currentValue = typeof value === 'string' ? value : '';
    if (!currentValue) return { date: null, hours: 0, minutes: 0 };

    const [datePart, timePart] = currentValue.split('T');
    const date = datePart ? new Date(datePart) : null;
    const [h, m] = (timePart || '').split(':').map((v) => Number.parseInt(v, 10) || 0);

    return {
      date: date && !Number.isNaN(date.getTime()) ? date : null,
      hours: h,
      minutes: m,
    };
  };

  const { date: selectedDate, hours, minutes } = parseDateTime();

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');
  const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date());
  const [tempDate, setTempDate] = useState<Date | null>(selectedDate);
  const [selectedHour, setSelectedHour] = useState(hours);
  const [selectedMinute, setSelectedMinute] = useState(minutes);

  const containerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLUListElement>(null);
  const minuteListRef = useRef<HTMLUListElement>(null);
  const mouseDownInsideRef = useRef(false);

  // Config options
  const timeStep = config.timeStep ?? 60;
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

  // Format datetime for display
  const formatDisplayDateTime = (): string => {
    if (!selectedDate) return config.placeholder ?? t('datetime.selectDate');
    const datePart = selectedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const h = hours % 12 || 12;
    const ampm = hours >= 12 ? translations.datetime.pm : translations.datetime.am;
    const timePart = `${h}:${String(minutes).padStart(2, '0')} ${ampm}`;
    return `${datePart}, ${timePart}`;
  };

  // Format datetime for value (YYYY-MM-DDTHH:mm)
  const formatValueDateTime = (date: Date, h: number, m: number): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Helper to open dropdown with state reset
  const openDropdown = () => {
    if (isDisabled || config.readOnly) return;
    setViewDate(selectedDate ?? new Date());
    setTempDate(selectedDate);
    setSelectedHour(hours);
    setSelectedMinute(minutes);
    setActiveTab('date');
    setIsOpen(true);
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

    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
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

  // Handle date selection in calendar
  const selectCalendarDate = (date: Date) => {
    setTempDate(date);
    setActiveTab('time');
  };

  // Handle confirm
  const confirmSelection = () => {
    if (!tempDate) return;
    setValue(config.key, formatValueDateTime(tempDate, selectedHour, selectedMinute));
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

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (isDisabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
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

  // Scroll selected time into view
  useEffect(() => {
    if (isOpen && activeTab === 'time' && hourListRef.current) {
      const selectedEl = hourListRef.current.querySelector('[aria-selected="true"]');
      if (selectedEl?.scrollIntoView) {
        selectedEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [isOpen, activeTab, selectedHour]);

  useEffect(() => {
    if (isOpen && activeTab === 'time' && minuteListRef.current) {
      const selectedEl = minuteListRef.current.querySelector('[aria-selected="true"]');
      if (selectedEl?.scrollIntoView) {
        selectedEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [isOpen, activeTab, selectedMinute]);

  const calendarDays = getCalendarDays();
  let emptyCellCounter = 0;

  return (
    <div className="formkit-datetime-field flex flex-col gap-1 mb-4" ref={containerRef}>
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      {config.description && !showError && (
        <p id={descId} className="text-xs text-gray-500">
          {config.description}
        </p>
      )}

      <div className="relative">
        {/* Main control area */}
        <button
          type="button"
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
            formkit-datetime-control
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
            {/* Calendar + Clock icon */}
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
              {formatDisplayDateTime()}
            </span>

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
        </button>

        {selectedDate && !isDisabled && !config.readOnly && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
            aria-label={t('field.clearSelection')}
            className="absolute right-7 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
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

        {/* DateTime picker dropdown */}
        {isOpen && !isDisabled && !config.readOnly && (
          <dialog
            open
            aria-label={t('datetime.selectDate')}
            className="
              formkit-datetime-dropdown
              absolute z-50 mt-[7px]
              bg-white border border-gray-300 rounded-lg shadow-lg
              p-3 w-72
            "
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('date')}
                className={`
                  flex-1 px-3 py-2 text-sm font-medium
                  border-b-2 transition-colors
                  ${
                    activeTab === 'date'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }
                `}
              >
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {t('datetime.dateLabel')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('time')}
                className={`
                  flex-1 px-3 py-2 text-sm font-medium
                  border-b-2 transition-colors
                  ${
                    activeTab === 'time'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }
                `}
              >
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t('datetime.timeLabel')}
                </span>
              </button>
            </div>

            {/* Date Tab Content */}
            {activeTab === 'date' && (
              <div>
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
                    <div
                      key={day}
                      className="w-9 text-center text-xs font-medium text-gray-500 py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0" role="grid" aria-label={t('a11y.calendar')}>
                  {calendarDays.map((date) => (
                    <div
                      key={date ? date.toISOString() : `empty-${emptyCellCounter++}`}
                      role="gridcell"
                      className="flex items-center justify-center"
                    >
                      {date ? (
                        <button
                          type="button"
                          onClick={() => selectCalendarDate(date)}
                          aria-selected={isSameDay(date, tempDate)}
                          aria-current={isToday(date) ? 'date' : undefined}
                          className={`
                            w-9 h-9 text-sm rounded-lg
                            flex items-center justify-center
                            transition-colors duration-100
                            focus:outline-none
                            ${
                              isSameDay(date, tempDate)
                                ? 'bg-blue-100 text-blue-800 text-sm font-medium'
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
                    onClick={() => {
                      setTempDate(new Date());
                      setActiveTab('time');
                    }}
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

            {/* Time Tab Content */}
            {activeTab === 'time' && (
              <div>
                {/* Selected date display */}
                {tempDate && (
                  <div className="text-center text-sm text-gray-600 mb-3">
                    {tempDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  {/* Hours column */}
                  <div className="flex flex-1 flex-col p-2 border border-gray-200 rounded-md">
                    <span className="text-sm font-medium text-center mb-1">
                      {t('datetime.hour')}
                    </span>
                    <ul
                      ref={hourListRef}
                      aria-label={t('datetime.hour')}
                      className="h-40 overflow-auto py-1 scrollbar-none"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {hourOptions.map((h) => {
                        const displayHour = h % 12 || 12;
                        const ampm = h >= 12 ? translations.datetime.pm : translations.datetime.am;
                        return (
                          <li key={h} aria-selected={h === selectedHour}>
                            <button
                              type="button"
                              onClick={() => setSelectedHour(h)}
                              className={`
                                w-full px-2 py-1.5 text-sm text-center rounded-md
                                transition-colors duration-100
                                ${h === selectedHour ? 'bg-blue-100 text-blue-800 text-sm font-medium' : 'hover:bg-gray-100'}
                              `}
                            >
                              {displayHour} {ampm}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Minutes column */}
                  <div className="flex flex-1 flex-col p-2 border border-gray-200 rounded-md">
                    <span className="text-sm font-medium text-center mb-1">
                      {t('datetime.minute')}
                    </span>
                    <ul
                      ref={minuteListRef}
                      aria-label={t('datetime.minute')}
                      className="h-40 overflow-auto py-1 scrollbar-none"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {minuteOptions.map((m) => (
                        <li key={m} aria-selected={m === selectedMinute}>
                          <button
                            type="button"
                            onClick={() => setSelectedMinute(m)}
                            className={`
                              w-full px-2 py-1.5 text-sm text-center rounded-md
                              transition-colors duration-100
                              ${m === selectedMinute ? 'bg-blue-100 text-blue-800 text-sm font-medium' : 'hover:bg-gray-100'}
                            `}
                          >
                            {String(m).padStart(2, '0')}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm button */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={confirmSelection}
                disabled={!tempDate}
                className={`
                  w-full px-3 py-1.5 text-sm font-medium rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                  ${
                    tempDate
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {t('form.confirm')}
              </button>
            </div>
          </dialog>
        )}
      </div>

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as DateTimeFieldProps };
