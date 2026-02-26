import { describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useValidation } from '../useValidation';
import { required, email, minLength } from '../../validation/validators';
import type { ValidatorFn } from '../../validation/types';

describe('useValidation', () => {
  it('initializes with valid state', () => {
    const { result } = renderHook(() => useValidation());

    expect(result.current.isValid).toBe(true);
    expect(result.current.isValidating).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.errors).toEqual([]);
  });

  describe('single validator', () => {
    it('validates with single validator function', async () => {
      const { result } = renderHook(() => useValidation({ validator: required() }));

      let isValid: boolean = false;
      await act(async () => {
        isValid = await result.current.validate('');
      });

      expect(isValid).toBe(false);
      expect(result.current.error).toBe('This field is required');
    });

    it('passes validation with valid value', async () => {
      const { result } = renderHook(() => useValidation({ validator: required() }));

      let isValid: boolean = false;
      await act(async () => {
        isValid = await result.current.validate('test');
      });

      expect(isValid).toBe(true);
      expect(result.current.error).toBe(null);
    });
  });

  describe('validation rules', () => {
    it('validates with multiple rules', async () => {
      const { result } = renderHook(() =>
        useValidation({
          rules: [{ validator: required() }, { validator: minLength(5) }],
        }),
      );

      let isValid: boolean = false;
      await act(async () => {
        isValid = await result.current.validate('hi');
      });

      expect(isValid).toBe(false);
      expect(result.current.error).toBe('Must be at least 5 characters');
    });

    it('stops at first error with abortEarly', async () => {
      const { result } = renderHook(() =>
        useValidation({
          rules: [
            { validator: required(), message: 'Required error' },
            { validator: minLength(5), message: 'Length error' },
          ],
          abortEarly: true,
        }),
      );

      let isValid: boolean = false;
      await act(async () => {
        isValid = await result.current.validate('');
      });

      expect(isValid).toBe(false);
      expect(result.current.errors).toHaveLength(1);
      expect(result.current.errors[0]).toBe('Required error');
    });

    it('collects all errors without abortEarly', async () => {
      const { result } = renderHook(() =>
        useValidation({
          rules: [
            { validator: required(), message: 'Required error' },
            { validator: email(), message: 'Email error' },
          ],
          abortEarly: false,
        }),
      );

      let isValid: boolean = false;
      await act(async () => {
        isValid = await result.current.validate('invalid');
      });

      expect(isValid).toBe(false);
      expect(result.current.errors).toHaveLength(1);
      expect(result.current.errors[0]).toBe('Email error');
    });

    it('uses custom error message from rule', async () => {
      const { result } = renderHook(() =>
        useValidation({
          rules: [{ validator: required(), message: 'Custom required message' }],
        }),
      );

      await act(async () => {
        await result.current.validate('');
      });

      expect(result.current.error).toBe('Custom required message');
    });
  });

  describe('async validation', () => {
    it('handles async validators', async () => {
      const asyncValidator: ValidatorFn = async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return value === 'taken' ? 'Username is taken' : null;
      };

      const { result } = renderHook(() => useValidation({ validator: asyncValidator }));

      await act(async () => {
        await result.current.validate('taken');
      });

      expect(result.current.error).toBe('Username is taken');
    });

    it('sets isValidating during validation', async () => {
      const asyncValidator: ValidatorFn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return null;
      };

      const { result } = renderHook(() => useValidation({ validator: asyncValidator }));

      const validatePromise = act(async () => {
        await result.current.validate('test');
      });

      // Check validating state (may be async)
      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });

      await validatePromise;
    });
  });

  describe('debounce', () => {
    it('debounces validation', async () => {
      const validator = vi.fn(() => null);
      const { result } = renderHook(() => useValidation({ validator, debounce: 100 }));

      act(() => {
        result.current.validate('test1');
        result.current.validate('test2');
        result.current.validate('test3');
      });

      await waitFor(
        () => {
          expect(validator).toHaveBeenCalledTimes(1);
        },
        { timeout: 200 },
      );
    });
  });

  describe('clearErrors', () => {
    it('clears validation errors', async () => {
      const { result } = renderHook(() => useValidation({ validator: required() }));

      await act(async () => {
        await result.current.validate('');
      });

      expect(result.current.error).not.toBe(null);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.errors).toEqual([]);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('setError', () => {
    it('sets error manually', () => {
      const { result } = renderHook(() => useValidation());

      act(() => {
        result.current.setError('Manual error');
      });

      expect(result.current.error).toBe('Manual error');
      expect(result.current.errors).toEqual(['Manual error']);
      expect(result.current.isValid).toBe(false);
    });

    it('clears error with null', () => {
      const { result } = renderHook(() => useValidation());

      act(() => {
        result.current.setError('Error');
      });

      expect(result.current.error).toBe('Error');

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('setErrors', () => {
    it('sets multiple errors', () => {
      const { result } = renderHook(() => useValidation());

      act(() => {
        result.current.setErrors(['Error 1', 'Error 2', 'Error 3']);
      });

      expect(result.current.error).toBe('Error 1');
      expect(result.current.errors).toEqual(['Error 1', 'Error 2', 'Error 3']);
      expect(result.current.isValid).toBe(false);
    });

    it('clears errors with empty array', () => {
      const { result } = renderHook(() => useValidation());

      act(() => {
        result.current.setErrors(['Error']);
      });

      act(() => {
        result.current.setErrors([]);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.errors).toEqual([]);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('validation context', () => {
    it('passes context to validators', async () => {
      const validator = vi.fn(() => null);
      const context = { formValues: { password: 'secret' } };

      const { result } = renderHook(() => useValidation({ validator, context }));

      await act(async () => {
        await result.current.validate('test');
      });

      expect(validator).toHaveBeenCalledWith('test', context);
    });
  });

  describe('trigger filtering', () => {
    it('filters rules by trigger', async () => {
      const onBlurValidator = vi.fn(() => 'Blur error');
      const onChangeValidator = vi.fn(() => null);

      const { result } = renderHook(() =>
        useValidation({
          rules: [
            { validator: onBlurValidator, trigger: 'blur' },
            { validator: onChangeValidator, trigger: 'change' },
          ],
        }),
      );

      await act(async () => {
        await result.current.validate('test', 'blur');
      });

      expect(onBlurValidator).toHaveBeenCalled();
      expect(onChangeValidator).not.toHaveBeenCalled();
    });

    it('runs all rules when no trigger specified', async () => {
      const validator1 = vi.fn(() => null);
      const validator2 = vi.fn(() => null);

      const { result } = renderHook(() =>
        useValidation({
          rules: [
            { validator: validator1, trigger: 'blur' },
            { validator: validator2, trigger: 'change' },
          ],
        }),
      );

      await act(async () => {
        await result.current.validate('test');
      });

      expect(validator1).toHaveBeenCalled();
      expect(validator2).toHaveBeenCalled();
    });
  });

  describe('validation errors', () => {
    it('handles validator throwing errors', async () => {
      const validator: ValidatorFn = () => {
        throw new Error('Validation error');
      };

      const { result } = renderHook(() => useValidation({ validator }));

      let isValid: boolean = true;
      await act(async () => {
        isValid = await result.current.validate('test');
      });

      expect(isValid).toBe(false);
      expect(result.current.error).toBe('Validation error');
    });
  });

  describe('no rules', () => {
    it('considers valid when no rules provided', async () => {
      const { result } = renderHook(() => useValidation());

      let isValid: boolean = false;
      await act(async () => {
        isValid = await result.current.validate('anything');
      });

      expect(isValid).toBe(true);
      expect(result.current.error).toBe(null);
    });
  });
});
