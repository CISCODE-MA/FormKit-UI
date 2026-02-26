/**
 * ErrorMessage component for displaying error messages
 */

import type { ErrorSeverity } from '../errors/types';

/**
 * Props for ErrorMessage component
 */
export interface ErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Error code */
  code?: string;
  /** Whether to show the error code */
  showCode?: boolean;
  /** Unique ID for the error (for aria-describedby) */
  id?: string;
  /** Custom CSS class */
  className?: string;
  /** Callback when error is dismissed (if dismissible) */
  onDismiss?: () => void;
  /** Whether the error can be dismissed */
  dismissible?: boolean;
}

/**
 * ErrorMessage component for displaying formatted error messages
 */
export const ErrorMessage = ({
  message,
  severity = 'error',
  code,
  showCode = false,
  id,
  className = '',
  onDismiss,
  dismissible = false,
}: ErrorMessageProps) => {
  const severityClass = `formkit-error-${severity}`;
  const displayMessage = showCode && code ? `[${code}] ${message}` : message;

  return (
    <div
      id={id}
      role="alert"
      className={`formkit-error ${severityClass} ${className} ${dismissible ? 'formkit-error-dismissible' : ''}`}
    >
      <span className="formkit-error-message">{displayMessage}</span>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="formkit-error-dismiss"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
};

ErrorMessage.displayName = 'ErrorMessage';
