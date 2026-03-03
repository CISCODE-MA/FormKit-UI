# Copilot Instructions - @ciscode/ui-form-kit

> **Purpose**: The definitive form library for the `@ciscode/*` React ecosystem. One API — `DynamicForm` — auto-generates accessible, validated, fully-featured forms from a Zod schema + field config array. Supports multi-step wizards, field arrays, async validation, and conditional field logic out of the box.

---

## 🎯 Package Overview

**Package**: `@ciscode/ui-form-kit`  
**Type**: React Frontend Form Library  
**Schema Engine**: Zod v4  
**Build**: ESM + CJS via `tsup`, `style.css` exported separately  
**Purpose**: Single source of truth for all form logic, field rendering, validation, and submission state across all `@ciscode/*` host apps

### Core Philosophy

**One API. One way to build forms.**

There is only one public surface: `DynamicForm`. Developers pass a Zod schema + field config array — the library handles rendering, validation, state, accessibility, conditional logic, step navigation, and array fields automatically. No manual composition, no wiring hooks together.

### This Package Provides:

- `DynamicForm` — the single public component: schema + config → fully working form
- `useFormKit` — internal engine (not for direct use; exposed for advanced extensibility only)
- `useFieldArray` — internal array field management
- `useFormStep` — internal multi-step navigation
- `useAsyncValidation` — internal debounced async validator
- 12 built-in field types: `text`, `email`, `password`, `number`, `textarea`, `select`, `multi-select`, `checkbox`, `radio`, `switch`, `date`, `file`
- Multi-step wizard mode via `steps` config on `DynamicForm`
- Repeatable field arrays via `type: 'array'` in `FieldConfig`
- Async field validation via `asyncValidate` in `FieldConfig`
- Conditional field visibility via `showWhen` / `hideWhen` in `FieldConfig`
- Tailwind-compatible styling — no Tailwind required in host app
- Full RTL support
- WCAG 2.1 AA on every field — non-negotiable
- Vitest unit/integration tests, 80% coverage threshold
- Changesets for version management
- Husky + lint-staged for code quality

---

## 🏗️ Module Architecture

**FormKit uses Component-Hook-Model (CHM) — the frontend equivalent of CSR.**

> **WHY CHM?** Forms combine rendering (Components), state + logic (Hooks), and data contracts (Models). Strict layer separation makes each independently testable and keeps `DynamicForm` as a thin orchestrator — not a god component.

```
src/
  ├── index.ts                               # PUBLIC API — all exports go through here
  │
  ├── core/                                  # ✅ Framework-FREE (no React imports)
  │   ├── types.ts                           # All TypeScript enums and base types
  │   ├── validator.ts                       # Zod error mapping, sync validation runner
  │   ├── conditional.ts                     # showWhen/hideWhen rule evaluation (pure)
  │   ├── schema-helpers.ts                  # Zod field builders, coerce utilities
  │   └── errors.ts                          # FormKitError, FieldValidationError
  │
  ├── hooks/                                 # Logic Layer — state and side effects
  │   ├── useFormKit.ts                      # Master form state (values, errors, touched, submit)
  │   ├── useFieldArray.ts                   # Repeatable field group management
  │   ├── useFormStep.ts                     # Multi-step navigation + per-step validation
  │   ├── useAsyncValidation.ts              # Debounced async validators + AbortController
  │   └── useFormContext.ts                  # Access form state from deep in the tree
  │
  ├── components/                            # UI Layer — rendering only, no logic
  │   ├── context/
  │   │   └── FormKitContext.tsx             # React context + FormKitProvider (internal)
  │   ├── form/
  │   │   ├── DynamicForm.tsx               # THE public component — orchestrates everything
  │   │   ├── DynamicFormStep.tsx           # Renders a single step's fields
  │   │   └── FormStepper.tsx               # Step indicator / progress bar
  │   ├── fields/
  │   │   ├── Field.tsx                     # Universal field router (reads type, delegates)
  │   │   ├── TextField.tsx                 # type: text | email | password | number
  │   │   ├── TextareaField.tsx             # type: textarea
  │   │   ├── SelectField.tsx               # type: select
  │   │   ├── MultiSelectField.tsx          # type: multi-select (react-select)
  │   │   ├── CheckboxField.tsx             # type: checkbox
  │   │   ├── RadioGroupField.tsx           # type: radio
  │   │   ├── SwitchField.tsx               # type: switch
  │   │   ├── DateField.tsx                 # type: date
  │   │   ├── FileField.tsx                 # type: file
  │   │   └── ArrayField.tsx                # type: array (repeatable group)
  │   └── layout/
  │       ├── FieldError.tsx                # Standardized error display
  │       ├── FieldLabel.tsx                # Label + required indicator
  │       ├── FieldGroup.tsx                # Visual field grouping
  │       └── FormActions.tsx               # Submit + Reset buttons with loading state
  │
  └── models/                               # Type Layer — contracts only, zero runtime logic
      ├── FieldConfig.ts                    # Per-field configuration
      ├── StepConfig.ts                     # Multi-step configuration
      ├── FormState.ts                      # Runtime form state shape
      └── ValidationRule.ts                 # Async validator type
```

