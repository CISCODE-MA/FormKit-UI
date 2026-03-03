/**
 * useFormContext - Access form state from deep in the component tree
 * Re-exports useFormKitContext for public API
 */

import { useFormKitContext } from '../components/context/FormKitContext';
import type { FormContextValue } from '../models/FormState';
import type { FormValues } from '../core/types';

/**
 * Hook to access form context from any component inside DynamicForm
 * Throws if used outside of DynamicForm
 *
 * @returns Form context value with getValue, setValue, getError, etc.
 *
 * @example
 * ```tsx
 * function CustomField() {
 *   const { getValue, setValue, getError } = useFormContext();
 *   const value = getValue('email');
 *   // ...
 * }
 * ```
 */
export function useFormContext<
  TValues extends FormValues = FormValues,
>(): FormContextValue<TValues> {
  return useFormKitContext<TValues>();
}
