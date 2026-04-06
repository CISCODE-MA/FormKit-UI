/**
 * FormKitContext - React context for form state propagation
 * This file lives in hooks/ to maintain proper layer separation.
 * Components import from here, ensuring hooks don't import from components.
 */

import { createContext, useContext } from 'react';
import type { FormContextValue } from '../models/FormState';
import type { FormValues } from '../core/types';

/**
 * Form context for internal use
 * Used by FormKitProvider in components/context/ and hooks that need form state
 */
export const FormKitContext = createContext<FormContextValue | null>(null);

FormKitContext.displayName = 'FormKitContext';

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
