/**
 * FormActions - Submit and Reset buttons with loading state
 */

import type { JSX } from 'react';

/**
 * Props for FormActions
 */
type Props = {
  /** Submit button label */
  submitLabel?: string;
  /** Reset button label (omit to hide) */
  resetLabel?: string;
  /** Previous step button label (wizard mode) */
  prevLabel?: string;
  /** Whether form is currently submitting */
  isSubmitting?: boolean;
  /** Reset button click handler */
  onReset?: () => void;
  /** Previous button click handler (wizard mode) */
  onPrev?: () => void;
  /** Custom CSS class */
  className?: string;
};

/**
 * FormActions component for form submit/reset buttons
 * Handles loading state and wizard navigation
 */
export default function FormActions({
  submitLabel = 'Submit',
  resetLabel,
  prevLabel,
  isSubmitting = false,
  onReset,
  onPrev,
  className = '',
}: Props): JSX.Element {
  return (
    <div className={`formkit-form-actions flex gap-3 mt-6 ${className}`.trim()}>
      {/* Previous button (wizard mode) */}
      {prevLabel && onPrev && (
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          className={`
            formkit-btn-prev
            px-4 py-2 text-sm font-medium
            border border-gray-300 rounded-md
            text-gray-700 bg-white
            hover:bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {prevLabel}
        </button>
      )}

      {/* Spacer to push submit to the right when prev exists */}
      {prevLabel && onPrev && <div className="flex-1" />}

      {/* Reset button */}
      {resetLabel && onReset && (
        <button
          type="button"
          onClick={onReset}
          disabled={isSubmitting}
          className={`
            formkit-btn-reset
            px-4 py-2 text-sm font-medium
            border border-gray-300 rounded-md
            text-gray-700 bg-white
            hover:bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {resetLabel}
        </button>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          formkit-btn-submit
          px-4 py-2 text-sm font-medium
          border border-transparent rounded-md
          text-white bg-blue-600
          hover:bg-blue-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Submitting...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}

export type { Props as FormActionsProps };
