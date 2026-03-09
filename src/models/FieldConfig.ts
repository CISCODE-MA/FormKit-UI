/**
 * FieldConfig - Per-field configuration for DynamicForm
 * Type Layer — contracts only, zero runtime logic
 */

import type { FieldType, ConditionalRule, FieldValue } from '../core/types';

/**
 * Option for select, radio, or multi-select fields
 */
export interface FieldOption {
  /** Option value */
  readonly value: string | number;
  /** Option display label */
  readonly label: string;
  /** Whether option is disabled */
  readonly disabled?: boolean;
}

/**
 * Async validator function signature
 */
export type AsyncValidator<TValue = unknown> = (
  value: TValue,
  ctx: { signal: AbortSignal },
) => Promise<string | null>;

/**
 * Per-field configuration for DynamicForm
 *
 * @example
 * ```typescript
 * const field: FieldConfig = {
 *   key: 'email',
 *   label: 'Email Address',
 *   type: FieldType.EMAIL,
 *   required: true,
 *   placeholder: 'you@example.com',
 * };
 * ```
 */
export interface FieldConfig<TValue = unknown> {
  // ── Identity ──────────────────────────────────────────────────
  /** Unique field key (must match a key in the Zod schema) */
  readonly key: string;
  /** Field label displayed to user */
  readonly label: string;
  /** Field type determines which component renders */
  readonly type: FieldType;

  // ── Content ───────────────────────────────────────────────────
  /** Placeholder text */
  readonly placeholder?: string;
  /** Helper text shown below the field */
  readonly description?: string;
  /** Options for select, multi-select, or radio fields */
  readonly options?: FieldOption[];

  // ── State ─────────────────────────────────────────────────────
  /** Visual required indicator (asterisk) — Zod schema is the real validation gate */
  readonly required?: boolean;
  /** Whether field is disabled (can be static or computed from form values) */
  readonly disabled?: boolean | ((values: Record<string, FieldValue>) => boolean);
  /** Whether field is read-only */
  readonly readOnly?: boolean;

  // ── Async validation ──────────────────────────────────────────
  /** Async validator function (e.g., check email availability) */
  readonly asyncValidate?: AsyncValidator<TValue>;
  /** Debounce delay for async validation in ms (default: 300) */
  readonly asyncDebounceMs?: number;

  // ── Conditional visibility ────────────────────────────────────
  /** Rule that must be true for field to show */
  readonly showWhen?: ConditionalRule;
  /** Rule that when true hides the field */
  readonly hideWhen?: ConditionalRule;

  // ── Array field (only when type === FieldType.ARRAY) ──────────
  /** Field configs for each item in the array */
  readonly arrayFields?: FieldConfig[];
  /** Label for add button (default: 'Add') */
  readonly addLabel?: string;
  /** Label for remove button (default: 'Remove') */
  readonly removeLabel?: string;
  /** Minimum number of rows */
  readonly minRows?: number;
  /** Maximum number of rows */
  readonly maxRows?: number;

  // ── File field (only when type === FieldType.FILE) ────────────
  /** Accepted file types (MIME types or extensions, e.g., 'image/*', '.pdf', 'application/json') */
  readonly accept?: string;
  /** Maximum file size in bytes */
  readonly maxFileSize?: number;
  /** Allow multiple file selection */
  readonly multiple?: boolean;

  // ── Slider field (only when type === FieldType.SLIDER) ────────
  /** Minimum value (default: 0) */
  readonly min?: number;
  /** Maximum value (default: 100) */
  readonly max?: number;
  /** Step increment (default: 1) */
  readonly step?: number;
  /** Show current value badge (default: true) */
  readonly showValue?: boolean;

  // ── OTP field (only when type === FieldType.OTP) ──────────────
  /** Number of OTP digits (default: 6) */
  readonly otpLength?: 4 | 5 | 6 | 7 | 8;

  // ── Tags field (only when type === FieldType.TAGS) ────────────
  /** Maximum number of tags allowed */
  readonly maxTags?: number;
  /** Minimum number of tags required */
  readonly minTags?: number;
  /** Allow duplicate tags (default: false) */
  readonly allowDuplicates?: boolean;

  // ── Rating field (only when type === FieldType.RATING) ────────
  /** Maximum rating value (default: 5) */
  readonly maxRating?: number;
  /** Allow half-star ratings (default: false) */
  readonly allowHalf?: boolean;

  // ── Time field (only when type === FieldType.TIME) ────────────
  /** Time step in seconds (default: 60) */
  readonly timeStep?: number;

  // ── Layout ────────────────────────────────────────────────────
  /** Column span in grid layout */
  readonly colSpan?: 1 | 2 | 3 | 4;
  /** Custom CSS class */
  readonly className?: string;
}
