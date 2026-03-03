/**
 * ValidationRule - Async validator type definitions
 * Type Layer — contracts only, zero runtime logic
 */

/**
 * Async validation function that checks a field value
 *
 * @param value - The field value to validate
 * @param ctx - Context with AbortController signal for cancellation
 * @returns Error message string if invalid, null if valid
 *
 * @example
 * ```typescript
 * const checkEmailExists: AsyncValidationRule<string> = async (value, { signal }) => {
 *   const response = await fetch(`/api/check-email?email=${value}`, { signal });
 *   const { exists } = await response.json();
 *   return exists ? 'This email is already registered' : null;
 * };
 * ```
 */
export type AsyncValidationRule<TValue = unknown> = (
  value: TValue,
  ctx: { signal: AbortSignal },
) => Promise<string | null>;

/**
 * Sync validation function
 */
export type SyncValidationRule<TValue = unknown> = (value: TValue) => string | null;

/**
 * Combined validation rule (can be sync or async)
 */
export type ValidationRule<TValue = unknown> =
  | SyncValidationRule<TValue>
  | AsyncValidationRule<TValue>;