**Responsibility Layers:**

| Layer          | Responsibility                                              | Examples                                              |
| -------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| **Components** | Rendering, field routing, user interaction                  | `DynamicForm`, `Field`, `ArrayField`, `FormStepper`   |
| **Hooks**      | Form state, validation orchestration, step/array management | `useFormKit`, `useFieldArray`, `useFormStep`          |
| **Core**       | Pure logic — validation, conditional rules, schema helpers  | `validator.ts`, `conditional.ts`, `schema-helpers.ts` |
| **Models**     | TypeScript contracts — zero runtime logic                   | `FieldConfig`, `StepConfig`, `FormState`              |
| **Context**    | Form state propagation — internal only                      | `FormKitContext`, `FormKitProvider`                   |

### Layer Import Rules — STRICTLY ENFORCED

| Layer        | Can import from                        | Cannot import from              |
| ------------ | -------------------------------------- | ------------------------------- |
| `core`       | `zod` only                             | `hooks`, `components`, `models` |
| `models`     | Nothing internal                       | `core`, `hooks`, `components`   |
| `hooks`      | `core`, `models`                       | `components`                    |
| `components` | `hooks`, `models`, `core` (types only) | —                               |
| `context`    | `hooks`, `models`                      | Individual field components     |

> **The golden rule**: `core/` has zero React imports. It must compile in Node.js. If you write `import { useState }` inside `core/`, it belongs in `hooks/`.

---

## 📝 Naming Conventions

### Files

**Pattern**: `PascalCase` for components, `camelCase` for hooks and core

| Type             | Example                | Directory                |
| ---------------- | ---------------------- | ------------------------ |
| Component        | `DynamicForm.tsx`      | `src/components/form/`   |
| Field component  | `TextField.tsx`        | `src/components/fields/` |
| Hook             | `useFormKit.ts`        | `src/hooks/`             |
| Core logic       | `validator.ts`         | `src/core/`              |
| Model            | `FieldConfig.ts`       | `src/models/`            |
| Unit test        | `useFormKit.test.ts`   | `tests/unit/`            |
| Integration test | `DynamicForm.test.tsx` | `tests/integration/`     |

### Code Naming

- **Components**: `PascalCase` → `DynamicForm`, `TextField`, `ArrayField`
- **Hooks**: `camelCase` with `use` prefix → `useFormKit`, `useFieldArray`
- **Types / Interfaces**: `PascalCase` → `FieldConfig`, `StepConfig`, `FormState`
- **Enums**: `PascalCase` name, lowercase string values
- **Constants**: `UPPER_SNAKE_CASE` → `DEFAULT_DEBOUNCE_MS`, `MAX_FILE_SIZE_BYTES`

```typescript
// ✅ Correct
enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NUMBER = 'number',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTI_SELECT = 'multi-select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SWITCH = 'switch',
  DATE = 'date',
  FILE = 'file',
  ARRAY = 'array', // repeatable field group
}
```

### Component Pattern — ALWAYS follow this structure

```tsx
import type { JSX } from 'react';
import { useFormContext } from '../../hooks/useFormContext';
import type { FieldConfig } from '../../models/FieldConfig';

// 1. Explicit local Props type — never inline
type Props = {
  config: FieldConfig;
  className?: string;
};

// 2. Default export, explicit return type
export default function TextField({ config, className }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched } = useFormContext();
  // ...
}

// 3. Export Props type for consumers who need it for extension
export type { Props as TextFieldProps };
```

**Hard rules:**

- ✅ Always explicit `Props` type — never `React.FC<{...}>` inline
- ✅ Always explicit `JSX.Element` return type
- ✅ Default export for components, named exports for hooks and types
- ✅ Props destructured in function signature — never `props.x`
- ❌ No `React.FC` — ever
- ❌ No `any` for prop types — use `unknown` or proper generics

---

## 📦 Public API — `src/index.ts`

`DynamicForm` is the primary public surface. Everything else is exported for TypeScript typing and advanced extensibility only.

