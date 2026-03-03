/**
 * FieldGroup - Visual grouping for related fields
 */

import type { JSX, ReactNode } from 'react';

/**
 * Props for FieldGroup
 */
type Props = {
  /** Group title/legend */
  title?: string;
  /** Group description */
  description?: string;
  /** Child fields */
  children: ReactNode;
  /** Custom CSS class */
  className?: string;
};

/**
 * FieldGroup component for visually grouping related fields
 * Uses fieldset/legend for proper accessibility
 */
export function FieldGroup({ title, description, children, className = '' }: Props): JSX.Element {
  return (
    <fieldset
      className={`formkit-field-group border border-gray-200 rounded-lg p-4 ${className}`.trim()}
    >
      {title && (
        <legend className="formkit-field-group-title text-sm font-semibold text-gray-900 px-2">
          {title}
        </legend>
      )}
      {description && (
        <p className="formkit-field-group-description text-sm text-gray-500 mb-4">{description}</p>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

export type { Props as FieldGroupProps };
