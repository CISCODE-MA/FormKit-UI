# @ciscode/ui-form-kit

FormKit-UI is a reusable React + TypeScript form library that provides ready-to-use field components, form orchestration helpers, and hooks for building complex forms quickly.

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=CISCODE-MA_FormKit-UI&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=CISCODE-MA_FormKit-UI)
[![npm version](https://img.shields.io/npm/v/@ciscode/ui-form-kit.svg)](https://www.npmjs.com/package/@ciscode/ui-form-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)

## Highlights

- Rich field set: text, textarea, select, multiselect, date, time, datetime, phone, file, OTP, slider, range slider, tags, rating, checkbox, switch
- Dynamic form rendering with schema-driven configuration
- Built-in i18n support (`en`, `fr`) with custom translation overrides
- Validation helpers and conditional field rendering
- ESM + CJS + types output for package consumers

## Install

```bash
npm install @ciscode/ui-form-kit
```

Peer dependencies:

- `react >= 18`
- `react-dom >= 18`

## Project Layout

- `src/components` UI fields, form container, layout primitives, and contexts
- `src/hooks` reusable hooks (`useFormKit`, `useFormContext`, `useI18n`, etc.)
- `src/core` core helpers (validators, conditional logic, i18n utilities)
- `src/locales` translation dictionaries
- `src/models` type models and configuration contracts
- `src/index.ts` public API surface

## Quality Standards

Local quality gates expected before merge:

- `npm run lint`
- `npm run typecheck`
- `npm run test:cov`
- `npm run build`

Coverage thresholds are enforced in Vitest:

- statements: 80%
- branches: 80%
- functions: 80%
- lines: 80%

## Scripts

- `npm run clean` remove build and coverage artifacts
- `npm run build` build package output and bundled styles
- `npm run lint` run ESLint
- `npm run typecheck` run TypeScript checks
- `npm test` run Vitest
- `npm run test:cov` run tests with coverage thresholds
- `npm run verify` run lint + typecheck + coverage
- `npm run format` / `npm run format:write` run Prettier
- `npx changeset` create a changeset

## Release Flow

- Work from feature branches off `develop`
- Merge into `develop`
- Add changesets for user-facing changes
- Promote `develop` to `master`
- Publish tagged versions
