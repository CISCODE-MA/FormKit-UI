/**
 * FormSection - Renders a section of grouped fields with its own grid layout
 */

import type { JSX } from 'react';
import type { SectionConfig } from '../../models/SectionConfig';
import { getGridContainerClass, getColSpanClass } from '../../core/grid';
import Field from '../fields/Field';

/**
 * Props for FormSection
 */
type Props = {
  /** Section configuration */
  config: SectionConfig;
};

/**
 * FormSection component for rendering a group of fields with independent layout
 *
 * Features:
 * - Accessible fieldset/legend structure
 * - Independent grid configuration per section
 * - Responsive columns support
 * - Optional title and description
 *
 * @example
 * ```tsx
 * <FormSection config={{
 *   type: 'section',
 *   title: 'Contact Info',
 *   columns: { default: 1, md: 2 },
 *   fields: [...]
 * }} />
 * ```
 */
export default function FormSection({ config }: Readonly<Props>): JSX.Element {
  const { title, description, columns = 1, gap = 4, fields, className = '', bordered } = config;

  // Determine if we should show a border (default true when title present)
  const showBorder = bordered ?? !!title;

  // Build container classes
  const containerClasses = [
    'formkit-form-section',
    showBorder ? 'border border-gray-200 rounded-lg p-4' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Build grid classes
  const gridClasses = getGridContainerClass(columns, gap);

  return (
    <fieldset className={containerClasses}>
      {title && (
        <legend className="formkit-section-title text-base font-semibold text-gray-900 px-2 -ml-2">
          {title}
        </legend>
      )}

      {description && (
        <p className="formkit-section-description text-sm text-gray-500 mb-4">{description}</p>
      )}

      <div className={gridClasses}>
        {fields.map((field) => {
          // Generate colSpan class for this field
          const colSpanClass = getColSpanClass(field.colSpan);

          return (
            <div key={field.key} className={colSpanClass}>
              <Field config={field} />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export type { Props as FormSectionProps };
