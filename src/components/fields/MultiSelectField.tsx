/**
 * MultiSelectField - Multi-select dropdown with search, tags, and keyboard navigation
 */

import { useState, useRef, useEffect, type JSX, type KeyboardEvent } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import { useI18n } from '../../hooks/useI18n';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for MultiSelectField
 */
type Props = {
  config: FieldConfig;
};

/**
 * MultiSelectField component for selecting multiple options
 * Features: searchable dropdown, tag display, clear all, keyboard navigation
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function MultiSelectField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();
  const { t } = useI18n();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;
  const listboxId = `${fieldId}-listbox`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;

  // Parse value as array, filtering out undefined/null values
  const selectedValues: (string | number)[] = Array.isArray(value)
    ? (value.filter((v) => v !== undefined && v !== null) as (string | number)[])
    : [];

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  // Filter options based on search
  const options = config.options ?? [];
  const filteredOptions = searchQuery
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  // Get selected options for tag display
  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

  // Handle option toggle
  const toggleOption = (optionValue: string | number) => {
    if (isDisabled) return;

    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];

    setValue(config.key, newValues);
    setTouched(config.key, true);
  };

  // Handle remove tag
  const removeTag = (optionValue: string | number) => {
    if (isDisabled) return;
    setValue(
      config.key,
      selectedValues.filter((v) => v !== optionValue),
    );
    setTouched(config.key, true);
  };

  // Handle clear all
  const clearAll = () => {
    if (isDisabled) return;
    setValue(config.key, []);
    setTouched(config.key, true);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          toggleOption(filteredOptions[focusedIndex].value);
        } else if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
        break;

      case 'Home':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(0);
        }
        break;

      case 'End':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(filteredOptions.length - 1);
        }
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const focusedElement = listboxRef.current.children[focusedIndex] as HTMLElement;
      // Guard for jsdom which doesn't have scrollIntoView
      if (focusedElement?.scrollIntoView) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="formkit-multiselect-field flex flex-col gap-1 mb-4" ref={containerRef}>
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
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-invalid={showError}
          aria-required={config.required}
          aria-describedby={describedBy}
          aria-activedescendant={
            isOpen && focusedIndex >= 0 ? `${fieldId}-option-${focusedIndex}` : undefined
          }
          tabIndex={isDisabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          onBlur={(e) => {
            // Only close if focus leaves the entire component
            if (!containerRef.current?.contains(e.relatedTarget as Node)) {
              setIsOpen(false);
              setSearchQuery('');
              setTouched(config.key, true);
            }
          }}
          className={`
            formkit-multiselect-control
            min-h-[42px] px-3 py-2
            border rounded-lg
            cursor-pointer
            transition-colors duration-150
            focus:outline-none focus:ring-2 ${showError ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
            ${showError ? 'border-red-500 hover:border-red-400' : 'border-gray-300 hover:border-gray-400'}
            ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${isOpen ? (showError ? 'ring-2 ring-red-500 border-red-500' : 'ring-2 ring-blue-500 border-blue-500') : ''}
          `}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Selected tags */}
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <span
                  key={String(option.value)}
                  className={`
                    formkit-multiselect-tag
                    inline-flex items-center gap-1
                    px-2 py-0.5
                    text-sm font-medium
                    bg-blue-100 text-blue-800
                    rounded-md
                    ${isDisabled ? 'opacity-60' : ''}
                  `}
                >
                  {option.label}
                  {!isDisabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(option.value);
                      }}
                      aria-label={`Remove ${option.label}`}
                      className="
                        ml-0.5 p-0.5
                        hover:bg-blue-200 rounded-full
                        focus:outline-none focus:ring-1 focus:ring-blue-500
                      "
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-gray-400">{config.placeholder ?? t('field.selectOption')}</span>
            )}

            {/* Spacer and controls */}
            <div className="flex-1" />

            {/* Clear all button */}
            {selectedOptions.length > 0 && !isDisabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
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

        {/* Dropdown */}
        {isOpen && !isDisabled && (
          <div
            className="
              formkit-multiselect-dropdown
              absolute z-50 mt-[7px]
              w-full max-h-60
              bg-white border border-gray-300 rounded-lg shadow-lg
              overflow-hidden
            "
          >
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFocusedIndex(0);
                }}
                onKeyDown={(e) => {
                  // Handle keyboard in search input
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setIsOpen(false);
                    setSearchQuery('');
                    setFocusedIndex(-1);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setFocusedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setFocusedIndex((prev) => Math.max(prev - 1, 0));
                  } else if (
                    e.key === 'Enter' &&
                    focusedIndex >= 0 &&
                    focusedIndex < filteredOptions.length
                  ) {
                    e.preventDefault();
                    toggleOption(filteredOptions[focusedIndex].value);
                  }
                }}
                placeholder={t('field.search')}
                aria-label={t('field.search')}
                className="
                  w-full px-3 py-1.5
                  text-sm
                  border border-gray-300 rounded-md
                  focus:outline-none
                "
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options list */}
            <ul
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              aria-label={config.label}
              className="max-h-48 overflow-auto py-1 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500 text-center">
                  {t('field.noOptionsFound')}
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isFocused = focusedIndex === index;

                  return (
                    <li
                      key={String(option.value)}
                      id={`${fieldId}-option-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!option.disabled) {
                          toggleOption(option.value);
                        }
                      }}
                      onMouseEnter={() => setFocusedIndex(index)}
                      className={`
                        flex items-center gap-2 px-3 py-2
                        cursor-pointer text-sm
                        transition-colors duration-100
                        ${isFocused ? 'bg-blue-50' : ''}
                        ${isSelected ? 'bg-blue-100' : ''}
                        ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}
                      `}
                    >
                      {/* Checkbox indicator */}
                      <span
                        className={`
                          flex-shrink-0
                          w-4 h-4
                          border rounded
                          flex items-center justify-center
                          ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
                        `}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>

                      <span className="flex-1">{option.label}</span>
                    </li>
                  );
                })
              )}
            </ul>

            {/* Selection count */}
            {selectedValues.length > 0 && (
              <div className="px-3 py-2 border-t border-gray-200 text-xs text-gray-500">
                {selectedValues.length} {t('field.selected')}
              </div>
            )}
          </div>
        )}
      </div>

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as MultiSelectFieldProps };
