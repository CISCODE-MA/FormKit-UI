/**
 * FieldLabel - Standardized field label component
 */

import type { JSX } from 'react';

/**
 * Props for FieldLabel
 */
type Props = {
  /** The label text */
  label: string;
  /** HTML for attribute (links to field id) */
  htmlFor?: string;
  /** Whether the field is required (shows asterisk) */
  required?: boolean;
  /** Render as different element (default: label) */
  as?: 'label' | 'legend';
  /** Custom CSS class */
  className?: string;
};

/**
 * FieldLabel component for form field labels
 * Shows required indicator (asterisk) when needed
 */
export function FieldLabel({
  label,
  htmlFor,
  required,
  as = 'label',
  className = '',
}: Props): JSX.Element {
  const classes = `formkit-field-label text-sm font-medium text-gray-700 ${className}`.trim();

  if (as === 'legend') {
    return (
      <legend className={classes}>
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </legend>
    );
  }

  return (
    <label htmlFor={htmlFor} className={classes}>
      {label}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
}

export type { Props as FieldLabelProps };
