# Component Development Instructions - FormKit-UI

> **Purpose**: React component development standards for form UI components.

---

## 🎯 Component Architecture

### Component Structure
```
ComponentName/
  ├── ComponentName.tsx       # Main component
  ├── ComponentName.test.tsx  # Tests
  ├── ComponentName.types.ts  # Props & types
  ├── ComponentName.styles.ts # Styled components (if using)
  └── index.ts                # Exports
```

### Form Component Template
```typescript
import React, { forwardRef } from 'react';
import { FormFieldProps } from './FormField.types';

/**
 * Reusable form field with validation and error display
 * @param {FormFieldProps} props - Component props
 * @returns {JSX.Element} Rendered form field
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, required, ...inputProps }, ref) => {
    return (
      <div className="form-field">
        <label>
          {label} {required && <span aria-label="required">*</span>}
          <input ref={ref} aria-invalid={!!error} {...inputProps} />
        </label>
        {error && (
          <span className="error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
```

---

## 📝 Props Standards

### Form Component Props
```typescript
export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label text */
  label: string;
  /** Error message to display */
  error?: string;
  /** Is this field required? */
  required?: boolean;
  /** Field description/help text */
  description?: string;
}
```

### Required Props Documentation
- ✅ JSDoc for all props
- ✅ Validation rules clearly stated
- ✅ onChange/onBlur signatures with examples
- ✅ Default values documented

---

## ♿ Accessibility (A11y)

### Form Accessibility
```typescript
// ✅ Good - Accessible form field
<div className="field">
  <label htmlFor="email">
    Email <span aria-label="required">*</span>
  </label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <span id="email-error" role="alert">
      {errors.email}
    </span>
  )}
</div>

// ❌ Bad - Inaccessible
<div>
  <div>Email</div>
  <input type="text" />
  <div style={{ color: 'red' }}>{error}</div>
</div>
```

### Required Accessibility Features
- ✅ `<label>` with `htmlFor` attribute
- ✅ `aria-required` for required fields
- ✅ `aria-invalid` for fields with errors
- ✅ `aria-describedby` linking to error messages
- ✅ `role="alert"` for error messages
- ✅ Keyboard navigation (Tab, Enter, Escape)

---

## 🎨 Theming & Styling

### Theme Support for Forms
```typescript
import { useTheme } from '../context/ThemeContext';

export const ThemedInput: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <input
      style={{
        border: `1px solid ${theme.colors.border}`,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    />
  );
};
```

### Form Error States
```typescript
const errorStyles = {
  borderColor: theme.colors.error,
  backgroundColor: theme.colors.errorBackground,
};

const successStyles = {
  borderColor: theme.colors.success,
};
```

---

## 🧪 Form Component Testing

### Test Coverage Requirements
```typescript
describe('FormField', () => {
  it('renders label and input', () => {
    render(<FormField label="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<FormField label="Email" error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('marks required fields', () => {
    render(<FormField label="Password" required />);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-required', 'true');
  });

  it('calls onChange when value changes', async () => {
    const onChange = jest.fn();
    render(<FormField label="Name" onChange={onChange} />);
    
    await userEvent.type(screen.getByLabelText('Name'), 'John');
    expect(onChange).toHaveBeenCalled();
  });

  it('supports ref forwarding', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<FormField label="Test" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
```

### Validation Testing
```typescript
it('validates email format', async () => {
  const { rerender } = render(
    <FormField label="Email" type="email" value="invalid" error={undefined} />
  );
  
  // Trigger validation
  fireEvent.blur(screen.getByLabelText('Email'));
  
  // Update with error
  rerender(
    <FormField label="Email" type="email" value="invalid" error="Invalid email format" />
  );
  
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid email format');
});
```

---

## 🔄 Form State Management

### Controlled Components
```typescript
const [value, setValue] = useState('');

<FormField
  label="Username"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### React Hook Form Integration
```typescript
import { useForm, Controller } from 'react-hook-form';

const { control, handleSubmit } = useForm();

<Controller
  name="email"
  control={control}
  rules={{ required: 'Email is required' }}
  render={({ field, fieldState }) => (
    <FormField
      {...field}
      label="Email"
      error={fieldState.error?.message}
    />
  )}
/>
```

### Form Submission
```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await submitForm(data);
  } catch (error) {
    setError('submission', {
      type: 'manual',
      message: 'Failed to submit form'
    });
  }
};
```

---

## 📦 Component Exports

### Public API (index.ts)
```typescript
// Export form components
export { FormField } from './FormField';
export { FormSelect } from './FormSelect';
export { FormCheckbox } from './FormCheckbox';
export { FormRadio } from './FormRadio';

// Export types
export type { FormFieldProps } from './FormField.types';
export type { FormSelectProps } from './FormSelect.types';
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ Uncontrolled Forms
```typescript
// Bad - No state management
<input type="text" defaultValue="initial" />

// Good - Controlled component
const [value, setValue] = useState('initial');
<input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
```

### ❌ Missing Error Handling
```typescript
// Bad - Silent failures
<form onSubmit={handleSubmit}>

// Good - Error boundaries and user feedback
<form onSubmit={async (e) => {
  e.preventDefault();
  try {
    await handleSubmit(data);
  } catch (error) {
    showErrorToast(error.message);
  }
}}>
```

### ❌ Inline Validation on Every Keystroke
```typescript
// Bad - Validates on every keystroke (annoying UX)
<input onChange={(e) => validateEmail(e.target.value)} />

// Good - Validate on blur or submit
<input onBlur={(e) => validateEmail(e.target.value)} />
```

---

## 📋 Pre-Commit Checklist

- [ ] Form fields have proper labels
- [ ] Required fields marked with `aria-required`
- [ ] Error messages use `role="alert"`
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Form submission prevents default behavior
- [ ] Loading states shown during async operations
- [ ] Success/error feedback provided to user
- [ ] Tests cover validation logic
- [ ] Ref forwarding implemented where needed
- [ ] TypeScript types for all props

---

## 📚 Resources

- [React Hook Form Docs](https://react-hook-form.com/)
- [Form Accessibility](https://www.w3.org/WAI/tutorials/forms/)
- [ARIA Form Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/form/)
- [HTML Form Validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
