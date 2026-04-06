// ── Primary public surface ──────────────────────────────────────
export { default as DynamicForm } from './components/form/DynamicForm';

// ── Types (consumers need for field config + step config) ───────
export type { DynamicFormProps } from './components/form/DynamicForm';
export type { FieldConfig, FieldOption } from './models/FieldConfig';
export type { StepConfig } from './models/StepConfig';
export type {
  SectionConfig,
  FormLayoutItem,
  ResponsiveColumns,
  ResponsiveColSpan,
  ColumnCount,
  ColSpanValue,
} from './models/SectionConfig';
export { isSection, isField } from './models/SectionConfig';
export type { FormState, FieldState, FormContextValue } from './models/FormState';
export type {
  ValidationRule,
  AsyncValidationRule,
  SyncValidationRule,
} from './models/ValidationRule';

// ── Enum (consumers reference when building field configs) ───────
export { FieldType } from './core/types';

// ── Core types ───────────────────────────────────────────────────
export type { ConditionalRule, FormValues, FieldValue, ValidationMode } from './core/types';

// ── i18n (internationalization) ─────────────────────────────────
export { default as I18nProvider } from './components/context/I18nContext';
export type { I18nContextValue } from './components/context/I18nContext';
export { useI18n } from './hooks/useI18n';
export type { Locale, TranslationKeys } from './core/i18n';
export { DEFAULT_LOCALE } from './core/i18n';
export { default as en } from './locales/en';
export { default as fr } from './locales/fr';

// ── Schema helpers (for building Zod schemas declaratively) ─────
export { createFieldSchema, mergeSchemas } from './core/schema-helpers';

// ── Advanced extensibility (exposed, but not primary API) ────────
export { useFormKit, type UseFormKitOptions, type UseFormKitReturn } from './hooks/useFormKit';
export { useFormContext } from './hooks/useFormContext';