```typescript
// ── Primary public surface ──────────────────────────────────────
export { default as DynamicForm } from './components/form/DynamicForm';

// ── Types (consumers need for field config + step config) ───────
export type { DynamicFormProps } from './components/form/DynamicForm';
export type { FieldConfig, FieldOption } from './models/FieldConfig';
export type { StepConfig } from './models/StepConfig';
export type { FormState, FieldState } from './models/FormState';
export type { ValidationRule } from './models/ValidationRule';

// ── Enum (consumers reference when building field configs) ───────
export { FieldType } from './core/types';

// ── Schema helpers (for building Zod schemas declaratively) ─────
export { createFieldSchema, mergeSchemas } from './core/schema-helpers';

// ── Advanced extensibility (exposed, but not primary API) ────────
export { useFormKit } from './hooks/useFormKit';
export { useFormContext } from './hooks/useFormContext';

// ❌ NEVER export
// FormKitContext (always use useFormContext())
// useFieldArray, useFormStep, useAsyncValidation (internals)
// Individual field components (TextField, SelectField, etc.)
// core/validator, core/conditional (internal implementation)
```

**Consuming apps import from the package root only:**

```tsx
import DynamicForm, { type FieldConfig, type StepConfig, FieldType } from '@ciscode/ui-form-kit';
import '@ciscode/ui-form-kit/style.css';
```

---

## ⚙️ `DynamicForm` — The Complete API

### Basic Usage

```tsx
import DynamicForm, { FieldType, type FieldConfig } from '@ciscode/ui-form-kit';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user', 'viewer']),
});

const fields: FieldConfig[] = [
  { key: 'name', label: 'Full Name', type: FieldType.TEXT },
  { key: 'email', label: 'Email', type: FieldType.EMAIL },
  {
    key: 'role',
    label: 'Role',
    type: FieldType.SELECT,
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
      { label: 'Viewer', value: 'viewer' },
    ],
  },
];

<DynamicForm
  schema={schema}
  fields={fields}
  defaultValues={{ name: '', email: '', role: 'user' }}
  onSubmit={async (values) => await saveUser(values)}
  submitLabel="Save User"
/>;
```

### Async Validation

```tsx
const fields: FieldConfig[] = [
  {
    key: 'email',
    label: 'Email',
    type: FieldType.EMAIL,
    asyncValidate: async (value, { signal }) => {
      const exists = await checkEmailExists(value, signal);
      return exists ? 'This email is already taken' : null;
    },
    asyncDebounceMs: 400, // default: 300
  },
];
```

### Conditional Fields

```tsx
const fields: FieldConfig[] = [
  { key: 'role', label: 'Role', type: FieldType.SELECT, options: roleOptions },
  {
    key: 'department',
    label: 'Department',
    type: FieldType.SELECT,
    options: deptOptions,
    showWhen: { field: 'role', operator: 'equals', value: 'admin' },
  },
  {
    key: 'reason',
    label: 'Access Reason',
    type: FieldType.TEXTAREA,
    showWhen: { field: 'role', operator: 'equals', value: 'viewer' },
  },
  {
    key: 'salary',
    label: 'Salary',
    type: FieldType.NUMBER,
    hideWhen: { field: 'role', operator: 'equals', value: 'viewer' },
  },
];
```

### Field Arrays (Repeatable Groups)

```tsx
const schema = z.object({
  contacts: z
    .array(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }),
    )
    .min(1, 'At least one contact required'),
});

const fields: FieldConfig[] = [
  {
    key: 'contacts',
    label: 'Contacts',
    type: FieldType.ARRAY,
    addLabel: 'Add Contact',
    removeLabel: 'Remove',
    minRows: 1,
    maxRows: 10,
    arrayFields: [
      { key: 'name', label: 'Name', type: FieldType.TEXT },
      { key: 'email', label: 'Email', type: FieldType.EMAIL },
    ],
  },
];
```

### Multi-Step Wizard

