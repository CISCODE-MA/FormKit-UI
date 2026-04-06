# General Instructions - UI Kit Module

> **Last Updated**: February 2026

---

## 📦 Package Overview

### What is this module?

This is a production-ready React component library providing reusable UI components for modern applications.

**Type**: React Component Library  
**Framework**: React 18+, TypeScript 5+  
**Build**: Vite/tsup  
**Distribution**: NPM package  
**License**: MIT

### Key Characteristics

| Characteristic    | Description                                |
| ----------------- | ------------------------------------------ |
| **Architecture**  | Component-based, hooks-first, composable   |
| **Styling**       | Headless/unstyled by default, customizable |
| **TypeScript**    | Fully typed, strict mode enabled           |
| **Accessibility** | WCAG 2.1 AA compliant                      |
| **Testing**       | Target: 80%+ coverage                      |

---

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────┐
│        COMPONENT LAYER                  │
│  ┌──────────────────────────────────┐   │
│  │   React Components               │   │
│  │   - UI Logic                     │   │
│  │   - Event Handling               │   │
│  │   - Accessibility                │   │
│  └──────────┬───────────────────────┘   │
└─────────────┼───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│           HOOKS LAYER                   │
│  ┌──────────────────────────────────┐   │
│  │    Custom React Hooks            │   │
│  │    - State Management            │   │
│  │    - Side Effects                │   │
│  └──────────┬───────────────────────┘   │
└─────────────┼───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│          CONTEXT LAYER                  │
│  ┌──────────────────────────────────┐   │
│  │     Context Providers            │   │
│  │     - Global State               │   │
│  └──────────┬───────────────────────┘   │
└─────────────┼───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│           TYPES LAYER                   │
│  ┌──────────────────────────────────┐   │
│  │    TypeScript Interfaces         │   │
│  │    - Props Types                 │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/
├── components/        # React components
│   ├── Component/
│   │   ├── Component.tsx
│   │   ├── Component.test.tsx
│   │   └── index.ts
├── hooks/            # Custom hooks
│   ├── use-hook.ts
│   └── use-hook.test.ts
├── context/          # Context providers
│   └── Provider.tsx
├── types/            # TypeScript types
│   └── types.ts
├── utils/            # Helper functions
└── index.ts          # Public API exports
```

---

## 📝 Coding Standards

### Component Patterns

```typescript
// ✅ Functional components with TypeScript
interface MyComponentProps {
  /** Component title */
  title: string;
  /** Optional callback */
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return <div onClick={onAction}>{title}</div>;
}

// ❌ Class components
class MyComponent extends React.Component { }
```

### Prop Naming

```typescript
// ✅ Descriptive, semantic names
interface ButtonProps {
  onClick: () => void;
  isDisabled?: boolean;
  variant?: 'primary' | 'secondary';
}

// ❌ Generic, unclear names
interface ButtonProps {
  handler: any;
  disabled: boolean;
  type: string;
}
```

### TypeScript Strictness

```typescript
// ✅ Explicit types
const [count, setCount] = useState<number>(0);

// ❌ Implicit any
const [count, setCount] = useState();
```

---

## 🎨 Styling Philosophy

### Headless by Default

Components should accept `className` for styling:

```typescript
interface ComponentProps {
  className?: string;
}

export function Component({ className }: ComponentProps) {
  return <div className={className}>Content</div>;
}
```

### CSS Variables for Theming

```typescript
// Support CSS custom properties
<div style={{ '--primary-color': color }}>
```

---

## ♿ Accessibility Requirements

### ARIA Attributes

```typescript
// ✅ Include ARIA for screen readers
<button aria-label="Close dialog" onClick={onClose}>
  ×
</button>

// ❌ Missing accessibility
<div onClick={onClose}>×</div>
```

### Keyboard Navigation

```typescript
// ✅ Handle keyboard events
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
```

---

## 🧪 Testing Philosophy

- **Target**: 80%+ code coverage
- **Test user interactions**, not implementation
- **Mock external dependencies**
- **Test accessibility** with jest-axe

---

## 📚 Documentation Requirements

### Component JSDoc

````typescript
/**
 * Button component with multiple variants
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => console.log('Clicked')}>
 *   Click Me
 * </Button>
 * ```
 */
export function Button(props: ButtonProps): JSX.Element;
````

### Props Interface Documentation

```typescript
export interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Click event handler */
  onClick?: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Disable button interaction */
  disabled?: boolean;
}
```

---

## 🚀 Development Workflow

1. **Design** - Plan component API and props
2. **Implement** - Write component following standards
3. **Test** - Unit tests with React Testing Library
4. **Document** - JSDoc and examples
5. **Release** - Semantic versioning

---

## ⚠️ Common Gotchas

### 1. Event Handlers

```typescript
// ✅ Use optional callbacks
onClick?.();

// ❌ Call without checking
onClick();
```

### 2. useEffect Cleanup

```typescript
// ✅ Clean up side effects
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  return () => clearTimeout(timer);
}, []);

// ❌ Missing cleanup
useEffect(() => {
  setTimeout(() => {}, 1000);
}, []);
```

### 3. Key Props in Lists

```typescript
// ✅ Unique, stable keys
{items.map(item => <div key={item.id}>{item.name}</div>)}

// ❌ Index as key
{items.map((item, i) => <div key={i}>{item.name}</div>)}
```

---

## 📦 Build Configuration

Ensure proper build setup:

```json
{
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": ["dist"]
}
```

---

## 🔍 Testing Commands

```bash
npm test                    # Run tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

---

## 📋 Pre-Release Checklist

- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] JSDoc complete
- [ ] README with examples
- [ ] CHANGELOG updated
- [ ] No console.log statements
- [ ] Accessibility tested
- [ ] TypeScript strict mode
- [ ] Build outputs verified
