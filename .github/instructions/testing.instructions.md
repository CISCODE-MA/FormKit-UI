# Testing Instructions - UI Kit Module

> **Last Updated**: February 2026  
> **Testing Framework**: Vitest + React Testing Library  
> **Coverage Target**: 80%+

---

## 🎯 Testing Philosophy

### Test User Behavior, Not Implementation

**✅ Test what users see and do:**

```typescript
it('should show error message when form is invalid', async () => {
  render(<LoginForm />);

  const submitButton = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(submitButton);

  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});
```

**❌ Don't test implementation details:**

```typescript
it('should update state when input changes', () => {
  const { rerender } = render(<Component />);
  // Testing internal state = implementation detail
  expect(component.state.value).toBe('test');
});
```

---

## 📊 Coverage Targets

| Layer          | Minimum Coverage | Priority    |
| -------------- | ---------------- | ----------- |
| **Hooks**      | 90%+             | 🔴 Critical |
| **Components** | 80%+             | 🟡 High     |
| **Utils**      | 85%+             | 🟡 High     |
| **Context**    | 90%+             | 🔴 Critical |

**Overall Target**: 80%+

---

## 📁 Test File Organization

### File Placement

Tests live next to components:

```
src/components/Button/
  ├── Button.tsx
  └── Button.test.tsx  ← Same directory
```

### Naming Convention

| Code File     | Test File          |
| ------------- | ------------------ |
| `Button.tsx`  | `Button.test.tsx`  |
| `use-auth.ts` | `use-auth.test.ts` |

---

## 🎭 Test Structure

### Component Test Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: /click me/i }))
      .toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Test Template

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './use-counter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });
});
```

---

## 🎭 Testing Patterns

### Querying Elements

**Prefer accessible queries:**

```typescript
// ✅ BEST - By role (accessible)
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });

// ✅ GOOD - By label text
screen.getByLabelText(/email/i);

// ⚠️ OK - By test ID (last resort)
screen.getByTestId('submit-button');

// ❌ BAD - By class or internal details
container.querySelector('.button-class');
```

### User Interactions

**Use userEvent over fireEvent:**

```typescript
import userEvent from '@testing-library/user-event';

// ✅ GOOD - userEvent (realistic)
await userEvent.click(button);
await userEvent.type(input, 'test@example.com');

// ❌ BAD - fireEvent (synthetic)
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'test' } });
```

### Async Testing

```typescript
// ✅ Wait for element to appear
const message = await screen.findByText(/success/i);

// ✅ Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

// ✅ Wait for assertion
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});
```

---

## 🧪 Test Categories

### 1. Component Tests

**What to test:**

- ✅ Rendering with different props
- ✅ User interactions (click, type, etc.)
- ✅ Conditional rendering
- ✅ Error states

**Example:**

```typescript
describe('LoginForm', () => {
  it('should display error for empty email', async () => {
    render(<LoginForm />);

    const submitBtn = screen.getByRole('button', { name: /login/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('should call onSuccess when login succeeds', async () => {
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    await userEvent.type(
      screen.getByLabelText(/email/i),
      'test@example.com'
    );
    await userEvent.type(
      screen.getByLabelText(/password/i),
      'password123'
    );
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com'
      }));
    });
  });
});
```

### 2. Hook Tests

**What to test:**

- ✅ Initial state
- ✅ State updates
- ✅ Side effects
- ✅ Cleanup

**Example:**

```typescript
describe('useAuth', () => {
  it('should login user', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual({
      email: 'test@example.com',
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should cleanup on unmount', () => {
    const cleanup = vi.fn();
    vi.spyOn(global, 'removeEventListener').mockImplementation(cleanup);

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(cleanup).toHaveBeenCalled();
  });
});
```

### 3. Accessibility Tests

**Use jest-axe:**

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<LoginForm />);

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 🎨 Mocking

### Mocking Context

```typescript
const mockAuthContext = {
  user: { id: '1', email: 'test@example.com' },
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true,
};

const wrapper = ({ children }) => (
  <AuthContext.Provider value={mockAuthContext}>
    {children}
  </AuthContext.Provider>
);

render(<Component />, { wrapper });
```

### Mocking API Calls

```typescript
import { vi } from 'vitest';

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'mocked' }),
  }),
);
```

---

## 🧪 Test Commands

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode (Vitest)
npm run test:ui
```

---

## ⚠️ Common Mistakes

### 1. Not Waiting for Async Updates

```typescript
// ❌ BAD - Missing await
it('test', () => {
  userEvent.click(button);
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// ✅ GOOD - Properly awaited
it('test', async () => {
  await userEvent.click(button);
  expect(await screen.findByText(/success/i)).toBeInTheDocument();
});
```

### 2. Testing Implementation Details

```typescript
// ❌ BAD - Testing internal state
expect(component.state.isOpen).toBe(true);

// ✅ GOOD - Testing visible behavior
expect(screen.getByRole('dialog')).toBeVisible();
```

### 3. Not Cleaning Up

```typescript
// ✅ Always use cleanup
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

---

## 📋 Pre-Merge Checklist

- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] No skipped tests (it.skip)
- [ ] No focused tests (it.only)
- [ ] Accessible queries used
- [ ] userEvent for interactions
- [ ] Async operations properly awaited
- [ ] Accessibility tested
- [ ] Mocks cleaned up