```tsx
import DynamicForm, { type StepConfig } from '@ciscode/ui-form-kit';
import { z } from 'zod';

// Each step has its own schema — only its fields are validated on Next
const steps: StepConfig[] = [
  {
    title: 'Profile',
    schema: z.object({ name: z.string().min(2), email: z.string().email() }),
    fields: [
      { key: 'name', label: 'Full Name', type: FieldType.TEXT },
      { key: 'email', label: 'Email', type: FieldType.EMAIL },
    ],
  },
  {
    title: 'Plan',
    schema: z.object({ plan: z.enum(['free', 'pro']), billing: z.string().min(1) }),
    fields: [
      {
        key: 'plan',
        label: 'Plan',
        type: FieldType.RADIO,
        options: [
          { label: 'Free', value: 'free' },
          { label: 'Pro', value: 'pro' },
        ],
      },
      { key: 'billing', label: 'Billing', type: FieldType.SELECT, options: billingOptions },
    ],
  },
  {
    title: 'Confirm',
    schema: z.object({
      agree: z.literal(true, { errorMap: () => ({ message: 'You must agree' }) }),
    }),
    fields: [{ key: 'agree', label: 'I agree to the terms', type: FieldType.CHECKBOX }],
  },
];

<DynamicForm
  steps={steps}
  defaultValues={{ name: '', email: '', plan: 'free', billing: '', agree: false }}
  onSubmit={async (values) => await createAccount(values)}
  submitLabel="Create Account"
  showStepper={true}
/>;
```

### `DynamicFormProps` — complete shape

```typescript
interface DynamicFormProps<TValues extends FormValues = FormValues> {
  // ── Core ────────────────────────────────────────────────────
  schema?: z.ZodType<TValues>; // Required when NOT using steps
  fields?: FieldConfig[]; // Required when NOT using steps
  steps?: StepConfig[]; // Enables multi-step mode (replaces schema + fields)
  defaultValues: Partial<TValues>;

  // ── Callbacks ───────────────────────────────────────────────
  onSubmit: (values: TValues) => Promise<void> | void;
  onError?: (errors: FieldErrors<TValues>) => void;
  onChange?: (values: Partial<TValues>) => void;

  // ── Behavior ────────────────────────────────────────────────
  mode?: 'onSubmit' | 'onChange' | 'onBlur'; // default: 'onBlur'
  resetOnSubmit?: boolean; // default: false

  // ── Labels ──────────────────────────────────────────────────
  submitLabel?: string; // default: 'Submit'
  resetLabel?: string; // omit to hide Reset button
  nextLabel?: string; // default: 'Next' (wizard mode)
  prevLabel?: string; // default: 'Back' (wizard mode)

  // ── Layout ──────────────────────────────────────────────────
  showStepper?: boolean; // show step indicator (wizard mode, default: true)
  columns?: 1 | 2 | 3 | 4; // grid columns for field layout (default: 1)
  className?: string;
}
```

---

## 🧩 Core Contracts

### `FieldConfig` — per-field configuration

```typescript
interface FieldConfig<TValue = unknown> {
  // Identity
  readonly key: string; // Must match a key in the Zod schema
  readonly label: string;
  readonly type: FieldType;

  // Content
  readonly placeholder?: string;
  readonly description?: string; // Helper text shown below the field
  readonly options?: FieldOption[]; // For select, multi-select, radio

  // State
  readonly required?: boolean; // VISUAL only (asterisk) — Zod schema is the gate
  readonly disabled?: boolean | ((values: FormValues) => boolean);
  readonly readOnly?: boolean;

  // Async validation
  readonly asyncValidate?: (value: TValue, ctx: { signal: AbortSignal }) => Promise<string | null>;
  readonly asyncDebounceMs?: number; // default: 300

  // Conditional visibility
  readonly showWhen?: ConditionalRule;
  readonly hideWhen?: ConditionalRule;

  // Array field (only when type === FieldType.ARRAY)
  readonly arrayFields?: FieldConfig[];
  readonly addLabel?: string; // default: 'Add'
  readonly removeLabel?: string; // default: 'Remove'
  readonly minRows?: number;
  readonly maxRows?: number;

  // Layout
  readonly colSpan?: 1 | 2 | 3 | 4;
  readonly className?: string;
}
```

### `ConditionalRule` — field visibility

```typescript
interface ConditionalRule {
  readonly field: string;
  readonly operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'is_empty'
    | 'is_not_empty'
    | 'gt'
    | 'lt';
  readonly value?: unknown;
}
```

**Rule**: All conditional evaluation lives in `core/conditional.ts` as a pure function. Components call it and conditionally render — they never implement the logic themselves.

```typescript
// core/conditional.ts — pure, no React
export function evaluateRule(rule: ConditionalRule, values: FormValues): boolean {
  const fieldValue = values[rule.field];
  switch (rule.operator) {
    case 'equals':
      return fieldValue === rule.value;
    case 'not_equals':
      return fieldValue !== rule.value;
    case 'is_empty':
      return !fieldValue || fieldValue === '';
    case 'is_not_empty':
      return !!fieldValue && fieldValue !== '';
    case 'gt':
      return Number(fieldValue) > Number(rule.value);
    case 'lt':
      return Number(fieldValue) < Number(rule.value);
    case 'contains':
      return String(fieldValue).includes(String(rule.value));
  }
}
```

