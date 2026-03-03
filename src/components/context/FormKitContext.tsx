/**
 * FormKitContext - React context for form state propagation
 * Internal only — not exported from public API
 */

import { createContext, useContext, type ReactNode, type JSX } from 'react';
import type { FormContextValue } from '../../models/FormState';
import type { FormValues } from '../../core/types';

/**
 * Form context (internal use only)
 */
export const FormKitContext = createContext<FormContextValue | null>(null);

FormKitContext.displayName = 'FormKitContext';

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
export function FormKitProvider<TValues extends FormValues = FormValues>({
  value,
  children,
}: FormKitProviderProps<TValues>): JSX.Element {
  return (
    <FormKitContext.Provider value={value as FormContextValue}>{children}</FormKitContext.Provider>
  );
}

/**
 * Hook to access form context from deep in the component tree
 * Throws if used outside of FormKitProvider (i.e., outside DynamicForm)
 *
 * @returns Form context value
 * @throws Error if used outside FormKitProvider
 *
 * @example
 * ```tsx
 * function CustomField() {
 *   const { getValue, setValue, getError } = useFormKitContext();
 *   // ...
 * }
 * ```
 */
export function useFormKitContext<
  TValues extends FormValues = FormValues,
>(): FormContextValue<TValues> {
  const context = useContext(FormKitContext);

  if (!context) {
    throw new Error(
      'useFormKitContext must be used within a DynamicForm. ' +
        'Make sure your component is rendered inside <DynamicForm>.',
    );
  }

  return context as FormContextValue<TValues>;
}
