/**
 * FormStepper - Step indicator / progress bar for wizard mode
 * Internal component used by DynamicForm
 */

import type { JSX } from 'react';
import type { StepConfig } from '../../models/StepConfig';
import { useI18n } from '../../hooks/useI18n';

/**
 * Props for FormStepper
 */
type Props = {
  /** All step configurations */
  steps: StepConfig[];
  /** Current active step index (0-based) */
  currentStep: number;
  /** Optional click handler for step navigation */
  onStepClick?: (stepIndex: number) => void;
};

type StepState = {
  isActive: boolean;
  isCompleted: boolean;
  isClickable: boolean;
};

function getStepState(
  index: number,
  currentStep: number,
  onStepClick?: (stepIndex: number) => void,
): StepState {
  const isActive = index === currentStep;
  const isCompleted = index < currentStep;
  return {
    isActive,
    isCompleted,
    isClickable: Boolean(onStepClick) && isCompleted,
  };
}

function getStepItemClassName(state: StepState): string {
  return [
    'formkit-stepper-step flex items-center gap-2',
    state.isActive ? 'formkit-stepper-step-active text-blue-600' : '',
    state.isCompleted ? 'formkit-stepper-step-completed text-green-600' : '',
    !state.isActive && !state.isCompleted ? 'text-gray-400' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function getStepNumberClassName(state: StepState): string {
  return [
    'formkit-stepper-number flex items-center justify-center w-8 h-8 rounded-full border-2',
    state.isActive ? 'border-blue-600 bg-blue-600 text-white' : '',
    state.isCompleted ? 'border-green-600 bg-green-600 text-white' : '',
    !state.isActive && !state.isCompleted ? 'border-gray-300 bg-white text-gray-400' : '',
    state.isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
  ]
    .filter(Boolean)
    .join(' ');
}

function getStepTitleClassName(state: StepState): string {
  return [
    'formkit-stepper-title text-sm font-medium',
    state.isActive ? 'text-blue-600' : '',
    state.isCompleted ? 'text-green-600' : '',
    !state.isActive && !state.isCompleted ? 'text-gray-500' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function getStepAriaLabel(
  index: number,
  title: string,
  state: StepState,
  t: (key: string) => string,
): string {
  const stateSuffix = [
    state.isCompleted ? `(${t('a11y.stepCompleted')})` : '',
    state.isActive ? `(${t('a11y.stepCurrent')})` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `${t('a11y.stepNumber')} ${index + 1}: ${title}${stateSuffix ? ` ${stateSuffix}` : ''}`;
}

/**
 * Displays step progress indicator for multi-step forms
 * Supports accessible navigation with aria attributes
 *
 * @internal
 */
export default function FormStepper({
  steps,
  currentStep,
  onStepClick,
}: Readonly<Props>): JSX.Element {
  const { t } = useI18n();

  return (
    <nav className="formkit-stepper" aria-label={t('a11y.formSteps')}>
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const state = getStepState(index, currentStep, onStepClick);

          return (
            <li key={step.title} className={getStepItemClassName(state)}>
              {/* Step number/icon */}
              <button
                type="button"
                className={getStepNumberClassName(state)}
                onClick={() => state.isClickable && onStepClick?.(index)}
                disabled={!state.isClickable}
                aria-current={state.isActive ? 'step' : undefined}
                aria-label={getStepAriaLabel(index, step.title, state, t)}
              >
                {state.isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Step title */}
              <span className={getStepTitleClassName(state)}>{step.title}</span>

              {/* Connector line (not on last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    formkit-stepper-connector
                    flex-1 h-0.5 mx-2
                    ${state.isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type { Props as FormStepperProps };
