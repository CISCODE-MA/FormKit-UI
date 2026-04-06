---
'@ciscode/ui-form-kit': minor
---

Refactor codebase to align with copilot-instructions.md guidelines

**Architecture Changes:**

- Restructured to Component-Hook-Model (CHM) architecture
- Created `src/core/` for framework-free pure functions (validator, conditional, schema-helpers)
- Created `src/models/` for TypeScript contracts with zero runtime logic
- Restricted public API exports in `src/index.ts`

**Accessibility Improvements:**

- Fixed RadioGroupField to use proper `role="radiogroup"` with `aria-labelledby`
- Fixed SwitchField to use proper `role="switch"` with keyboard support (Enter/Space)

**Bug Fixes:**

- Fixed `handleSubmit` to mark fields with errors as touched on validation failure
- Fixed `useAsyncValidation` to properly handle DOMException AbortError

**Testing:**

- Added comprehensive test suite with 192 tests
- Achieved 80%+ coverage: 94.64% statements, 83.77% branches, 83.33% functions
- Coverage tests for core/, hooks/, and components/

**Documentation:**

- Enhanced JSDoc for FieldType enum values
- Enhanced JSDoc for ConditionalOperator types
