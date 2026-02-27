/**
 * Form Context for sharing form state with child components
 */

import { createContext, useContext } from 'react';
import type { UseFormReturn, FormValues } from '../hooks/useForm';

/**
 * Form context value type
 */
export type FormContextValue<T extends FormValues = FormValues> = UseFormReturn<T> | null;

/**
 * Form context for sharing form state with child fields
 */
export const FormContext = createContext<FormContextValue>(null);

/**
 * Hook to access form context
 * @returns Form context value or null if not within a Form
 */
export function useFormContext<T extends FormValues = FormValues>(): UseFormReturn<T> | null {
  return useContext(FormContext) as UseFormReturn<T> | null;
}

/**
 * Hook to access form context (throws if not within a Form)
 * @returns Form context value
 * @throws Error if not within a Form component
 */
export function useFormContextStrict<T extends FormValues = FormValues>(): UseFormReturn<T> {
  const context = useFormContext<T>();
  if (!context) {
    throw new Error('useFormContextStrict must be used within a Form component');
  }
  return context;
}
