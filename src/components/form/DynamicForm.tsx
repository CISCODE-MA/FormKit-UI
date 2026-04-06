/**
 * DynamicForm - THE primary public component
 * Auto-generates accessible, validated forms from Zod schema + field config
 */

import { type JSX, type FormEvent, useState, useCallback, useMemo } from 'react';
import type { z } from 'zod';
import type { FieldConfig } from '../../models/FieldConfig';
import type { StepConfig } from '../../models/StepConfig';
import type { FormLayoutItem, ColumnCount } from '../../models/SectionConfig';
import { isSection } from '../../models/SectionConfig';
import type { FormValues, ValidationMode, FieldValue } from '../../core/types';
import type { Locale, TranslationKeys } from '../../core/i18n';
import type { FieldErrors } from '../../core/validator';
import { getGridContainerClass, getColSpanClass } from '../../core/grid';
import FormKitProvider from '../context/FormKitContext';
import I18nProvider from '../context/I18nContext';
import { useI18n } from '../../hooks/useI18n';
import Field from '../fields/Field';
import FormSection from '../layout/FormSection';
import FormActions from '../layout/FormActions';

/**
 * Scrolls to the first field with an error after validation fails.
 * Uses requestAnimationFrame + setTimeout to ensure DOM is updated after state changes.
 */
function scrollToFirstError(fieldKeys: string[]): void {
  // Wait for React to flush state updates and render error elements
  requestAnimationFrame(() => {
    // Additional delay to ensure DOM is fully updated
    setTimeout(() => {
      for (const key of fieldKeys) {
        const fieldElement = document.getElementById(`field-${key}`);
        if (fieldElement) {
          // Check if scrollIntoView is available (not in jsdom test environment)
          if (typeof fieldElement.scrollIntoView === 'function') {
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          // Focus the field for accessibility
          if (typeof fieldElement.focus === 'function') {
            fieldElement.focus({ preventScroll: true });
          }
          break;
        }
      }
    }, 50);
  });
}

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
  /**
   * Field configuration array for single-page mode (omit when using `steps`).
   * For advanced layouts, use `layout` instead.
   */
  fields?: FieldConfig[];
  /**
   * Layout configuration with sections and fields.
   * Supports grouping fields into sections with independent grid configs.
   * Takes precedence over `fields` when both are provided.
   *
   * @example
   * ```tsx
   * layout={[
   *   {
   *     type: 'section',
   *     title: 'Personal Info',
   *     columns: { default: 1, md: 2 },
   *     fields: [
   *       { key: 'firstName', type: FieldType.TEXT, colSpan: 1 },
   *       { key: 'lastName', type: FieldType.TEXT, colSpan: 1 },
   *     ]
   *   },
   *   { key: 'notes', type: FieldType.TEXTAREA }, // standalone field
   * ]}
   * ```
   */
  layout?: FormLayoutItem[];
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
  /**
   * Grid columns for field layout.
   * Can be a number (1-12) or responsive config.
   * Individual sections can override this.
   * @default 1
   *
   * @example Simple: `columns={2}`
   * @example Responsive: `columns={{ default: 1, md: 2, lg: 3 }}`
   */
  columns?: ColumnCount;
  /** Gap between fields (Tailwind scale: 1-8, default: 4) */
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8;
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
  layout,
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
  gap = 4,
  className = '',
  locale = 'en',
  customTranslations,
}: DynamicFormProps<TValues>): JSX.Element {
  return (
    <I18nProvider locale={locale} customTranslations={customTranslations}>
      <DynamicFormInner
        schema={schema}
        fields={fields}
        layout={layout}
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
        gap={gap}
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
  layout,
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
  gap = 4,
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

  // Resolve layout items: layout > fields > step fields
  const resolvedLayoutItems = useMemo<FormLayoutItem[]>(() => {
    if (isWizardMode) {
      return steps?.[currentStep]?.fields ?? [];
    }
    if (layout && layout.length > 0) {
      return layout;
    }
    return fields ?? [];
  }, [isWizardMode, steps, currentStep, layout, fields]);

  // Extract flat list of field configs for validation (needed for error scrolling)
  const resolvedFields = useMemo<FieldConfig[]>(() => {
    const flatFields: FieldConfig[] = [];
    for (const item of resolvedLayoutItems) {
      if (isSection(item)) {
        flatFields.push(...item.fields);
      } else {
        flatFields.push(item);
      }
    }
    return flatFields;
  }, [resolvedLayoutItems]);

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

          // Scroll to first field with error (in field order)
          const errorKeys = resolvedFields.map((f) => f.key).filter((key) => key in fieldErrors);
          if (errorKeys.length > 0) {
            scrollToFirstError(errorKeys);
          }

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
      resolvedFields,
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
  const gridClass = getGridContainerClass(columns, gap);

  // Check if we have any sections (to determine if we need a wrapper grid)
  const hasSections = resolvedLayoutItems.some(isSection);

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
          <nav className="formkit-stepper mb-6" aria-label={t('a11y.formSteps')}>
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
          </nav>
        )}

        {/* Fields and Sections */}
        {hasSections ? (
          // Layout with sections: render sections and standalone fields in a flex column
          <div className="flex flex-col gap-6">
            {resolvedLayoutItems.map((item, index) => {
              if (isSection(item)) {
                return <FormSection key={item.id ?? `section-${index}`} config={item} />;
              }
              // Standalone field outside a section
              const colSpanClass = getColSpanClass(item.colSpan);
              return (
                <div key={item.key} className={colSpanClass}>
                  <Field config={item} />
                </div>
              );
            })}
          </div>
        ) : (
          // Simple grid layout without sections
          <div className={gridClass}>
            {resolvedLayoutItems.map((item) => {
              // All items are fields in this branch
              const field = item as FieldConfig;
              const colSpanClass = getColSpanClass(field.colSpan);
              return (
                <div key={field.key} className={colSpanClass}>
                  <Field config={field} />
                </div>
              );
            })}
          </div>
        )}

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