### `StepConfig` — multi-step configuration

```typescript
interface StepConfig {
  readonly title: string;
  readonly schema: z.ZodType; // Validated when user clicks Next
  readonly fields: FieldConfig[];
  readonly description?: string;
}
```

### Validation rule: Zod is the single source of truth

```typescript
// ❌ WRONG — duplicating validation in FieldConfig
{ key: 'name', label: 'Name', type: FieldType.TEXT, required: true, minLength: 2 }

// ✅ CORRECT — validation in Zod schema; FieldConfig adds UX only
schema: z.object({ name: z.string().min(2, 'Min 2 characters') })
fields: [{ key: 'name', label: 'Name', type: FieldType.TEXT, required: true }]
// `required: true` = shows asterisk only. Zod schema is the real validation gate.
```

---

## ♿ Accessibility (a11y) — NON-NEGOTIABLE

Every field must meet WCAG 2.1 AA. This is not optional — an inaccessible field is a bug.

**Mandatory pattern for every field component:**

```tsx
export default function TextField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched } = useFormContext();
  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;
  const error = getError(config.key);

  return (
    <div className="flex flex-col gap-1">
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      {config.description && (
        <p id={descId} className="text-sm text-gray-500">
          {config.description}
        </p>
      )}

      <input
        id={fieldId}
        name={config.key}
        type={config.type}
        value={String(getValue(config.key) ?? '')}
        placeholder={config.placeholder}
        disabled={typeof config.disabled === 'function' ? config.disabled(values) : config.disabled}
        aria-invalid={!!error}
        aria-required={config.required}
        aria-describedby={
          [error ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
          undefined
        }
        onChange={(e) => setValue(config.key, e.target.value)}
        className="..."
      />

      {error && (
        <FieldError id={errorId} message={error} />
        // FieldError renders: <p id={id} role="alert">{message}</p>
      )}
    </div>
  );
}
```

**Checklist per field type — must pass before merge:**

- [ ] `<label>` with `htmlFor` matching field `id`
- [ ] `aria-invalid="true"` when field has an error
- [ ] `aria-describedby` pointing to both error and description (when present)
- [ ] `aria-required` matching `required` config
- [ ] Error element uses `role="alert"` for live announcement
- [ ] Keyboard: full operation without mouse (`Tab`, `Enter`/`Space`, arrows for radio/select)
- [ ] Focus indicator visible at all times — no `outline: none` without replacement
- [ ] `ArrayField` add/remove buttons have descriptive `aria-label` (e.g. `aria-label="Remove contact 2"`)
- [ ] Multi-step: stepper announces current step to screen readers via `aria-current="step"`

---

## 🎨 Styling Rules

- ✅ Tailwind utility classes in JSX — no per-component CSS files
- ✅ RTL support via `ltr:` / `rtl:` variants where layout is directional
- ✅ Dark mode via `dark:` variants
- ✅ Global overrides and CSS variables in `src/assets/styles/style.css` only
- ❌ No per-component `.css` or `.module.css` files
- ❌ No inline `style={{}}` for anything expressible as a Tailwind class
- ❌ No hardcoded color values — use Tailwind's scale or CSS variables

```tsx
// ❌ Wrong
<div style={{ display: 'flex', gap: '8px' }}>

// ✅ Correct
<div className="flex gap-2">

// ✅ RTL-aware
<div className="ltr:ml-4 rtl:mr-4">
```

---

## 🧪 Testing — RIGOROUS for Libraries

### Coverage Target: 80%+

**Unit Tests — MANDATORY (Vitest + @testing-library/react):**

- ✅ `core/validator.ts` — Zod error mapping, error path extraction, edge cases
- ✅ `core/conditional.ts` — all 7 operators, nested values, missing fields
- ✅ `core/schema-helpers.ts` — schema composition, coerce helpers
- ✅ `useFormKit` — initial state, `setValue`, validation trigger, submit, reset
- ✅ `useFieldArray` — append, remove, reorder, validation per row, min/max
- ✅ `useFormStep` — next/prev, step validation gate, prevents advance on error
- ✅ `useAsyncValidation` — debounce timing, AbortController cancellation, loading state
- ✅ Each field component — render, user input, error display, all a11y attributes

**Integration Tests:**

- ✅ `DynamicForm` basic — schema + fields → render → submit → `onSubmit` called
- ✅ Zod validation errors mapped and displayed per field
- ✅ Conditional fields — show/hide on value change, hidden fields excluded from submit
- ✅ `FieldArray` — add row, fill, remove, submit with array data, min/max enforcement
- ✅ Multi-step — cannot advance with step errors, final submit fires `onSubmit`
- ✅ Async validation — debounce, loading indicator, error shown after resolve

