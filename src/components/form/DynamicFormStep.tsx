/**
 * DynamicFormStep - Renders a single step's fields (wizard mode)
 * Internal component used by DynamicForm
 */

import type { JSX } from 'react';
import type { StepConfig } from '../../models/StepConfig';
import { Field } from '../fields/Field';

/**
 * Props for DynamicFormStep
 */
type Props = {
  /** Step configuration */
  step: StepConfig;
  /** Whether this step is currently active */
  isActive: boolean;
};

/**
 * Renders the fields for a single form step
 * Hidden when not active to preserve field state
 *
 * @internal
 */
export function DynamicFormStep({ step, isActive }: Props): JSX.Element {
  return (
    <div
      className={`formkit-form-step ${isActive ? 'formkit-form-step-active' : 'formkit-form-step-hidden'}`}
      role="tabpanel"
      aria-hidden={!isActive}
      style={{ display: isActive ? 'block' : 'none' }}
    >
      {step.description && (
        <p className="formkit-step-description text-sm text-gray-600 mb-4">{step.description}</p>
      )}
      <div className="flex flex-col gap-4">
        {step.fields.map((field) => (
          <Field key={field.key} config={field} />
        ))}
      </div>
    </div>
  );
}

export type { Props as DynamicFormStepProps };
