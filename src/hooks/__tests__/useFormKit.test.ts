/**
 * Tests for hooks/useFormKit.ts
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { z } from 'zod';
import { useFormKit } from '../useFormKit';

describe('useFormKit', () => {
  describe('initialization', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: 'John', age: 25 },
        }),
      );

      expect(result.current.values).toEqual({ name: 'John', age: 25 });
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(result.current.isDirty).toBe(false);
    });

    it('initializes with empty default values', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: {},
        }),
      );

      expect(result.current.values).toEqual({});
    });
  });

  describe('getValue', () => {
    it('returns value for existing field', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: 'John' },
        }),
      );

      expect(result.current.getValue('name')).toBe('John');
    });

    it('returns undefined for non-existent field', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: 'John' },
        }),
      );

      expect(result.current.getValue('email' as 'name')).toBeUndefined();
    });
  });

  describe('setValue', () => {
    it('updates field value', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: '' },
        }),
      );

      act(() => {
        result.current.setValue('name', 'Jane');
      });

      expect(result.current.values.name).toBe('Jane');
    });

    it('clears error when value changes', () => {
      const schema = z.object({ name: z.string().min(2) });
      const { result } = renderHook(() =>
        useFormKit({
          schema,
          defaultValues: { name: '' },
        }),
      );

      // Trigger validation to create error
      act(() => {
        result.current.setError('name', 'Name too short');
      });

      expect(result.current.errors.name).toBe('Name too short');

      // Change value should clear error
      act(() => {
        result.current.setValue('name', 'John');
      });

      expect(result.current.errors.name).toBeUndefined();
    });

    it('marks form as dirty', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: 'Initial' },
        }),
      );

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.setValue('name', 'Changed');
      });

      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('getError / setError', () => {
    it('returns null for field without error', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: '' },
        }),
      );

      expect(result.current.getError('name')).toBeNull();
    });

    it('sets and retrieves error', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { email: '' },
        }),
      );

      act(() => {
        result.current.setError('email', 'Invalid email');
      });

      expect(result.current.getError('email')).toBe('Invalid email');
      expect(result.current.isValid).toBe(false);
    });

    it('clears error when set to null', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { email: '' },
        }),
      );

      act(() => {
        result.current.setError('email', 'Invalid email');
      });

      act(() => {
        result.current.setError('email', null);
      });

      expect(result.current.getError('email')).toBeNull();
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('getTouched / setTouched', () => {
    it('returns false for untouched field', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: '' },
        }),
      );

      expect(result.current.getTouched('name')).toBe(false);
    });

    it('sets and retrieves touched state', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: '' },
        }),
      );

      act(() => {
        result.current.setTouched('name', true);
      });

      expect(result.current.getTouched('name')).toBe(true);
    });
  });

  describe('getValues / setValues', () => {
    it('getValues returns all values', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { a: 1, b: 2 },
        }),
      );

      expect(result.current.getValues()).toEqual({ a: 1, b: 2 });
    });

    it('setValues updates multiple fields', () => {
      const { result } = renderHook(() =>
        useFormKit<{ name: string; email: string }>({
          defaultValues: { name: '', email: '' },
        }),
      );

      act(() => {
        result.current.setValues({ name: 'John', email: 'john@test.com' });
      });

      expect(result.current.values).toEqual({ name: 'John', email: 'john@test.com' });
    });
  });

  describe('validate', () => {
    it('returns true when no schema', async () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: '' },
        }),
      );

      let isValid: boolean;
      await act(async () => {
        isValid = await result.current.validate();
      });

      expect(isValid!).toBe(true);
    });

    it('returns true for valid data', async () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
      });

      const { result } = renderHook(() =>
        useFormKit({
          schema,
          defaultValues: { name: 'John', email: 'john@test.com' },
        }),
      );

      let isValid: boolean;
      await act(async () => {
        isValid = await result.current.validate();
      });

      expect(isValid!).toBe(true);
      expect(result.current.errors).toEqual({});
    });

    it('returns false and sets errors for invalid data', async () => {
      const schema = z.object({
        name: z.string().min(2, 'Name too short'),
        email: z.string().email('Invalid email'),
      });

      const { result } = renderHook(() =>
        useFormKit({
          schema,
          defaultValues: { name: 'A', email: 'invalid' },
        }),
      );

      let isValid: boolean;
      await act(async () => {
        isValid = await result.current.validate();
      });

      expect(isValid!).toBe(false);
      expect(result.current.errors.name).toBe('Name too short');
      expect(result.current.errors.email).toBe('Invalid email');
    });
  });

  describe('validateField', () => {
    it('returns null when no schema', async () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: '' },
        }),
      );

      let error: string | null;
      await act(async () => {
        error = await result.current.validateField('name');
      });

      expect(error!).toBeNull();
    });

    it('validates single field', async () => {
      const schema = z.object({
        name: z.string().min(2, 'Name too short'),
      });

      const { result } = renderHook(() =>
        useFormKit({
          schema,
          defaultValues: { name: 'A' },
        }),
      );

      let error: string | null;
      await act(async () => {
        error = await result.current.validateField('name');
      });

      expect(error!).toBe('Name too short');
    });
  });

  describe('reset', () => {
    it('resets values to defaults', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: 'Initial' },
        }),
      );

      act(() => {
        result.current.setValue('name', 'Changed');
      });

      expect(result.current.values.name).toBe('Changed');

      act(() => {
        result.current.reset();
      });

      expect(result.current.values.name).toBe('Initial');
    });

    it('clears errors on reset', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: '' },
        }),
      );

      act(() => {
        result.current.setError('name', 'Error');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.errors).toEqual({});
    });

    it('clears touched on reset', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: '' },
        }),
      );

      act(() => {
        result.current.setTouched('name', true);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.touched).toEqual({});
    });
  });

  describe('handleSubmit', () => {
    it('calls onSubmit with valid data', async () => {
      const schema = z.object({ name: z.string().min(2) });
      const onSubmit = vi.fn();

      const { result } = renderHook(() =>
        useFormKit({
          schema,
          defaultValues: { name: 'John' },
        }),
      );

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(onSubmit)(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
    });

    it('calls onError when validation fails', async () => {
      const schema = z.object({
        name: z.string().min(2, 'Name too short'),
      });
      const onSubmit = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useFormKit({
          schema,
          defaultValues: { name: 'A' },
        }),
      );

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(onSubmit, onError)(mockEvent);
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith({ name: 'Name too short' });
    });

    it('sets isSubmitting during async submission', async () => {
      const schema = z.object({ name: z.string() });
      let submitResolve: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        submitResolve = resolve;
      });

      const onSubmit = vi.fn().mockReturnValue(submitPromise);

      const { result } = renderHook(() =>
        useFormKit({
          schema,
          defaultValues: { name: 'Test' },
        }),
      );

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      let submitAction: Promise<void>;
      act(() => {
        submitAction = result.current.handleSubmit(onSubmit)(mockEvent);
      });

      // isSubmitting should be true during submission
      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        submitResolve!();
        await submitAction!;
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('context', () => {
    it('provides context value for FormKitProvider', () => {
      const { result } = renderHook(() =>
        useFormKit({
          defaultValues: { name: 'Test' },
        }),
      );

      expect(result.current.context).toBeDefined();
      expect(result.current.context.getValue).toBe(result.current.getValue);
      expect(result.current.context.setValue).toBe(result.current.setValue);
      expect(result.current.context.getError).toBe(result.current.getError);
      expect(result.current.context.getValues).toBe(result.current.getValues);
    });
  });
});
