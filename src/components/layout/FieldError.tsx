/**
 * FieldError - Standardized error message display
 */

import type { JSX } from 'react';

/**
 * Props for FieldError
 */
type Props = {
  /** Error element ID (for aria-describedby) */
  id: string;
  /** Error message to display */
  message: string | null;
  /** Custom CSS class */
  className?: string;
};

/**
 * FieldError component for displaying field validation errors
 * Uses role="alert" for live announcement to screen readers
 */
export default function FieldError({ id, message, className = '' }: Props): JSX.Element | null {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className={`formkit-field-error text-sm text-red-600 ${className}`.trim()}
    >
      {message}
    </p>
  );
}

export type { Props as FieldErrorProps };
