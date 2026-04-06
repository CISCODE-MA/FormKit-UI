/**
 * TagsField - Multi-tag input with add/remove functionality
 */

import { useState, useRef, type JSX, type KeyboardEvent, type ClipboardEvent } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import { useI18n } from '../../hooks/useI18n';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for TagsField
 */
type Props = {
  config: FieldConfig;
};

/**
 * TagsField component for entering multiple tags/keywords
 * Supports Enter/comma to add, backspace to remove, paste for bulk add
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function TagsField({ config }: Readonly<Props>): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();
  const { t } = useI18n();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;
  const inputId = `${fieldId}-input`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;

  // Parse current value - expect string[] or fall back to empty array
  const tags: string[] = Array.isArray(value)
    ? (value.filter((v): v is string => typeof v === 'string') as string[])
    : [];

  // Input state for new tag
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Config options with defaults
  const maxTags = config.maxTags ?? Infinity;
  const minTags = config.minTags ?? 0;
  const allowDuplicates = config.allowDuplicates ?? true;

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  // Add a tag
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (tags.length >= maxTags) return;
    if (!allowDuplicates && tags.includes(trimmed)) return;

    setValue(config.key, [...tags, trimmed]);
    setInputValue('');
  };

  // Remove a tag by index (respects minTags)
  const removeTag = (index: number) => {
    if (tags.length <= minTags) return; // Prevent removing below minimum
    const newTags = tags.filter((_, i) => i !== index);
    setValue(config.key, newTags);
  };

  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > minTags) {
      // Remove last tag when backspace on empty input (respects minTags)
      removeTag(tags.length - 1);
    }
  };

  // Handle paste - split by commas and add all
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes(',')) {
      e.preventDefault();
      const newTags = pastedText
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t !== '');

      const currentTags = [...tags];
      for (const tag of newTags) {
        if (currentTags.length >= maxTags) break;
        if (!allowDuplicates && currentTags.includes(tag)) continue;
        currentTags.push(tag);
      }
      setValue(config.key, currentTags);
    }
  };

  // Focus input when clicking container
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const canAddMore = tags.length < maxTags;

  return (
    <div className="formkit-tags-field flex flex-col gap-2 mb-4">
      <FieldLabel htmlFor={inputId} label={config.label} required={config.required} />

      <div
        onClick={handleContainerClick}
        className={`
          formkit-tags-container
          flex flex-wrap gap-2 p-2
          border rounded-lg
          min-h-[42px]
          cursor-text
          transition-all duration-150
          ${
            showError
              ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500'
              : 'border-gray-300 hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500'
          }
          ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        aria-describedby={describedBy}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className={`
              formkit-tag
              inline-flex items-center gap-1
              px-2 py-1
              bg-blue-100 text-blue-800
              text-sm font-medium
              rounded-md
              ${isDisabled ? 'opacity-50' : ''}
            `}
            role="option"
            aria-selected="true"
          >
            {tag}
            {!isDisabled && tags.length > minTags && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="
                  formkit-tag-remove
                  ml-1 p-0.5
                  hover:bg-blue-200
                  rounded
                  focus:outline-none focus:ring-1 focus:ring-blue-500
                "
                aria-label={`${t('tags.removeTag')}: ${tag}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        ))}

        {canAddMore && !isDisabled && (
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={() => {
              // Add tag on blur if there's input
              if (inputValue.trim()) {
                addTag(inputValue);
              }
              setTouched(config.key, true);
            }}
            placeholder={tags.length === 0 ? (config.placeholder ?? t('field.typeAndEnter')) : ''}
            disabled={isDisabled}
            aria-invalid={showError}
            className="
              formkit-tags-input
              flex-1 min-w-[120px]
              border-none outline-none
              bg-transparent
              text-sm
              placeholder:text-gray-400
            "
          />
        )}
      </div>

      {config.description && !showError && (
        <p id={descId} className="text-xs text-gray-500">
          {config.description}
        </p>
      )}

      {(maxTags < Infinity || minTags > 0) && (
        <p className="text-xs text-gray-400">
          {tags.length}
          {maxTags < Infinity && `/${maxTags}`} tags
          {minTags > 0 && ` (min: ${minTags})`}
        </p>
      )}

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as TagsFieldProps };
