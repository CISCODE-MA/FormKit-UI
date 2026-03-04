/**
 * Tests for useFormContext hook
 */

import { describe, it, expect, vi, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FormKitProvider, useFormKitContext } from '../../components/context/FormKitContext';
import { useFormContext } from '../useFormContext';
import type { FormValues, FieldValue } from '../../core/types';
import type { FormContextValue } from '../../models/FormState';

// Type for mock context that allows access to mock methods
interface MockContext {
  getValue: Mock<(key: keyof FormValues) => FieldValue>;
  setValue: Mock<(key: keyof FormValues, value: FieldValue) => void>;
  getError: Mock<(key: keyof FormValues) => string | null>;
  setError: Mock<(key: keyof FormValues, error: string | null) => void>;
  getTouched: Mock<(key: keyof FormValues) => boolean>;
  setTouched: Mock<(key: keyof FormValues, touched: boolean) => void>;
  getValues: Mock<() => Partial<FormValues>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Mock context value
const createMockContext = (): MockContext => ({
  getValue: vi.fn((_key: keyof FormValues) => `value-${String(_key)}` as FieldValue),
  setValue: vi.fn(),
  getError: vi.fn((): string | null => null),
  setError: vi.fn(),
  getTouched: vi.fn(() => false),
  setTouched: vi.fn(),
  getValues: vi.fn((): Partial<FormValues> => ({ name: 'test' })),
  isSubmitting: false,
  isValid: true,
});

// Helper to cast mock context for FormKitProvider
const createWrapper =
  (mockContext: MockContext) =>
  ({ children }: { children: ReactNode }) => (
    <FormKitProvider value={mockContext as unknown as FormContextValue}>{children}</FormKitProvider>
  );

describe('useFormKitContext', () => {
  it('returns context value when used within FormKitProvider', () => {
    const mockContext = createMockContext();
    const { result } = renderHook(() => useFormKitContext(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current).toBe(mockContext);
  });

  it('throws error when used outside FormKitProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useFormKitContext());
    }).toThrow('useFormKitContext must be used within a DynamicForm');

    consoleSpy.mockRestore();
  });

  it('provides getValue function', () => {
    const mockContext = createMockContext();
    mockContext.getValue.mockReturnValue('test-value');

    const { result } = renderHook(() => useFormKitContext(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.getValue('name')).toBe('test-value');
    expect(mockContext.getValue).toHaveBeenCalledWith('name');
  });

  it('provides setValue function', () => {
    const mockContext = createMockContext();

    const { result } = renderHook(() => useFormKitContext(), {
      wrapper: createWrapper(mockContext),
    });

    act(() => {
      result.current.setValue('name', 'new-value');
    });

    expect(mockContext.setValue).toHaveBeenCalledWith('name', 'new-value');
  });

  it('provides getError function', () => {
    const mockContext = createMockContext();
    mockContext.getError.mockReturnValue('Field is required');

    const { result } = renderHook(() => useFormKitContext(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.getError('name')).toBe('Field is required');
  });

  it('provides setError function', () => {
    const mockContext = createMockContext();

    const { result } = renderHook(() => useFormKitContext(), {
      wrapper: createWrapper(mockContext),
    });

    act(() => {
      result.current.setError('name', 'Custom error');
    });

    expect(mockContext.setError).toHaveBeenCalledWith('name', 'Custom error');
  });

  it('provides getTouched and setTouched functions', () => {
    const mockContext = createMockContext();
    mockContext.getTouched.mockReturnValue(true);

    const { result } = renderHook(() => useFormKitContext(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.getTouched('name')).toBe(true);

    act(() => {
      result.current.setTouched('name', true);
    });

    expect(mockContext.setTouched).toHaveBeenCalledWith('name', true);
  });

  it('provides getValues function', () => {
    const mockContext = createMockContext();
    mockContext.getValues.mockReturnValue({ name: 'test', email: 'test@example.com' });

    const { result } = renderHook(() => useFormKitContext(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.getValues()).toEqual({ name: 'test', email: 'test@example.com' });
  });

  it('provides isSubmitting status', () => {
    const mockContext = { ...createMockContext(), isSubmitting: true };

    const { result } = renderHook(() => useFormKitContext(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.isSubmitting).toBe(true);
  });

  it('provides isValid status', () => {
    const mockContext = { ...createMockContext(), isValid: false };

    const { result } = renderHook(() => useFormKitContext(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current.isValid).toBe(false);
  });
});

describe('useFormContext (wrapper)', () => {
  it('re-exports useFormKitContext', () => {
    const mockContext = createMockContext();

    const { result } = renderHook(() => useFormContext(), {
      wrapper: createWrapper(mockContext),
    });

    expect(result.current).toBe(mockContext);
  });

  it('throws error when used outside FormKitProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useFormContext());
    }).toThrow();

    consoleSpy.mockRestore();
  });
});
