/**
 * DynamicForm - THE primary public component
 * Auto-generates accessible, validated forms from Zod schema + field config
 */

import { type JSX, type FormEvent, useState, useCallback, useMemo } from 'react';
import type { z } from 'zod';
import type { FieldConfig } from '../../models/FieldConfig';
import type { StepConfig } from '../../models/StepConfig';
import type { FormValues, ValidationMode, FieldValue } from '../../core/types';
import type { Locale, TranslationKeys } from '../../core/i18n';
import type { FieldErrors } from '../../core/validator';
import FormKitProvider from '../context/FormKitContext';
import I18nProvider from '../context/I18nContext';
import { useI18n } from '../../hooks/useI18n';
import Field from '../fields/Field';
import FormActions from '../layout/FormActions';

/**
 * Props for DynamicForm component
 *
 * @example — Single page form
 * ```tsx
 * <DynamicForm
 *   schema={z.object({ name: z.string().min(2) })}
 *   fields={[{ key: 'name', label: 'Name', type: FieldType.TEXT }]}
 *   defaultValues={{ name: '' }}
 *   onSubmit={async (values) => saveUser(values)}
 * />
 * ```
 *
 * @example — Multi-step wizard
 * ```tsx
 * <DynamicForm steps={steps} defaultValues={defaults} onSubmit={handleSubmit} />
 * ```
 */
export interface DynamicFormProps<TValues extends FormValues = FormValues> {
  // ── Core ────────────────────────────────────────────────────
  /** Zod schema for single-page mode (omit when using `steps`) */
  schema?: z.ZodType<TValues>;
  /** Field configuration array for single-page mode (omit when using `steps`) */
  fields?: FieldConfig[];
  /** Step configuration array for wizard mode (replaces `schema` + `fields`) */
  steps?: StepConfig[];
  /** Initial field values */
  defaultValues: Partial<TValues>;

  // ── Callbacks ───────────────────────────────────────────────
  /** Called with validated values on successful submission */
  onSubmit: (values: TValues) => Promise<void> | void;
  /** Called when validation fails */
  onError?: (errors: FieldErrors<TValues>) => void;
  /** Called when any field value changes */
  onChange?: (values: Partial<TValues>) => void;

  // ── Behavior ────────────────────────────────────────────────
  /** Validation trigger mode (default: 'onBlur') */
  mode?: ValidationMode;
  /** Reset form after successful submit (default: false) */
  resetOnSubmit?: boolean;

  // ── Labels ──────────────────────────────────────────────────
  /** Submit button label (default: 'Submit') */
  submitLabel?: string;
  /** Reset button label (omit to hide reset button) */
  resetLabel?: string;
  /** Next button label for wizard mode (default: 'Next') */
  nextLabel?: string;
  /** Back button label for wizard mode (default: 'Back') */
  prevLabel?: string;

  // ── Layout ──────────────────────────────────────────────────
  /** Show step indicator in wizard mode (default: true) */
  showStepper?: boolean;
  /** Grid columns for field layout (default: 1) */
  columns?: 1 | 2 | 3 | 4;
  /** Custom CSS class */
  className?: string;

  // ── Internationalization ────────────────────────────────────
  /** Locale for translations (default: 'en') */
  locale?: Locale;
  /** Custom translations to override defaults */
  customTranslations?: Partial<TranslationKeys>;
}

/**
 * DynamicForm - Auto-generates a fully accessible, validated form from a Zod schema and field config.
 * Supports single-page forms and multi-step wizards via the `steps` prop.
 *
 * This is the ONLY public form component. All form rendering goes through DynamicForm.
 */
export default function DynamicForm<TValues extends FormValues = FormValues>({
  schema,
  fields,
  steps,
  defaultValues,
  onSubmit,
  onError,
  onChange,
  // mode is accepted but not yet implemented
  resetOnSubmit = false,
  submitLabel,
  resetLabel,
  nextLabel,
  prevLabel,
  showStepper = true,
  columns = 1,
  className = '',
  locale = 'en',
  customTranslations,
}: DynamicFormProps<TValues>): JSX.Element {
  return (
    <I18nProvider locale={locale} customTranslations={customTranslations}>
      <DynamicFormInner
        schema={schema}
        fields={fields}
        steps={steps}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onError={onError}
        onChange={onChange}
        resetOnSubmit={resetOnSubmit}
        submitLabel={submitLabel}
        resetLabel={resetLabel}
        nextLabel={nextLabel}
        prevLabel={prevLabel}
        showStepper={showStepper}
        columns={columns}
        className={className}
      />
    </I18nProvider>
  );
}

/**
 * Inner form component that has access to i18n context
 */
