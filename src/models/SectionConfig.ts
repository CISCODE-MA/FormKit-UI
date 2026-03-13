/**
 * SectionConfig - Section/group configuration for form layouts
 * Type Layer — contracts only, zero runtime logic
 */

import type { FieldConfig } from './FieldConfig';

/**
 * Responsive column configuration
 * Allows specifying different column counts at different breakpoints
 *
 * @example
 * ```typescript
 * const columns: ResponsiveColumns = {
 *   default: 1,   // Mobile: single column
 *   sm: 2,        // Small screens: 2 columns
 *   lg: 3,        // Large screens: 3 columns
 * };
 * ```
 */
export interface ResponsiveColumns {
  /** Base column count (xs/mobile, always applied) */
  readonly default?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Small screens (≥640px) */
  readonly sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Medium screens (≥768px) */
  readonly md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Large screens (≥1024px) */
  readonly lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Extra large screens (≥1280px) */
  readonly xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

/**
 * Responsive column span configuration for individual fields
 *
 * @example
 * ```typescript
 * const colSpan: ResponsiveColSpan = {
 *   default: 12, // Full width on mobile
 *   md: 6,       // Half width on medium+
 * };
 * ```
 */
export interface ResponsiveColSpan {
  /** Base column span */
  readonly default?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Small screens (≥640px) */
  readonly sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Medium screens (≥768px) */
  readonly md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Large screens (≥1024px) */
  readonly lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Extra large screens (≥1280px) */
  readonly xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

/**
 * Column type - can be a simple number or responsive object
 */
export type ColumnCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | ResponsiveColumns;

/**
 * Column span type - can be a simple number or responsive object
 */
export type ColSpanValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | ResponsiveColSpan;

/**
 * Configuration for a form section that groups related fields
 *
 * Sections provide:
 * - Logical grouping with optional title/description
 * - Independent grid configuration per section
 * - Proper accessibility via fieldset/legend
 *
 * @example
 * ```typescript
 * const section: SectionConfig = {
 *   type: 'section',
 *   title: 'Personal Information',
 *   description: 'Please fill in your details',
 *   columns: { default: 1, md: 2 },
 *   fields: [
 *     { key: 'firstName', label: 'First Name', type: FieldType.TEXT, colSpan: 1 },
 *     { key: 'lastName', label: 'Last Name', type: FieldType.TEXT, colSpan: 1 },
 *     { key: 'email', label: 'Email', type: FieldType.EMAIL, colSpan: { default: 1, md: 2 } },
 *   ],
 * };
 * ```
 */
export interface SectionConfig {
  /** Discriminant for type checking - always 'section' */
  readonly type: 'section';

  /**
   * Optional unique identifier for the section.
   * Used as React key when rendering. If not provided, index is used.
   */
  readonly id?: string;

  /** Section title (rendered as fieldset legend) */
  readonly title?: string;

  /** Section description */
  readonly description?: string;

  /**
   * Grid column configuration for this section.
   * Can be a number (1-12) or responsive config.
   * @default 1
   */
  readonly columns?: ColumnCount;

  /** Gap between fields (Tailwind gap scale) */
  readonly gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8;

  /** Fields within this section */
  readonly fields: FieldConfig[];

  /** Custom CSS class for the section container */
  readonly className?: string;

  /** Whether to render with visible border (default: true when title is present) */
  readonly bordered?: boolean;
}

/**
 * Union type for form layout items.
 * A form can contain either standalone fields or sections of fields.
 */
export type FormLayoutItem = FieldConfig | SectionConfig;

/**
 * Type guard to check if an item is a SectionConfig
 */
export function isSection(item: FormLayoutItem): item is SectionConfig {
  return 'type' in item && item.type === 'section';
}

/**
 * Type guard to check if an item is a FieldConfig (not a section)
 */
export function isField(item: FormLayoutItem): item is FieldConfig {
  return !isSection(item);
}
