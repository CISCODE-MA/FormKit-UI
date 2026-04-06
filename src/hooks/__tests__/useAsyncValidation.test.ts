/**
 * Tests for hooks/useAsyncValidation.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsyncValidation } from '../useAsyncValidation';

describe('useAsyncValidation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('initializes with no error and not validating', () => {
      const validate = vi.fn().mockResolvedValue(null);

      const { result } = renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'test',
        }),
      );

      expect(result.current.error).toBeNull();
      expect(result.current.isValidating).toBe(false);
    });
  });

  describe('debounce behavior', () => {
    it('does not validate before debounce time', async () => {
      const validate = vi.fn().mockResolvedValue(null);

      renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'test',
          debounceMs: 300,
        }),
      );

      // Advance less than debounce time
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(validate).not.toHaveBeenCalled();
    });

    it('validates after debounce time', async () => {
      const validate = vi.fn().mockResolvedValue(null);

      renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'test@example.com',
          debounceMs: 300,
        }),
      );

      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      expect(validate).toHaveBeenCalledWith('test@example.com', {
        signal: expect.any(AbortSignal),
      });
    });

    it('uses default debounce of 300ms', async () => {
      const validate = vi.fn().mockResolvedValue(null);

      renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'test',
        }),
      );

      await act(async () => {
        vi.advanceTimersByTime(250);
      });

      expect(validate).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(validate).toHaveBeenCalled();
    });
  });

  describe('validation result', () => {
    it('sets error when validator returns error message', async () => {
      const validate = vi.fn().mockResolvedValue('Email already taken');

      const { result } = renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'test@example.com',
          debounceMs: 100,
        }),
      );

      await act(async () => {
        vi.advanceTimersByTime(150);
        await vi.runAllTimersAsync();
      });

      expect(result.current.error).toBe('Email already taken');
    });

    it('clears error when validator returns null', async () => {
      const validate = vi.fn().mockResolvedValue(null);

      const { result } = renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'valid@example.com',
          debounceMs: 100,
        }),
      );

      await act(async () => {
        vi.advanceTimersByTime(150);
        await vi.runAllTimersAsync();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('isValidating state', () => {
    it('sets isValidating to true during validation', async () => {
      let resolveValidation: (value: string | null) => void;
      const validationPromise = new Promise<string | null>((resolve) => {
        resolveValidation = resolve;
      });
      const validate = vi.fn().mockReturnValue(validationPromise);

      const { result } = renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'test',
          debounceMs: 100,
        }),
      );

      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      // Should be validating
      expect(result.current.isValidating).toBe(true);

      await act(async () => {
        resolveValidation!(null);
      });

      expect(result.current.isValidating).toBe(false);
    });
  });

  describe('enabled option', () => {
    it('skips validation when disabled', async () => {
      const validate = vi.fn().mockResolvedValue('error');

      const { result } = renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'test',
          enabled: false,
          debounceMs: 100,
        }),
      );

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(validate).not.toHaveBeenCalled();
      expect(result.current.error).toBeNull();
      expect(result.current.isValidating).toBe(false);
    });

    it('returns null error when disabled even if internal state has error', () => {
      const validate = vi.fn().mockResolvedValue('error');

      const { result } = renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'test',
          enabled: false,
        }),
      );

      // Error should be null when disabled
      expect(result.current.error).toBeNull();
    });
  });

  describe('abort behavior', () => {
    it('aborts previous validation when value changes', async () => {
      const validate = vi.fn((_value, { signal }) => {
        return new Promise<string | null>((resolve, reject) => {
          const timeoutId = setTimeout(() => resolve(null), 500);
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      });

      const { rerender } = renderHook(
        ({ value }) =>
          useAsyncValidation({
            validate,
            value,
            debounceMs: 100,
          }),
        { initialProps: { value: 'first' } },
      );

      // Start first validation
      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      expect(validate).toHaveBeenCalledTimes(1);

      // Change value before first completes
      rerender({ value: 'second' });

      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      expect(validate).toHaveBeenCalledTimes(2);
    });
  });

  describe('triggerValidation', () => {
    it('manually triggers validation', async () => {
      const validate = vi.fn().mockResolvedValue('manual error');

      const { result } = renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'test',
          debounceMs: 1000, // Long debounce
        }),
      );

      // Trigger immediately without waiting for debounce
      await act(async () => {
        result.current.triggerValidation();
        await vi.runAllTimersAsync();
      });

      expect(validate).toHaveBeenCalled();
      expect(result.current.error).toBe('manual error');
    });
  });

  describe('error handling', () => {
    it('sets generic error message when validator throws non-abort error', async () => {
      const validate = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'test',
          debounceMs: 100,
        }),
      );

      await act(async () => {
        vi.advanceTimersByTime(150);
        await vi.runAllTimersAsync();
      });

      expect(result.current.error).toBe('Validation failed');
    });

    it('ignores AbortError from DOMException', async () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      const validate = vi.fn().mockRejectedValue(abortError);

      const { result } = renderHook(() =>
        useAsyncValidation({
          validate,
          value: 'test',
          debounceMs: 100,
        }),
      );

      await act(async () => {
        vi.advanceTimersByTime(150);
        await vi.runAllTimersAsync();
      });

      // Should not set error for abort
      expect(result.current.error).toBeNull();
    });
  });
});
