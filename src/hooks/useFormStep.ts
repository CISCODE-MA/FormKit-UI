/**
 * useFormStep - Multi-step form navigation
 */

import { useState, useCallback } from 'react';
import type { StepConfig } from '../models/StepConfig';
import type { FormValues } from '../core/types';
import type { FieldErrors } from '../core/validator';
import { mapZodErrors } from '../core/validator';

/**
 * Options for useFormStep hook
 */
export interface UseFormStepOptions {
  /** Step configurations */
  steps: StepConfig[];
  /** Current form values (for validation) */
  values: FormValues;
  /** Callback when step changes */
  onStepChange?: (step: number) => void;
}

/**
 * Return type for useFormStep hook
 */
export interface UseFormStepReturn {
  /** Current step index (0-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Current step configuration */
  currentStepConfig: StepConfig | undefined;
  /** Whether on first step */
  isFirstStep: boolean;
  /** Whether on last step */
  isLastStep: boolean;
  /** Progress percentage (0-100) */
  progress: number;

  /** Go to next step (validates current step first) */
  next: () => Promise<boolean>;
  /** Go to previous step */
  prev: () => void;
  /** Go to specific step (validates if moving forward) */
  goTo: (step: number) => Promise<boolean>;
  /** Reset to first step */
  reset: () => void;

  /** Validation errors for current step */
  stepErrors: FieldErrors;
}

/**
 * Hook for managing multi-step form navigation
 * Used internally by DynamicForm in wizard mode
 *
 * @param options - Step configuration options
 * @returns Step navigation state and methods
 *
 * @example
 * ```tsx
 * const { currentStep, next, prev, isLastStep } = useFormStep({
 *   steps,
 *   values: formValues,
 * });
 * ```
 */
export function useFormStep(options: UseFormStepOptions): UseFormStepReturn {
  const { steps, values, onStepChange } = options;

  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<FieldErrors>({});

  const totalSteps = steps.length;
  const currentStepConfig = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  // Validate current step
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const stepConfig = steps[currentStep];
    if (!stepConfig?.schema) {
      setStepErrors({});
      return true;
    }

    const result = stepConfig.schema.safeParse(values);
    if (result.success) {
      setStepErrors({});
      return true;
    }

    setStepErrors(mapZodErrors(result.error));
    return false;
  }, [currentStep, steps, values]);

  // Go to next step
  const next = useCallback(async (): Promise<boolean> => {
    if (isLastStep) return false;

    const isValid = await validateCurrentStep();
    if (!isValid) return false;

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    onStepChange?.(nextStep);
    return true;
  }, [isLastStep, validateCurrentStep, currentStep, onStepChange]);

  // Go to previous step
  const prev = useCallback(() => {
    if (isFirstStep) return;

    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    setStepErrors({});
    onStepChange?.(prevStep);
  }, [isFirstStep, currentStep, onStepChange]);

  // Go to specific step
  const goTo = useCallback(
    async (step: number): Promise<boolean> => {
      if (step < 0 || step >= totalSteps) return false;

      // If moving forward, validate current step
      if (step > currentStep) {
        const isValid = await validateCurrentStep();
        if (!isValid) return false;
      }

      setCurrentStep(step);
      setStepErrors({});
      onStepChange?.(step);
      return true;
    },
    [totalSteps, currentStep, validateCurrentStep, onStepChange],
  );

  // Reset to first step
  const reset = useCallback(() => {
    setCurrentStep(0);
    setStepErrors({});
    onStepChange?.(0);
  }, [onStepChange]);

  return {
    currentStep,
    totalSteps,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    progress,
    next,
    prev,
    goTo,
    reset,
    stepErrors,
  };
}
