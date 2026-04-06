# Features Instructions - UI Kit Module

> **Last Updated**: February 2026

---

## 🚀 Before Starting Any Feature

### Pre-Implementation Checklist

- [ ] **Check existing components** - Avoid duplication
- [ ] **Understand scope** - Breaking change? (MAJOR version)
- [ ] **Review component API** - Changes to props?
- [ ] **Check dependencies** - Need new npm packages?
- [ ] **Plan backwards compatibility** - Can users upgrade?
- [ ] **Consider accessibility** - WCAG compliance?

### Questions to Ask

1. **Already exists?**

   ```bash
   grep -r "ComponentName" src/
   ```

2. **Right abstraction level?**
   - Too specific?
   - Reusable enough?

3. **Impact assessment?**
   - Breaking → MAJOR version
   - New component → MINOR version
   - Enhancement → PATCH version

---

## 📋 Implementation Workflow

```
1. Design → 2. Implement → 3. Test → 4. Document → 5. Release
```

### 1️⃣ Design Phase

- [ ] Define component props interface
- [ ] Plan accessibility requirements
- [ ] Design keyboard interactions
- [ ] Consider responsive behavior

### 2️⃣ Implementation Phase

- [ ] Create feature branch: `feature/ComponentName`
- [ ] Implement component
- [ ] Add TypeScript types
- [ ] Add accessibility attributes
- [ ] Handle edge cases
- [ ] Add prop validation

### 3️⃣ Testing Phase

- [ ] Unit tests for logic
- [ ] Component interaction tests
- [ ] Accessibility tests
- [ ] Edge case tests
- [ ] Coverage >= 80%

### 4️⃣ Documentation Phase

- [ ] JSDoc for component
- [ ] Props documentation
- [ ] Usage examples in README
- [ ] Update CHANGELOG
- [ ] Add Storybook story (if applicable)

### 5️⃣ Release Phase

- [ ] Bump version: `npm version [minor|major]`
- [ ] Build library
- [ ] Create PR to `develop`
- [ ] Release from `master`

---

## ➕ Adding New Component

### Example: Badge Component

**Step 1: Design Props Interface**

```typescript
// src/components/Badge/Badge.tsx
export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'error';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom CSS class */
  className?: string;
  /** Accessibility label */
  'aria-label'?: string;
}
```

**Step 2: Implement Component**

````typescript
/**
 * Badge component for displaying status or counts
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error">3</Badge>
 * ```
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  'aria-label': ariaLabel,
}: BadgeProps): JSX.Element {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className || ''}
      `}
      aria-label={ariaLabel}
      role="status"
    >
      {children}
    </span>
  );
}
````

**Step 3: Write Tests**

```typescript
// src/components/Badge/Badge.test.tsx
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('should render with text', () => {
    render(<Badge>Active</Badge>);

    expect(screen.getByRole('status')).toHaveTextContent('Active');
  });

  it('should apply variant styles', () => {
    render(<Badge variant="success">Success</Badge>);

    const badge = screen.getByRole('status');
    expect(badge.className).toMatch(/bg-green-100/);
  });

  it('should apply size classes', () => {
    render(<Badge size="lg">Large</Badge>);

    const badge = screen.getByRole('status');
    expect(badge.className).toMatch(/text-base/);
  });

  it('should accept custom className', () => {
    render(<Badge className="custom-class">Test</Badge>);

    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<Badge>Test</Badge>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Step 4: Export Component**

```typescript
// src/components/Badge/index.ts
export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

// src/index.ts
export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';
```

---

## 🪝 Adding New Hook

### Example: useLocalStorage Hook

**Step 1: Implement Hook**

````typescript
// src/hooks/use-local-storage.ts
import { useState, useEffect } from 'react';

/**
 * Hook for syncing state with localStorage
 *
 * @param key - localStorage key
 * @param initialValue - Default value
 * @returns Tuple of [value, setValue]
 *
 * @example
 * ```tsx
 * const [name, setName] = useLocalStorage<string>('name', 'Guest');
 * ```
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
````

**Step 2: Write Tests**

```typescript
// src/hooks/use-local-storage.test.ts
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './use-local-storage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'default'));

    expect(result.current[0]).toBe('default');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test')).toBe('"updated"');
  });

  it('should read existing value from localStorage', () => {
    localStorage.setItem('test', '"existing"');

    const { result } = renderHook(() => useLocalStorage('test', 'default'));

    expect(result.current[0]).toBe('existing');
  });
});
```

---

## 🎨 Styling Guidelines

### Headless Components

```typescript
// ✅ Accept className prop
interface MyComponentProps {
  className?: string;
}

// ✅ Allow style customization
<div className={className} style={style}>
```

### CSS Variables

```typescript
// ✅ Support theming via CSS vars
<button style={{ '--primary-color': color }}>
```

---

## ♿ Accessibility Requirements

### ARIA Attributes

```typescript
<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  role="button"
>
```

### Keyboard Navigation

```typescript
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
```

---

## 📦 Exporting Features

**Update exports:**

```typescript
// src/index.ts
export { Badge } from './components/Badge';
export { useLocalStorage } from './hooks/use-local-storage';
export type { BadgeProps } from './components/Badge';
```

---

## ⚠️ Breaking Changes

### Migration Guide Example

````markdown
## Breaking Changes in v2.0.0

### Button Component

**Before (v1.x):**

```tsx
<Button type="primary">Click</Button>
```
````

**After (v2.0):**

```tsx
<Button variant="primary">Click</Button>
```

Rename `type` prop to `variant` for consistency.

```

---

## 📋 Feature Completion Checklist

- [ ] Component/hook implemented
- [ ] TypeScript types defined
- [ ] Tests written (80%+ coverage)
- [ ] Accessibility verified
- [ ] JSDoc added
- [ ] README with examples
- [ ] CHANGELOG updated
- [ ] Exports updated
- [ ] Breaking changes documented
- [ ] Build succeeds
- [ ] PR created
```
