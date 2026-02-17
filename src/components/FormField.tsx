/**
 * FormField wrapper component for consistent field layout
 */

import { ReactNode } from 'react';

/**
 * Props for FormField component
 */
export interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Whether field is required */
  required?: boolean;
  /** Hint or help text */
  hint?: string;
  /** Error message to display */
  error?: string | null;
  /** Whether to show the error */
  showError?: boolean;
  /** Unique ID for the field (for aria-describedby) */
  fieldId?: string;
  /** Custom CSS class for container */
  className?: string;
  /** Custom CSS class for label */
  labelClassName?: string;
  /** Custom CSS class for hint */
  hintClassName?: string;
  /** Custom CSS class for error */
  errorClassName?: string;
  /** The form field element(s) to wrap */
  children: ReactNode;
}

/**
 * FormField wrapper component that provides consistent layout
 * for labels, hints, errors, and form controls
 */
export const FormField = ({
  label,
  required = false,
  hint,
  error,
  showError = true,
  fieldId,
  className = '',
  labelClassName = '',
  hintClassName = '',
  errorClassName = '',
  children,
}: FormFieldProps) => {
  const hasError = showError && error !== null && error !== undefined && error !== '';
  const showHint = hint && !hasError;
  const hintId = fieldId && hint ? `${fieldId}-hint` : undefined;
  const errorId = fieldId && error ? `${fieldId}-error` : undefined;

  return (
    <div className={`formkit-field ${className} ${hasError ? 'formkit-field-error' : ''}`}>
      {label && (
        <label htmlFor={fieldId} className={`formkit-field-label ${labelClassName}`}>
          {label}
          {required && <span className="formkit-field-required"> *</span>}
        </label>
      )}
      <div className="formkit-field-control">{children}</div>
      {showHint && (
        <div id={hintId} className={`formkit-field-hint ${hintClassName}`}>
          {hint}
        </div>
      )}
      {hasError && (
        <div id={errorId} className={`formkit-field-error-message ${errorClassName}`} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

FormField.displayName = 'FormField';
