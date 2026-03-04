/**
 * FormKitContext - React context for form state propagation
 * Internal only — not exported from public API
 *
 * Context and hook are in hooks/FormKitContext.ts to maintain layer separation.
 * This file provides the Provider component that uses that context.
 */

import type { ReactNode, JSX } from 'react';
import { FormKitContext, useFormKitContext } from '../../hooks/FormKitContext';
import type { FormContextValue } from '../../models/FormState';
import type { FormValues } from '../../core/types';

// Re-export for backward compatibility with components that import from here
export { FormKitContext, useFormKitContext };

/**
 * Props for FormKitProvider
 */
type FormKitProviderProps<TValues extends FormValues = FormValues> = {
  /** Form context value from useFormKit */
  value: FormContextValue<TValues>;
  /** Child components */
  children: ReactNode;
};

/**
 * Provider component for form context
 * Wraps DynamicForm children to provide access to form state
 *
 * @internal
 */
export default function FormKitProvider<TValues extends FormValues = FormValues>({
  value,
  children,
}: FormKitProviderProps<TValues>): JSX.Element {
  return (
    <FormKitContext.Provider value={value as FormContextValue}>{children}</FormKitContext.Provider>
  );
}
