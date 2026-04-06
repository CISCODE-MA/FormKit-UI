/**
 * Grid utilities for form layout
 * Pure functions for generating grid CSS classes
 */

import type {
  ColumnCount,
  ColSpanValue,
  ResponsiveColumns,
  ResponsiveColSpan,
} from '../models/SectionConfig';

/**
 * Breakpoint prefixes for Tailwind CSS
 */
type Breakpoint = 'default' | 'sm' | 'md' | 'lg' | 'xl';
const BREAKPOINTS: Breakpoint[] = ['default', 'sm', 'md', 'lg', 'xl'];

type ResponsiveValueMap = Partial<Record<Breakpoint, number>>;

function buildResponsiveClasses(
  values: ResponsiveValueMap,
  basePrefix: string,
  fallbackDefault?: number,
): string {
  const classes: string[] = [];
  let hasDefault = false;

  for (const bp of BREAKPOINTS) {
    const value = values[bp];
    if (value !== undefined) {
      if (bp === 'default') {
        classes.push(`${basePrefix}-${value}`);
        hasDefault = true;
      } else {
        classes.push(`${bp}:${basePrefix}-${value}`);
      }
    }
  }

  if (!hasDefault && fallbackDefault !== undefined) {
    classes.unshift(`${basePrefix}-${fallbackDefault}`);
  }

  return classes.join(' ');
}

/**
 * Check if columns config is responsive (object vs number)
 */
function isResponsiveColumns(columns: ColumnCount): columns is ResponsiveColumns {
  return typeof columns === 'object' && columns !== null;
}

/**
 * Check if colSpan config is responsive (object vs number)
 */
function isResponsiveColSpan(colSpan: ColSpanValue): colSpan is ResponsiveColSpan {
  return typeof colSpan === 'object' && colSpan !== null;
}

/**
 * Generate grid template columns class for a given column count
 *
 * @param columns - Number of columns (1-12) or responsive config
 * @returns Tailwind CSS class string
 *
 * @example
 * getGridColumnsClass(3) // 'grid-cols-3'
 * getGridColumnsClass({ default: 1, md: 2, lg: 3 }) // 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
 */
export function getGridColumnsClass(columns: ColumnCount = 1): string {
  if (!isResponsiveColumns(columns)) {
    return `grid-cols-${columns}`;
  }

  return buildResponsiveClasses(columns, 'grid-cols');
}

/**
 * Generate column span class for a field
 *
 * @param colSpan - Column span (1-12) or responsive config
 * @param defaultSpan - Default span if colSpan is not provided
 * @returns Tailwind CSS class string
 *
 * @example
 * getColSpanClass(6) // 'col-span-6'
 * getColSpanClass({ default: 12, md: 6 }) // 'col-span-12 md:col-span-6'
 */
export function getColSpanClass(colSpan?: ColSpanValue, defaultSpan: number = 1): string {
  if (colSpan === undefined) {
    return `col-span-${defaultSpan}`;
  }

  if (!isResponsiveColSpan(colSpan)) {
    return `col-span-${colSpan}`;
  }

  return buildResponsiveClasses(colSpan, 'col-span', defaultSpan);
}

/**
 * Generate gap class
 *
 * @param gap - Gap size (Tailwind scale: 1-8)
 * @returns Tailwind CSS class string
 */
export function getGapClass(gap: number = 4): string {
  return `gap-${gap}`;
}

/**
 * Combine grid container classes
 *
 * @param columns - Column count or responsive config
 * @param gap - Gap size
 * @returns Combined class string
 */
export function getGridContainerClass(columns: ColumnCount = 1, gap: number = 4): string {
  return `grid ${getGridColumnsClass(columns)} ${getGapClass(gap)}`;
}

/**
 * Normalize column count to ensure it's valid
 */
export function normalizeColumnCount(
  columns: ColumnCount | undefined,
  fallback: number = 1,
): number {
  if (columns === undefined) return fallback;
  if (typeof columns === 'number') return columns;
  return columns.default ?? fallback;
}
