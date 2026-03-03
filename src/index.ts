// ── Primary public surface ──────────────────────────────────────
// TODO: Replace './components/Form' with './components/form/DynamicForm' after refactor
export { default as DynamicForm } from './components/Form';

// ── Types (consumers need for field config + step config) ───────
// TODO: Export correct types after refactor
// export type { DynamicFormProps } from './components/form/DynamicForm';
// export type { FieldConfig, FieldOption } from './models/FieldConfig';
// export type { StepConfig } from './models/StepConfig';
// export type { FormState, FieldState } from './models/FormState';
// export type { ValidationRule } from './models/ValidationRule';

// ── Enum (consumers reference when building field configs) ───────
// export { FieldType } from './core/types';

// ── Schema helpers (for building Zod schemas declaratively) ─────
// export { createFieldSchema, mergeSchemas } from './core/schema-helpers';

// ── Advanced extensibility (exposed, but not primary API) ────────
// export { useFormKit } from './hooks/useFormKit';
// export { useFormContext } from './hooks/useFormContext';
