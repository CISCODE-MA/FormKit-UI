/**
 * FormStepper - Step indicator / progress bar for wizard mode
 * Internal component used by DynamicForm
 */

import type { JSX } from 'react';
import type { StepConfig } from '../../models/StepConfig';

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

/**
 * Displays step progress indicator for multi-step forms
 * Supports accessible navigation with aria attributes
 *
 * @internal
 */
export default function FormStepper({ steps, currentStep, onStepClick }: Props): JSX.Element {
  return (
    <nav className="formkit-stepper" aria-label="Form progress">
      <ol className="flex items-center gap-2" role="list">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = !!onStepClick && isCompleted;

          return (
            <li
              key={step.title}
              className={`
                formkit-stepper-step
                flex items-center gap-2
                ${isActive ? 'formkit-stepper-step-active text-blue-600' : ''}
                ${isCompleted ? 'formkit-stepper-step-completed text-green-600' : ''}
                ${!isActive && !isCompleted ? 'text-gray-400' : ''}
              `}
            >
              {/* Step number/icon */}
              <button
                type="button"
                className={`
                  formkit-stepper-number
                  flex items-center justify-center
                  w-8 h-8 rounded-full border-2
                  ${isActive ? 'border-blue-600 bg-blue-600 text-white' : ''}
                  ${isCompleted ? 'border-green-600 bg-green-600 text-white' : ''}
                  ${!isActive && !isCompleted ? 'border-gray-300 bg-white text-gray-400' : ''}
                  ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                `}
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step.title}${isCompleted ? ' (completed)' : ''}${isActive ? ' (current)' : ''}`}
              >
                {isCompleted ? (
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
              <span
                className={`
                  formkit-stepper-title
                  text-sm font-medium
                  ${isActive ? 'text-blue-600' : ''}
                  ${isCompleted ? 'text-green-600' : ''}
                  ${!isActive && !isCompleted ? 'text-gray-500' : ''}
                `}
              >
                {step.title}
              </span>

              {/* Connector line (not on last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    formkit-stepper-connector
                    flex-1 h-0.5 mx-2
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
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
