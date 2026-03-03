/**
 * Form component with integrated form state management
 */

import React, { forwardRef, useMemo } from 'react';
import { FormContext } from '../hooks/FormContext';
import {
  useForm,
  type UseFormOptions,
  type FormValues,
  type FormFieldErrors,
} from '../hooks/useForm';

/**
 * Props for Form component
 */
export interface FormProps<T extends FormValues = FormValues> extends Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'onError'
> {
  /** Child elements (optional if using render prop) */
  children?: React.ReactNode;
  /** Form configuration options */
  formOptions?: UseFormOptions<T>;
  /** Submit handler called when form is valid */
  onSubmit?: (data: T) => void | Promise<void>;
  /** Error handler called when form validation fails */
  onError?: (errors: FormFieldErrors) => void;
  /** Custom CSS class name */
  className?: string;
  /** Whether to disable native HTML validation */
  noValidate?: boolean;
  /** Render prop for accessing form state */
  render?: (form: ReturnType<typeof useForm<T>>) => React.ReactNode;
}

/**
 * Form component that provides form state management to child components
 *
 * @example
 * ```tsx
 * <Form
 *   formOptions={{ defaultValues: { email: '' } }}
 *   onSubmit={(data) => console.log(data)}
 *   onError={(errors) => console.log(errors)}
 * >
 *   <Input name="email" label="Email" />
 *   <button type="submit">Submit</button>
 * </Form>
 * ```
 */
function FormInner<T extends FormValues = FormValues>(
  props: FormProps<T>,
  ref: React.ForwardedRef<HTMLFormElement>,
) {
  const {
    children,
    formOptions = {},
    onSubmit,
    onError,
    className = '',
    noValidate = true,
    render,
    ...rest
  } = props;

  // Initialize form state
  const form = useForm<T>(formOptions);

  // Memoize submit handler
  const handleSubmit = useMemo(() => {
    if (!onSubmit) {
      return form.handleSubmit(() => {}, onError);
    }
    return form.handleSubmit(onSubmit, onError);
  }, [form, onSubmit, onError]);

  // Render content
  const content = render ? render(form) : children;

  return (
    <FormContext.Provider value={form as unknown as ReturnType<typeof useForm>}>
      <form
        ref={ref}
        className={`formkit-form ${className}`}
        onSubmit={handleSubmit}
        noValidate={noValidate}
        {...rest}
      >
        {content}
      </form>
    </FormContext.Provider>
  );
}

/**
 * Form component with forwardRef support
 */
export const Form = forwardRef(FormInner) as <T extends FormValues = FormValues>(
  props: FormProps<T> & { ref?: React.ForwardedRef<HTMLFormElement> },
) => React.ReactElement;

// Set display name for debugging
(Form as React.FC).displayName = 'Form';

// Default export for public API
export default Form;
