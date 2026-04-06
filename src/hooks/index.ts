/**
 * Hooks module - all form state and logic hooks
 * Following CHM architecture: Hooks handle state and side effects
 */

// Master form state hook
export { useFormKit, type UseFormKitOptions, type UseFormKitReturn } from './useFormKit';

// Context access hook
export { useFormContext } from './useFormContext';

// Field array management
export {
  useFieldArray,
  type UseFieldArrayOptions,
  type UseFieldArrayReturn,
} from './useFieldArray';

// Multi-step form navigation
export { useFormStep, type UseFormStepOptions, type UseFormStepReturn } from './useFormStep';

// Async validation with AbortController
export {
  useAsyncValidation,
  type UseAsyncValidationOptions,
  type UseAsyncValidationReturn,
  type AsyncValidatorFn,
} from './useAsyncValidation';

// Internationalization hook
export { useI18n, type I18nContextValue } from './useI18n';