**Test patterns:**

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DynamicForm from '../../src/components/form/DynamicForm';
import { FieldType } from '../../src/core/types';
import { z } from 'zod';

describe('DynamicForm — async validation', () => {
  it('shows async error after debounce', async () => {
    const asyncValidate = vi.fn().mockResolvedValue('Email already taken');
    const fields = [
      { key: 'email', label: 'Email', type: FieldType.EMAIL, asyncValidate, asyncDebounceMs: 100 },
    ];
    const schema = z.object({ email: z.string().email() });

    render(
      <DynamicForm
        schema={schema}
        fields={fields}
        defaultValues={{ email: '' }}
        onSubmit={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');

    await waitFor(
      () => expect(screen.getByRole('alert')).toHaveTextContent('Email already taken'),
      { timeout: 500 },
    );
  });
});
```

**Vitest Configuration:**

```typescript
coverage: {
  provider: 'v8',
  thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
  exclude: ['examples/', 'src/index.ts'],
}
```

---

## 📚 Documentation — Complete

### JSDoc/TSDoc — ALWAYS for public APIs

````typescript
/**
 * Auto-generates a fully accessible, validated form from a Zod schema and field config.
 * Supports single-page forms and multi-step wizards via the `steps` prop.
 *
 * @param schema - Zod schema for single-page mode (omit when using `steps`)
 * @param fields - Field configuration array for single-page mode (omit when using `steps`)
 * @param steps  - Step configuration array for wizard mode (replaces `schema` + `fields`)
 * @param defaultValues - Initial field values
 * @param onSubmit - Called with validated values on successful submission
 * @param mode - Validation trigger: 'onSubmit' | 'onChange' | 'onBlur' (default: 'onBlur')
 *
 * @example — Single page
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
export default function DynamicForm<TValues>(props: DynamicFormProps<TValues>): JSX.Element;
````

**Required for:**

- `DynamicForm` (full JSDoc with all prop descriptions + two examples)
- `FieldConfig` interface and every property
- `StepConfig` interface and every property
- `ConditionalRule` interface and all operators
- `FieldType` enum values
- `createFieldSchema`, `mergeSchemas` helpers
- `useFormKit` and `useFormContext` (exported for extensibility)

---

## 🚀 Library Development Principles

### 1. `DynamicForm` is the Only Door

There is no other public component. Any feature must be expressible through `DynamicFormProps` or `FieldConfig`. If it can't be — design a new config option, not a new component.

```tsx
// ❌ Wrong — leaking internals as public API
export { Field, TextField, ArrayField } // host apps shouldn't wire fields manually

// ✅ Correct — everything flows through DynamicForm
<DynamicForm fields={[{ type: FieldType.ARRAY, arrayFields: [...] }]} ... />
```

### 2. `DynamicForm` is a Thin Orchestrator — Not a God Component

`DynamicForm` reads config and delegates. It never contains validation logic, conditional logic, or field-specific rendering code directly.

```tsx
// ✅ Correct structure of DynamicForm
export default function DynamicForm({
  schema,
  fields,
  steps,
  defaultValues,
  onSubmit,
}: DynamicFormProps) {
  const form = useFormKit({ schema: resolvedSchema, defaultValues });

  return (
    <FormKitProvider form={form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {resolvedFields.map((field) => (
          <Field key={field.key} config={field} /> // Field does the routing
        ))}
        <FormActions submitLabel={submitLabel} isSubmitting={form.isSubmitting} />
      </form>
    </FormKitProvider>
  );
}
```

### 3. Zod is the Single Validation Source of Truth

No parallel validation in `FieldConfig`. All min, max, pattern, required, refine rules live in the Zod schema. `FieldConfig` adds UX config only.

### 4. Conditional Logic Stays in `core/`

`evaluateRule()` is a pure function in `core/conditional.ts`. It is tested independently. Components call it — they never re-implement it.

### 5. Async Validators Always Use `AbortController`

Every `asyncValidate` call receives `{ signal: AbortSignal }`. The signal must be used when calling `fetch`. `useAsyncValidation` aborts on unmount and on new keystrokes.

### 6. Accessibility is Not a Feature — It's a Constraint

Every field ships a11y-complete or it doesn't ship. No `// TODO: add aria` comments in merged code.

---

## 🔄 Workflow & Task Management

### Task-Driven Development

**1. Branch Creation:**

```bash
feature/FORM-001-core-types-and-validator
feature/FORM-002-useFormKit-hook
feature/FORM-005-dynamic-form-component
bugfix/FORM-042-async-validation-race-condition
refactor/FORM-099-extract-conditional-to-core
```

**2. Task Documentation:**

```
docs/tasks/active/FORM-001-core-types-and-validator.md
docs/tasks/archive/by-release/v1.0.0/FORM-001-core-types-and-validator.md
```

### Recommended Build Order

Follow this sequence — each phase depends on the previous.

```
Phase 1 — Foundation (no UI yet)
  FORM-001  core/types.ts — FieldType enum, ConditionalRule, base types
  FORM-002  models/ — FieldConfig, StepConfig, FormState
  FORM-003  core/validator.ts — Zod error mapping, sync validation runner
  FORM-004  core/conditional.ts — evaluateRule() + all operators
  FORM-005  hooks/useFormKit.ts — values, errors, touched, validate, reset, handleSubmit

Phase 2 — Basic Rendering
  FORM-006  components/context/FormKitContext.tsx + useFormContext.ts
  FORM-007  components/layout/FieldLabel + FieldError + FormActions
  FORM-008  components/fields/TextField.tsx (text, email, password, number) + a11y
  FORM-009  components/fields/TextareaField + CheckboxField + SwitchField
  FORM-010  components/fields/SelectField + RadioGroupField
  FORM-011  components/fields/Field.tsx — universal router
  FORM-012  components/form/DynamicForm.tsx — single-page mode
  FORM-013  tests/integration/DynamicForm.test.tsx — full submit flow

Phase 3 — Advanced Features
  FORM-014  core/conditional.ts integration in Field.tsx (showWhen/hideWhen)
  FORM-015  hooks/useAsyncValidation.ts + integration in Field.tsx
  FORM-016  hooks/useFieldArray.ts + components/fields/ArrayField.tsx
  FORM-017  hooks/useFormStep.ts + DynamicFormStep.tsx + FormStepper.tsx
  FORM-018  DynamicForm — multi-step mode via `steps` prop

Phase 4 — Remaining Fields + Polish
  FORM-019  MultiSelectField (react-select), DateField, FileField
  FORM-020  colSpan grid layout, columns prop on DynamicForm
  FORM-021  Full Vitest coverage sweep (80%+ all thresholds)
  FORM-022  JSDoc pass on all public APIs
  FORM-023  README with full usage examples
```

### Development Workflow

**Simple changes**: Read context → Implement → Update docs → **Create changeset**  
**Complex changes**: Read context → Discuss approach → Implement → Update docs → **Create changeset**  
**When blocked**: **DO** ask immediately — **DON'T** generate incorrect output

---

## 📦 Versioning & Breaking Changes

### Semantic Versioning (Strict)

**MAJOR** (x.0.0) — Breaking changes:

- Removed or renamed `DynamicFormProps` fields
- Removed or renamed `FieldConfig` fields (especially `key`, `type`, `label`)
- Changed `FieldType` enum values
- Changed `ConditionalRule` operators
- Removed `StepConfig` fields
- Added a new required peer dependency

**MINOR** (0.x.0) — New features:

- New `FieldType` value + field component
- New **optional** `DynamicFormProps` field
- New **optional** `FieldConfig` field
- New `ConditionalRule` operator
- New `createFieldSchema` helper

**PATCH** (0.0.x) — Bug fixes:

- Validation edge case fix
- A11y attribute fix (no prop changes)
- RTL layout fix
- Documentation updates

### Changesets Workflow

```bash
npx changeset
```

```markdown
---
'@ciscode/ui-form-kit': minor
---

Added `asyncDebounceMs` to FieldConfig for per-field async validation debounce control
```

**Create changeset for:** new features, bug fixes, breaking changes, a11y improvements  
**Skip changeset for:** internal refactoring, test-only, docs-only

**Before completing any task:**

- [ ] Code implemented
- [ ] Tests passing (80%+ maintained)
- [ ] JSDoc updated for changed/new public API
- [ ] **Changeset created** ← CRITICAL
- [ ] PR ready

---

## 🔐 Security & Safety

- ✅ Never `dangerouslySetInnerHTML` — all field values are text, never raw HTML
- ✅ `FileField` validates MIME type and file size client-side before any upload callback
- ✅ `useAsyncValidation` must cancel via `AbortController` on unmount and on new input
- ✅ Password fields (`type: 'password'`) must never appear in error logs or debug output
- ✅ Form values must never be stringified into error messages

```tsx
// ❌ WRONG — logs passwords
console.error('Submit failed', { values });

// ✅ CORRECT — log only field names
console.error('Submit failed', { fields: Object.keys(errors) });
```

---

## 🚫 Restrictions — Require Approval

**NEVER without approval:**

- Removing or renaming `DynamicFormProps` fields
- Removing or renaming `FieldConfig` fields
- Changing `FieldType` enum values
- Changing `ConditionalRule` operators
- Changing how Zod errors are mapped to field keys (`core/validator.ts`)
- Adding a new required peer dependency

**CAN do autonomously:**

- New `FieldType` + corresponding field component
- New optional `FieldConfig` or `DynamicFormProps` fields
- Bug fixes (non-breaking)
- Internal refactoring within a single layer
- Test and documentation improvements
- A11y improvements with no prop changes

---

## ✅ Release Checklist

- [ ] `npm run format` — Prettier clean
- [ ] `npm run lint` — ESLint `--max-warnings=0`
- [ ] `npm run typecheck` — TypeScript strict mode passing
- [ ] `npm test` — all Vitest passing
- [ ] `npm run test:cov` — coverage ≥ 80% (branches, functions, lines, statements)
- [ ] `npm run build` — `dist/` has `index.js`, `index.cjs`, `index.d.ts`, `style.css`
- [ ] All new `FieldConfig` options and `DynamicFormProps` documented in README
- [ ] Changeset created
- [ ] Breaking changes highlighted
- [ ] Tested via `npm link` with a real non-trivial form in a host app

---

## 🔄 Development Workflow

### Working on the Library:

1. Clone the repo
2. Create branch: `feature/FORM-XXX-description` from `develop`
3. `npm run dev` — examples app for visual testing
4. Implement with tests
5. **Create changeset**: `npx changeset`
6. Verify release checklist
7. Create PR → `develop`

### Testing in a Host App:

```bash
# In ui-form-kit
npm run build && npm link

# In host app
npm link @ciscode/ui-form-kit
import '@ciscode/ui-form-kit/style.css';

npm unlink @ciscode/ui-form-kit  # when done
```

---

## 🎨 Code Style

- ESLint `--max-warnings=0`, Prettier, TypeScript strict mode
- Functional components only — no class components
- No `React.FC` — always explicit `JSX.Element` return type
- Props destructured in function signature
- Pure functions in `core/` — no closures over mutable state
- `useFormContext()` for deep access — never prop drill form state

---

## 🐛 Error Handling

**Async validators — always cancel on unmount:**

```typescript
// ✅ Correct
export function useAsyncValidation(validate: AsyncValidator, value: unknown, delay = 300) {
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const result = await validate(value, { signal: controller.signal });
      if (!controller.signal.aborted) setError(result);
    }, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);
}
```

**Submit errors — map server errors back to fields, never swallow:**

```tsx
// ✅ Correct — server validation errors surfaced per field
<DynamicForm
  ...
  onSubmit={async (values) => {
    try {
      await saveUser(values);
    } catch (error) {
      if (error instanceof ApiValidationError) {
        // Parent handles mapping — DynamicForm re-renders with errors
        throw error;
      }
    }
  }}
  onError={(errors) => console.warn('Form errors:', Object.keys(errors))}
/>
```

---

## 📋 Summary

**Library Principles:**

1. One API — `DynamicForm` is the only door
2. `DynamicForm` orchestrates — it never contains logic directly
3. Zod is the only validation source of truth
4. Conditional logic is pure and lives in `core/`
5. Async validators always use `AbortController`
6. Accessibility is a constraint, not a feature
7. 80%+ coverage — forms are critical infrastructure

**Layer ownership:**

| Concern                     | Owner                                 |
| --------------------------- | ------------------------------------- |
| TypeScript contracts        | `src/models/` + `src/core/types.ts`   |
| Zod error mapping           | `src/core/validator.ts`               |
| Conditional rule evaluation | `src/core/conditional.ts`             |
| Zod schema helpers          | `src/core/schema-helpers.ts`          |
| Form state management       | `src/hooks/useFormKit.ts`             |
| Array field management      | `src/hooks/useFieldArray.ts`          |
| Multi-step navigation       | `src/hooks/useFormStep.ts`            |
| Async validation            | `src/hooks/useAsyncValidation.ts`     |
| Context propagation         | `src/components/context/`             |
| Field routing + rendering   | `src/components/fields/`              |
| Form orchestration          | `src/components/form/DynamicForm.tsx` |
| All public exports          | `src/index.ts`                        |

**When in doubt:** Ask, don't assume. Forms touch auth, payments, and user data — correctness is mandatory.

---

_Last Updated: February 26, 2026_  
_Version: 0.0.0 (in development)_