function DynamicFormInner<TValues extends FormValues = FormValues>({
  schema,
  fields,
  steps,
  defaultValues,
  onSubmit,
  onError,
  onChange,
  resetOnSubmit = false,
  submitLabel,
  resetLabel,
  nextLabel,
  prevLabel,
  showStepper = true,
  columns = 1,
  className = '',
}: Omit<DynamicFormProps<TValues>, 'locale' | 'customTranslations'>): JSX.Element {
  const { t } = useI18n();
  // ── State ─────────────────────────────────────────────────────
  const [values, setValues] = useState<Partial<TValues>>(defaultValues);
  const [errors, setErrors] = useState<FieldErrors<TValues>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TValues, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // ── Determine mode (single-page vs wizard) ────────────────────
  const isWizardMode = !!steps && steps.length > 0;
  const resolvedSchema = isWizardMode ? steps[currentStep]?.schema : schema;
  const resolvedFields = isWizardMode ? (steps[currentStep]?.fields ?? []) : (fields ?? []);

  // ── Form context value ────────────────────────────────────────
  const contextValue = useMemo(
    () => ({
      getValue: (key: keyof TValues) => values[key],
      setValue: (key: keyof TValues, value: FieldValue) => {
        setValues((prev) => {
          const next = { ...prev, [key]: value };
          onChange?.(next);
          return next;
        });
        // Clear error on change
        if (errors[key]) {
          setErrors((prev) => ({ ...prev, [key]: undefined }));
        }
      },
      getError: (key: keyof TValues) => errors[key] ?? null,
      setError: (key: keyof TValues, error: string | null) => {
        setErrors((prev) => ({ ...prev, [key]: error ?? undefined }));
      },
      getTouched: (key: keyof TValues) => touched[key] ?? false,
      setTouched: (key: keyof TValues, isTouched: boolean) => {
        setTouched((prev) => ({ ...prev, [key]: isTouched }));
      },
      getValues: () => values as TValues,
      isSubmitting,
      isValid: Object.keys(errors).length === 0,
    }),
    [values, errors, touched, isSubmitting, onChange],
  );

  // ── Submit handler ────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!resolvedSchema) {
        // No schema, just call onSubmit
        await onSubmit(values as TValues);
        return;
      }

      setIsSubmitting(true);

      try {
        // Validate with Zod
        const result = resolvedSchema.safeParse(values);

        if (!result.success) {
          // Map Zod errors to field errors
          const fieldErrors: FieldErrors<TValues> = {};
          for (const issue of result.error.issues) {
            const key = issue.path.join('.') as keyof TValues;
            if (!(key in fieldErrors)) {
              fieldErrors[key] = issue.message;
            }
          }
          setErrors(fieldErrors);
          // Mark fields with errors as touched so errors display
          const touchedFields: Partial<Record<keyof TValues, boolean>> = {};
          Object.keys(fieldErrors).forEach((key) => {
            touchedFields[key as keyof TValues] = true;
          });
          setTouched((prev) => ({ ...prev, ...touchedFields }));
          onError?.(fieldErrors);
          return;
        }

        // If wizard mode and not on last step, advance to next step
        if (isWizardMode && steps && currentStep < steps.length - 1) {
          setCurrentStep((prev) => prev + 1);
          return;
        }

        // Submit
        await onSubmit(result.data as TValues);

        // Reset if configured
        if (resetOnSubmit) {
          setValues(defaultValues);
          setErrors({});
          setTouched({});
          if (isWizardMode) setCurrentStep(0);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      values,
      resolvedSchema,
      onSubmit,
      onError,
      isWizardMode,
      steps,
      currentStep,
      resetOnSubmit,
      defaultValues,
    ],
  );

  // ── Reset handler ─────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setValues(defaultValues);
    setErrors({});
    setTouched({});
    if (isWizardMode) setCurrentStep(0);
  }, [defaultValues, isWizardMode]);

  // ── Step navigation (wizard mode) ─────────────────────────────
  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // ── Grid class ────────────────────────────────────────────────
  const gridClass = columns > 1 ? `grid grid-cols-${columns} gap-4` : 'flex flex-col gap-4';

  // ── Resolved labels with i18n ────────────────────────────────
  const resolvedSubmitLabel = submitLabel ?? t('form.submit');
  const resolvedNextLabel = nextLabel ?? t('form.next');
  const resolvedPrevLabel = prevLabel ?? t('form.back');

  // ── Render ────────────────────────────────────────────────────
  return (
    <FormKitProvider value={contextValue}>
      <form className={`formkit-dynamic-form ${className}`} onSubmit={handleSubmit} noValidate>
        {/* Stepper (wizard mode) */}
        {isWizardMode && showStepper && steps && (
          <div className="formkit-stepper mb-6" role="navigation" aria-label={t('a11y.formSteps')}>
            <ol className="flex gap-2">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className={`formkit-step ${index === currentStep ? 'formkit-step-active' : ''} ${index < currentStep ? 'formkit-step-completed' : ''}`}
                  aria-current={index === currentStep ? 'step' : undefined}
                >
                  <span className="formkit-step-number">{index + 1}</span>
                  <span className="formkit-step-title">{step.title}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Fields */}
        <div className={gridClass}>
          {resolvedFields.map((field) => (
            <Field key={field.key} config={field} />
          ))}
        </div>

        {/* Actions */}
        <FormActions
          submitLabel={
            isWizardMode && steps && currentStep < steps.length - 1
              ? resolvedNextLabel
              : resolvedSubmitLabel
          }
          resetLabel={resetLabel}
          prevLabel={isWizardMode && currentStep > 0 ? resolvedPrevLabel : undefined}
          isSubmitting={isSubmitting}
          onReset={resetLabel ? handleReset : undefined}
          onPrev={isWizardMode && currentStep > 0 ? handlePrev : undefined}
        />
      </form>
    </FormKitProvider>
  );
}
