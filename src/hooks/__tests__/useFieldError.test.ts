import { describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFieldError } from '../useFieldError';
import type { FormattedError } from '../../errors/types';

describe('useFieldError', () => {
  it('initializes with no error', () => {
    const { result } = renderHook(() => useFieldError());

    expect(result.current.error).toBe(null);
    expect(result.current.errors).toEqual([]);
    expect(result.current.hasError).toBe(false);
  });

  it('initializes with initial error', () => {
    const { result } = renderHook(() => useFieldError({ initialError: 'Initial error' }));

    expect(result.current.error).toBe('Initial error');
    expect(result.current.errors).toEqual(['Initial error']);
    expect(result.current.hasError).toBe(true);
  });

  describe('setError', () => {
    it('sets error message', () => {
      const { result } = renderHook(() => useFieldError());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');
      expect(result.current.errors).toEqual(['Test error']);
      expect(result.current.hasError).toBe(true);
    });

    it('clears error with null', () => {
      const { result } = renderHook(() => useFieldError({ initialError: 'Error' }));

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.errors).toEqual([]);
      expect(result.current.hasError).toBe(false);
    });

    it('calls onErrorChange callback', () => {
      const onErrorChange = vi.fn();
      const { result } = renderHook(() => useFieldError({ onErrorChange }));

      act(() => {
        result.current.setError('Test error');
      });

      expect(onErrorChange).toHaveBeenCalledWith('Test error');
    });

    it('replaces existing error', () => {
      const { result } = renderHook(() => useFieldError({ initialError: 'First error' }));

      act(() => {
        result.current.setError('Second error');
      });

      expect(result.current.error).toBe('Second error');
      expect(result.current.errors).toEqual(['Second error']);
    });
  });

  describe('setErrors', () => {
    it('sets multiple errors', () => {
      const { result } = renderHook(() => useFieldError());

      act(() => {
        result.current.setErrors(['Error 1', 'Error 2', 'Error 3']);
      });

      expect(result.current.error).toBe('Error 1');
      expect(result.current.errors).toEqual(['Error 1', 'Error 2', 'Error 3']);
      expect(result.current.hasError).toBe(true);
    });

    it('clears errors with empty array', () => {
      const { result } = renderHook(() => useFieldError({ initialError: 'Error' }));

      act(() => {
        result.current.setErrors([]);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.errors).toEqual([]);
      expect(result.current.hasError).toBe(false);
    });

    it('calls onErrorChange with first error', () => {
      const onErrorChange = vi.fn();
      const { result } = renderHook(() => useFieldError({ onErrorChange }));

      act(() => {
        result.current.setErrors(['Error 1', 'Error 2']);
      });

      expect(onErrorChange).toHaveBeenCalledWith('Error 1');
    });
  });

  describe('addError', () => {
    it('adds error to empty errors', () => {
      const { result } = renderHook(() => useFieldError());

      act(() => {
        result.current.addError('First error');
      });

      expect(result.current.error).toBe('First error');
      expect(result.current.errors).toEqual(['First error']);
    });

    it('adds error to existing errors', () => {
      const { result } = renderHook(() => useFieldError({ initialError: 'First error' }));

      act(() => {
        result.current.addError('Second error');
      });

      expect(result.current.error).toBe('First error');
      expect(result.current.errors).toEqual(['First error', 'Second error']);
    });

    it('calls onErrorChange callback', () => {
      const onErrorChange = vi.fn();
      const { result } = renderHook(() => useFieldError({ onErrorChange }));

      act(() => {
        result.current.addError('Error');
      });

      expect(onErrorChange).toHaveBeenCalledWith('Error');
    });
  });

  describe('clearError', () => {
    it('clears all errors', () => {
      const { result } = renderHook(() => useFieldError({ initialError: 'Error' }));

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.errors).toEqual([]);
      expect(result.current.hasError).toBe(false);
    });

    it('calls onErrorChange with null', () => {
      const onErrorChange = vi.fn();
      const { result } = renderHook(() => useFieldError({ initialError: 'Error', onErrorChange }));

      act(() => {
        result.current.clearError();
      });

      expect(onErrorChange).toHaveBeenCalledWith(null);
    });
  });

  describe('setFormattedErrors', () => {
    it('sets errors from formatted error objects', () => {
      const { result } = renderHook(() => useFieldError());

      const formattedErrors: FormattedError[] = [
        { field: 'email', message: 'Invalid email', severity: 'error' },
        { field: 'email', message: 'Required', severity: 'error' },
      ];

      act(() => {
        result.current.setFormattedErrors(formattedErrors);
      });

      expect(result.current.error).toBe('Invalid email');
      expect(result.current.errors).toEqual(['Invalid email', 'Required']);
    });

    it('filters errors by field name', () => {
      const { result } = renderHook(() => useFieldError({ fieldName: 'email' }));

      const formattedErrors: FormattedError[] = [
        { field: 'email', message: 'Invalid email', severity: 'error' },
        { field: 'password', message: 'Too short', severity: 'error' },
        { field: 'email', message: 'Required', severity: 'error' },
      ];

      act(() => {
        result.current.setFormattedErrors(formattedErrors);
      });

      expect(result.current.error).toBe('Invalid email');
      expect(result.current.errors).toEqual(['Invalid email', 'Required']);
    });

    it('clears errors when no matching field', () => {
      const { result } = renderHook(() =>
        useFieldError({ fieldName: 'username', initialError: 'Old error' }),
      );

      const formattedErrors: FormattedError[] = [
        { field: 'email', message: 'Invalid email', severity: 'error' },
      ];

      act(() => {
        result.current.setFormattedErrors(formattedErrors);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.errors).toEqual([]);
    });

    it('handles empty formatted errors', () => {
      const { result } = renderHook(() => useFieldError({ initialError: 'Old error' }));

      act(() => {
        result.current.setFormattedErrors([]);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.errors).toEqual([]);
    });
  });

  describe('autoDismiss', () => {
    it('auto-dismisses error after delay', async () => {
      const { result } = renderHook(() => useFieldError({ autoDismiss: 50 }));

      act(() => {
        result.current.setError('Auto-dismiss error');
      });

      expect(result.current.error).toBe('Auto-dismiss error');

      await waitFor(
        () => {
          expect(result.current.error).toBe(null);
        },
        { timeout: 300 },
      );
    });

    it('calls onErrorChange when auto-dismissing', async () => {
      const onErrorChange = vi.fn();
      const { result } = renderHook(() => useFieldError({ autoDismiss: 100, onErrorChange }));

      act(() => {
        result.current.setError('Auto-dismiss error');
      });

      onErrorChange.mockClear();

      await waitFor(
        () => {
          expect(onErrorChange).toHaveBeenCalledWith(null);
        },
        { timeout: 200 },
      );
    });

    it('cancels previous timer when setting new error', async () => {
      const { result } = renderHook(() => useFieldError({ autoDismiss: 100 }));

      act(() => {
        result.current.setError('First error');
      });

      // Set new error before first timer completes
      await new Promise((resolve) => setTimeout(resolve, 50));

      act(() => {
        result.current.setError('Second error');
      });

      expect(result.current.error).toBe('Second error');

      // Wait for the second timer to complete
      await waitFor(
        () => {
          expect(result.current.error).toBe(null);
        },
        { timeout: 200 },
      );
    });

    it('does not auto-dismiss when cleared manually', async () => {
      const onErrorChange = vi.fn();
      const { result } = renderHook(() => useFieldError({ autoDismiss: 100, onErrorChange }));

      act(() => {
        result.current.setError('Error');
      });

      act(() => {
        result.current.clearError();
      });

      onErrorChange.mockClear();

      // Wait to ensure no auto-dismiss happens
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(onErrorChange).not.toHaveBeenCalled();
      expect(result.current.error).toBe(null);
    });
  });

  describe('hasError', () => {
    it('returns true when error exists', () => {
      const { result } = renderHook(() => useFieldError({ initialError: 'Error' }));

      expect(result.current.hasError).toBe(true);
    });

    it('returns false when no error', () => {
      const { result } = renderHook(() => useFieldError());

      expect(result.current.hasError).toBe(false);
    });

    it('updates when error changes', () => {
      const { result } = renderHook(() => useFieldError());

      expect(result.current.hasError).toBe(false);

      act(() => {
        result.current.setError('Error');
      });

      expect(result.current.hasError).toBe(true);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.hasError).toBe(false);
    });
  });
});
