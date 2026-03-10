/**
 * RatingField - Star rating input component
 */

import { useState, type JSX, type KeyboardEvent } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for RatingField
 */
type Props = {
  config: FieldConfig;
};

/**
 * Star icon component
 */
function StarIcon({ filled, half }: { filled: boolean; half?: boolean }): JSX.Element {
  if (half) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="halfFill">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#halfFill)"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-6 h-6 sm:w-8 sm:h-8"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );
}

/**
 * RatingField component for star-based rating input
 * Supports configurable max stars, half-star precision, and keyboard navigation
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function RatingField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;

  // Parse numeric value
  const currentRating = typeof value === 'number' ? value : 0;

  // Config options with defaults
  const maxRating = config.maxRating ?? 5;
  const allowHalf = config.allowHalf ?? false;
  const step = allowHalf ? 0.5 : 1;

  // Hover state for preview
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  // Display rating (hover preview or actual value)
  const displayRating = hoverRating ?? currentRating;

  // Handle star click
  const handleStarClick = (rating: number) => {
    if (isDisabled) return;

    // Toggle off if clicking current rating
    if (rating === currentRating) {
      setValue(config.key, 0);
    } else {
      setValue(config.key, rating);
    }
    setTouched(config.key, true);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    let newRating = currentRating;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newRating = Math.min(currentRating + step, maxRating);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newRating = Math.max(currentRating - step, 0);
        break;
      case 'Home':
        e.preventDefault();
        newRating = 0;
        break;
      case 'End':
        e.preventDefault();
        newRating = maxRating;
        break;
      default:
        return;
    }

    setValue(config.key, newRating);
    setTouched(config.key, true);
  };

  // Generate stars array
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  return (
    <div className="formkit-rating-field flex flex-col gap-2 mb-4">
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      <div
        id={fieldId}
        role="slider"
        aria-label={config.label}
        aria-valuemin={0}
        aria-valuemax={maxRating}
        aria-valuenow={currentRating}
        aria-valuetext={`${currentRating} out of ${maxRating} stars`}
        aria-invalid={showError}
        aria-describedby={describedBy}
        tabIndex={isDisabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setHoverRating(null)}
        onBlur={() => setTouched(config.key, true)}
        className={`
          formkit-rating-stars
          inline-flex gap-1
          focus:outline-none
          rounded
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {stars.map((starValue) => {
          const filled = displayRating >= starValue;
          const halfFilled =
            allowHalf && displayRating >= starValue - 0.5 && displayRating < starValue;

          return (
            <button
              key={starValue}
              type="button"
              disabled={isDisabled}
              onClick={(e) => {
                // Use hoverRating for half-star precision, otherwise starValue
                let clickRating = starValue;
                if (allowHalf) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const isLeftHalf = e.clientX < rect.left + rect.width / 2;
                  clickRating = isLeftHalf ? starValue - 0.5 : starValue;
                }
                handleStarClick(clickRating);
              }}
              onMouseEnter={() => !isDisabled && setHoverRating(starValue)}
              onMouseMove={(e) => {
                if (isDisabled || !allowHalf) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const isLeftHalf = e.clientX < rect.left + rect.width / 2;
                setHoverRating(isLeftHalf ? starValue - 0.5 : starValue);
              }}
              className={`
                formkit-rating-star
                transition-transform duration-100
                hover:scale-110
                focus:outline-none
                ${filled || halfFilled ? 'text-yellow-400' : 'text-gray-300'}
                ${isDisabled ? '' : 'hover:text-yellow-400'}
              `}
              aria-hidden="true"
              tabIndex={-1}
            >
              <StarIcon filled={filled} half={halfFilled} />
            </button>
          );
        })}
      </div>

      {/* Rating value display */}
      <p className="text-sm text-gray-600">
        {currentRating > 0 ? (
          <>
            <span className="font-medium">{currentRating}</span>
            <span className="text-gray-400"> / {maxRating}</span>
          </>
        ) : (
          <span className="text-gray-400">No rating</span>
        )}
      </p>

      {config.description && !showError && (
        <p id={descId} className="text-xs text-gray-500">
          {config.description}
        </p>
      )}

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as RatingFieldProps };
