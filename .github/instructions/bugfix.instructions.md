# Bugfix Instructions - UI Kit Module

> **Last Updated**: February 2026

---

## 🔍 Bug Investigation Process

### Phase 1: Reproduce

**Before writing any code:**

1. **Understand the issue** - Read bug report carefully
2. **Reproduce locally** - Create minimal reproduction
3. **Verify it's a bug** - Not expected behavior
4. **Check browser compatibility** - Test across browsers

**Create failing test FIRST:**

```typescript
describe('Bug: Button not disabled when loading', () => {
  it('should disable button during loading', () => {
    render(<Button isLoading>Click</Button>);

    // This SHOULD pass but currently FAILS
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Phase 2: Identify Root Cause

**Investigation tools:**

- **React DevTools** - Inspect component tree
- **Console logs** - Debug state changes
- **Debugger** - Breakpoints in code
- **Browser DevTools** - Check DOM/styles

```typescript
// Debug component props/state
useEffect(() => {
  console.log('Props changed:', props);
}, [props]);
```

### Phase 3: Understand Impact

**Critical questions:**

- Which browsers affected?
- Does it break accessibility?
- Is there a workaround?
- Does it affect other components?

---

## 🐛 Common Bug Categories

### 1. State Management Issues

| Bug Type          | Symptoms                  | Solution                   |
| ----------------- | ------------------------- | -------------------------- |
| **Stale closure** | Old values in callback    | Update dependencies        |
| **Infinite loop** | Component re-renders      | Fix useEffect dependencies |
| **Lost state**    | State resets unexpectedly | Check component key        |

**Example fix:**

```typescript
// ❌ BUG - Stale closure
const [count, setCount] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1); // ❌ Always uses initial count
  }, 1000);
  return () => clearInterval(timer);
}, []); // Missing count dependency

// ✅ FIX - Functional update
useEffect(() => {
  const timer = setInterval(() => {
    setCount((prev) => prev + 1); // ✅ Uses current count
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

### 2. useEffect Issues

| Bug Type               | Symptoms             | Solution             |
| ---------------------- | -------------------- | -------------------- |
| **Memory leak**        | Performance degrades | Add cleanup function |
| **Missing cleanup**    | Side effects persist | Return cleanup       |
| **Wrong dependencies** | Unexpected behavior  | Fix dependency array |

**Example fix:**

```typescript
// ❌ BUG - No cleanup
useEffect(() => {
  const subscription = api.subscribe(handleData);
}, []);

// ✅ FIX - Cleanup on unmount
useEffect(() => {
  const subscription = api.subscribe(handleData);
  return () => subscription.unsubscribe();
}, []);
```

### 3. Event Handler Issues

| Bug Type               | Symptoms            | Solution                   |
| ---------------------- | ------------------- | -------------------------- |
| **Handler not called** | Click doesn't work  | Check event binding        |
| **Multiple calls**     | Handler fires twice | Remove duplicate listeners |
| **Wrong event**        | Unexpected behavior | Use correct event type     |

**Example fix:**

```typescript
// ❌ BUG - Handler called immediately
<button onClick={handleClick()}> // ❌ Calls on render

// ✅ FIX - Pass function reference
<button onClick={handleClick}> // ✅ Calls on click
<button onClick={() => handleClick(arg)}> // ✅ With arguments
```

### 4. Rendering Issues

| Bug Type               | Symptoms             | Solution                |
| ---------------------- | -------------------- | ----------------------- |
| **Conditional render** | Component disappears | Fix condition logic     |
| **Key prop**           | Wrong items update   | Use stable unique keys  |
| **Forced re-render**   | Performance issues   | Memoize expensive calcs |

**Example fix:**

```typescript
// ❌ BUG - Index as key
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}

// ✅ FIX - Unique stable key
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

### 5. Accessibility Bugs

| Bug Type            | Symptoms             | Solution              |
| ------------------- | -------------------- | --------------------- |
| **Missing ARIA**    | Screen reader issues | Add ARIA attributes   |
| **No keyboard nav** | Can't use keyboard   | Add keyboard handlers |
| **Poor contrast**   | Hard to read         | Fix colors            |

**Example fix:**

```typescript
// ❌ BUG - Div as button (not accessible)
<div onClick={handleClick}>
  Submit
</div>

// ✅ FIX - Proper button element
<button onClick={handleClick} aria-label="Submit form">
  Submit
</button>
```

---

## 🔧 Fix Implementation Process

### 1. Write Failing Test

```typescript
it('should fix the bug', async () => {
  render(<Component />);

  await userEvent.click(screen.getByRole('button'));

  expect(screen.getByText(/expected/i)).toBeInTheDocument();
});
```

### 2. Implement Fix

```typescript
// Fix the component
export function Component() {
  // Corrected implementation
  return <div>Fixed!</div>;
}
```

### 3. Verify Test Passes

```bash
npm test -- Component.test.tsx
```

### 4. Test in Browser

```bash
npm run dev
# Manually test the fix
```

### 5. Update Documentation

```typescript
/**
 * Component that was buggy
 *
 * @fixed v1.2.3 - Fixed click handler issue
 */
export function Component(props: Props): JSX.Element;
```

---

## ⚠️ Common Gotchas

### 1. Prop Mutation

```typescript
// ❌ Bug - Mutating props
const sortedItems = props.items.sort(); // Mutates!

// ✅ Fix - Create copy
const sortedItems = [...props.items].sort();
```

### 2. Incorrect Comparison

```typescript
// ❌ Bug - Object comparison
if (user === prevUser) {
} // Always false (different references)

// ✅ Fix - Compare values
if (user.id === prevUser.id) {
}
```

### 3. Missing Null Checks

```typescript
// ❌ Bug - No null check
return user.profile.name; // Crashes if profile is null

// ✅ Fix - Optional chaining
return user?.profile?.name ?? 'Unknown';
```

---

## 📋 Bugfix Checklist

- [ ] Bug reproduced in browser
- [ ] Failing test created
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] All tests pass
- [ ] Manually tested in browser
- [ ] Accessibility verified
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] No regression
