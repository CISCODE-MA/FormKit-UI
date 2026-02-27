import { describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useForm } from '../useForm';

describe('useForm', () => {
  describe('initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.formState.isSubmitting).toBe(false);
      expect(result.current.formState.isSubmitted).toBe(false);
      expect(result.current.formState.submitCount).toBe(0);
      expect(result.current.formState.isValid).toBe(true);
      expect(result.current.formState.isValidating).toBe(false);
      expect(result.current.formState.isDirty).toBe(false);
      expect(result.current.formState.errors).toEqual({});
      expect(result.current.formState.touched).toEqual({});
    });

    it('initializes with default values', () => {
      const defaultValues = { email: 'test@example.com', name: 'John' };
      const { result } = renderHook(() => useForm({ defaultValues }));

      expect(result.current.formState.values).toEqual(defaultValues);
    });

    it('provides form props', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.formProps).toHaveProperty('onSubmit');
      expect(result.current.formProps.noValidate).toBe(true);
    });
  });

  describe('field registration', () => {
    it('registers a field', () => {
      const { result } = renderHook(() => useForm());

      const mockField = {
        name: 'email',
        getValue: () => 'test@example.com',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      expect(result.current.getValues()).toEqual({ email: 'test@example.com' });
    });

    it('unregisters a field', () => {
      const { result } = renderHook(() => useForm());

      const mockField = {
        name: 'email',
        getValue: () => 'test@example.com',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      act(() => {
        result.current.unregister('email');
      });

      expect(result.current.getValues()).toEqual({});
    });

    it('sets initial value from defaultValues on register', () => {
      const { result } = renderHook(() =>
        useForm({ defaultValues: { email: 'default@example.com' } }),
      );

      const setValue = vi.fn();
      const mockField = {
        name: 'email',
        getValue: () => '',
        setValue,
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      expect(setValue).toHaveBeenCalledWith('default@example.com');
    });
  });

  describe('getValue and getValues', () => {
    it('gets a single field value', () => {
      const { result } = renderHook(() => useForm());

      const mockField = {
        name: 'email',
        getValue: () => 'test@example.com',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      expect(result.current.getValue('email')).toBe('test@example.com');
    });

    it('returns undefined for unregistered field', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.getValue('nonexistent')).toBeUndefined();
    });
  });

  describe('setValue', () => {
    it('sets a field value', () => {
      const { result } = renderHook(() => useForm());

      const setValue = vi.fn();
      const mockField = {
        name: 'email',
        getValue: () => 'updated@example.com',
        setValue,
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      act(() => {
        result.current.setValue('email', 'updated@example.com');
      });

      expect(setValue).toHaveBeenCalledWith('updated@example.com');
    });

    it('touches field when shouldTouch is true', () => {
      const { result } = renderHook(() => useForm());

      const setTouched = vi.fn();
      const mockField = {
        name: 'email',
        getValue: () => '',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched,
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      act(() => {
        result.current.setValue('email', 'new value', { shouldTouch: true });
      });

      expect(setTouched).toHaveBeenCalledWith(true);
    });

    it('validates field when shouldValidate is true', async () => {
      const { result } = renderHook(() => useForm());

      const validate = vi.fn().mockResolvedValue(null);
      const mockField = {
        name: 'email',
        getValue: () => '',
        setValue: vi.fn(),
        validate,
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      await act(async () => {
        result.current.setValue('email', 'new value', { shouldValidate: true });
      });

      await waitFor(() => {
        expect(validate).toHaveBeenCalled();
      });
    });
  });

  describe('setValues', () => {
    it('sets multiple field values', () => {
      const { result } = renderHook(() => useForm());

      const setEmailValue = vi.fn();
      const setNameValue = vi.fn();

      const emailField = {
        name: 'email',
        getValue: () => '',
        setValue: setEmailValue,
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      const nameField = {
        name: 'name',
        getValue: () => '',
        setValue: setNameValue,
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', emailField);
        result.current.register('name', nameField);
      });

      act(() => {
        result.current.setValues({ email: 'test@example.com', name: 'John' });
      });

      expect(setEmailValue).toHaveBeenCalledWith('test@example.com');
      expect(setNameValue).toHaveBeenCalledWith('John');
    });
  });

  describe('error handling', () => {
    it('sets a field error', () => {
      const { result } = renderHook(() => useForm());

      const setError = vi.fn();
      const mockField = {
        name: 'email',
        getValue: () => '',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError,
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      act(() => {
        result.current.setError('email', 'Invalid email');
      });

      expect(setError).toHaveBeenCalledWith('Invalid email');
      expect(result.current.formState.errors).toEqual({ email: 'Invalid email' });
    });

    it('clears a field error', () => {
      const { result } = renderHook(() => useForm());

      const setError = vi.fn();
      const mockField = {
        name: 'email',
        getValue: () => '',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError,
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      act(() => {
        result.current.setError('email', 'Invalid email');
      });

      act(() => {
        result.current.clearError('email');
      });

      expect(result.current.formState.errors).toEqual({ email: null });
    });

    it('clears all errors', () => {
      const { result } = renderHook(() => useForm());

      const emailSetError = vi.fn();
      const nameSetError = vi.fn();

      const emailField = {
        name: 'email',
        getValue: () => '',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: emailSetError,
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      const nameField = {
        name: 'name',
        getValue: () => '',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: nameSetError,
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', emailField);
        result.current.register('name', nameField);
      });

      act(() => {
        result.current.setError('email', 'Invalid email');
        result.current.setError('name', 'Required');
      });

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.formState.errors).toEqual({});
    });
  });

  describe('validation', () => {
    it('triggers validation for all fields', async () => {
      const { result } = renderHook(() => useForm());

      const emailValidate = vi.fn().mockResolvedValue(null);
      const nameValidate = vi.fn().mockResolvedValue(null);

      const emailField = {
        name: 'email',
        getValue: () => 'test@example.com',
        setValue: vi.fn(),
        validate: emailValidate,
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      const nameField = {
        name: 'name',
        getValue: () => 'John',
        setValue: vi.fn(),
        validate: nameValidate,
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', emailField);
        result.current.register('name', nameField);
      });

      let isValid: boolean = false;
      await act(async () => {
        isValid = await result.current.trigger();
      });

      expect(emailValidate).toHaveBeenCalled();
      expect(nameValidate).toHaveBeenCalled();
      expect(isValid).toBe(true);
    });

    it('triggers validation for specific fields', async () => {
      const { result } = renderHook(() => useForm());

      const emailValidate = vi.fn().mockResolvedValue(null);
      const nameValidate = vi.fn().mockResolvedValue(null);

      const emailField = {
        name: 'email',
        getValue: () => 'test@example.com',
        setValue: vi.fn(),
        validate: emailValidate,
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      const nameField = {
        name: 'name',
        getValue: () => 'John',
        setValue: vi.fn(),
        validate: nameValidate,
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', emailField);
        result.current.register('name', nameField);
      });

      await act(async () => {
        await result.current.trigger('email');
      });

      expect(emailValidate).toHaveBeenCalled();
      expect(nameValidate).not.toHaveBeenCalled();
    });

    it('returns false when validation fails', async () => {
      const { result } = renderHook(() => useForm());

      const mockField = {
        name: 'email',
        getValue: () => '',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue('Email is required'),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      let isValid: boolean = true;
      await act(async () => {
        isValid = await result.current.trigger();
      });

      expect(isValid).toBe(false);
      expect(result.current.formState.errors).toEqual({ email: 'Email is required' });
    });

    it('runs form-level validators', async () => {
      const formValidator = vi.fn().mockResolvedValue({ password: 'Passwords must match' });

      const { result } = renderHook(() => useForm({ validators: [formValidator] }));

      const passwordField = {
        name: 'password',
        getValue: () => 'pass123',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('password', passwordField);
      });

      await act(async () => {
        await result.current.trigger();
      });

      expect(formValidator).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('resets form to initial state', () => {
      const { result } = renderHook(() =>
        useForm({ defaultValues: { email: 'initial@example.com' } }),
      );

      const reset = vi.fn();
      const setValue = vi.fn();
      const mockField = {
        name: 'email',
        getValue: () => 'changed@example.com',
        setValue,
        validate: vi.fn().mockResolvedValue(null),
        reset,
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => true,
        isDirty: () => true,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      act(() => {
        result.current.setError('email', 'Some error');
      });

      act(() => {
        result.current.reset();
      });

      expect(reset).toHaveBeenCalled();
      expect(result.current.formState.errors).toEqual({});
      expect(result.current.formState.touched).toEqual({});
      expect(result.current.formState.isSubmitted).toBe(false);
      expect(result.current.formState.submitCount).toBe(0);
    });

    it('resets form with new values', () => {
      const { result } = renderHook(() =>
        useForm<{ email: string }>({ defaultValues: { email: 'initial@example.com' } }),
      );

      const reset = vi.fn();
      const setValue = vi.fn();
      const mockField = {
        name: 'email',
        getValue: () => '',
        setValue,
        validate: vi.fn().mockResolvedValue(null),
        reset,
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      act(() => {
        result.current.reset({ email: 'new@example.com' });
      });

      expect(setValue).toHaveBeenCalledWith('new@example.com');
    });
  });

  describe('handleSubmit', () => {
    it('calls onValid when form is valid', async () => {
      const { result } = renderHook(() => useForm());
      const onValid = vi.fn();

      const mockField = {
        name: 'email',
        getValue: () => 'test@example.com',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      const submitHandler = result.current.handleSubmit(onValid);

      await act(async () => {
        await submitHandler();
      });

      expect(onValid).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result.current.formState.isSubmitted).toBe(true);
      expect(result.current.formState.submitCount).toBe(1);
    });

    it('calls onInvalid when form is invalid', async () => {
      const { result } = renderHook(() => useForm());
      const onValid = vi.fn();
      const onInvalid = vi.fn();

      const mockField = {
        name: 'email',
        getValue: () => '',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue('Email is required'),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      const submitHandler = result.current.handleSubmit(onValid, onInvalid);

      await act(async () => {
        await submitHandler();
      });

      expect(onValid).not.toHaveBeenCalled();
      expect(onInvalid).toHaveBeenCalled();
    });

    it('touches all fields on submit', async () => {
      const { result } = renderHook(() => useForm());

      const setTouched = vi.fn();
      const mockField = {
        name: 'email',
        getValue: () => '',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset: vi.fn(),
        setError: vi.fn(),
        setTouched,
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      const submitHandler = result.current.handleSubmit(() => {});

      await act(async () => {
        await submitHandler();
      });

      expect(setTouched).toHaveBeenCalledWith(true);
      expect(result.current.formState.touched).toEqual({ email: true });
    });

    it('prevents default form event', async () => {
      const { result } = renderHook(() => useForm());
      const onValid = vi.fn();

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.FormEvent;

      const submitHandler = result.current.handleSubmit(onValid);

      await act(async () => {
        await submitHandler(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('resets form after successful submit when configured', async () => {
      const { result } = renderHook(() => useForm({ resetOnSuccessfulSubmit: true }));

      const reset = vi.fn();
      const mockField = {
        name: 'email',
        getValue: () => 'test@example.com',
        setValue: vi.fn(),
        validate: vi.fn().mockResolvedValue(null),
        reset,
        setError: vi.fn(),
        setTouched: vi.fn(),
        isTouched: () => false,
        isDirty: () => false,
      };

      act(() => {
        result.current.register('email', mockField);
      });

      const submitHandler = result.current.handleSubmit(() => {});

      await act(async () => {
        await submitHandler();
      });

      expect(reset).toHaveBeenCalled();
    });
  });

  describe('formState', () => {
    it('correctly computes isValid', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.formState.isValid).toBe(true);

      act(() => {
        result.current.setError('email', 'Invalid email');
      });

      expect(result.current.formState.isValid).toBe(false);
    });
  });
});
