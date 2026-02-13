import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormField } from '../useFormField';

describe('useFormField', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useFormField());

    expect(result.current.value).toBe('');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isPristine).toBe(true);
    expect(result.current.isTouched).toBe(false);
    expect(result.current.isUntouched).toBe(true);
  });

  it('initializes with custom initial value', () => {
    const { result } = renderHook(() => useFormField({ initialValue: 'test' }));

    expect(result.current.value).toBe('test');
  });

  it('updates field state', () => {
    const { result } = renderHook(() => useFormField());

    expect(result.current.state).toEqual({
      value: '',
      touched: false,
      dirty: false,
      disabled: false,
      readOnly: false,
    });
  });

  describe('setValue', () => {
    it('updates value', () => {
      const { result } = renderHook(() => useFormField());

      act(() => {
        result.current.setValue('new value');
      });

      expect(result.current.value).toBe('new value');
    });

    it('marks field as dirty', () => {
      const { result } = renderHook(() => useFormField({ initialValue: 'initial' }));

      act(() => {
        result.current.setValue('changed');
      });

      expect(result.current.isDirty).toBe(true);
      expect(result.current.isPristine).toBe(false);
    });

    it('calls onChange callback', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useFormField({ onChange }));

      act(() => {
        result.current.setValue('test');
      });

      expect(onChange).toHaveBeenCalledWith('test');
    });

    it('applies transform function', () => {
      const transform = (value: unknown) => String(value).toUpperCase();
      const { result } = renderHook(() => useFormField({ transform }));

      act(() => {
        result.current.setValue('hello');
      });

      expect(result.current.value).toBe('HELLO');
    });
  });

  describe('handleChange', () => {
    it('handles text input change', () => {
      const { result } = renderHook(() => useFormField());

      const event = {
        target: { value: 'new text', type: 'text' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.value).toBe('new text');
    });

    it('handles checkbox change', () => {
      const { result } = renderHook(() => useFormField());

      const event = {
        target: { checked: true, type: 'checkbox' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.value).toBe(true);
    });

    it('handles number input change', () => {
      const { result } = renderHook(() => useFormField());

      const event = {
        target: { value: '42', type: 'number' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.value).toBe(42);
    });

    it('handles empty number input', () => {
      const { result } = renderHook(() => useFormField());

      const event = {
        target: { value: '', type: 'number' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.value).toBe('');
    });

    it('handles textarea change', () => {
      const { result } = renderHook(() => useFormField());

      const event = {
        target: { value: 'textarea text' },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.value).toBe('textarea text');
    });

    it('handles select change', () => {
      const { result } = renderHook(() => useFormField());

      const event = {
        target: { value: 'option1' },
      } as React.ChangeEvent<HTMLSelectElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.value).toBe('option1');
    });

    it('ignores change when disabled', () => {
      const { result } = renderHook(() => useFormField({ disabled: true }));

      const event = {
        target: { value: 'new value', type: 'text' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.value).toBe('');
    });

    it('ignores change when read-only', () => {
      const { result } = renderHook(() => useFormField({ readOnly: true }));

      const event = {
        target: { value: 'new value', type: 'text' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleChange(event);
      });

      expect(result.current.value).toBe('');
    });
  });

  describe('handleBlur', () => {
    it('marks field as touched', () => {
      const { result } = renderHook(() => useFormField());

      expect(result.current.isTouched).toBe(false);

      act(() => {
        result.current.handleBlur();
      });

      expect(result.current.isTouched).toBe(true);
      expect(result.current.isUntouched).toBe(false);
    });

    it('calls onBlur callback', () => {
      const onBlur = vi.fn();
      const { result } = renderHook(() => useFormField({ onBlur }));

      act(() => {
        result.current.handleBlur();
      });

      expect(onBlur).toHaveBeenCalled();
    });

    it('only marks touched once', () => {
      const onBlur = vi.fn();
      const { result } = renderHook(() => useFormField({ onBlur }));

      act(() => {
        result.current.handleBlur();
        result.current.handleBlur();
      });

      expect(onBlur).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleFocus', () => {
    it('calls onFocus callback', () => {
      const onFocus = vi.fn();
      const { result } = renderHook(() => useFormField({ onFocus }));

      act(() => {
        result.current.handleFocus();
      });

      expect(onFocus).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('restores initial value', () => {
      const { result } = renderHook(() => useFormField({ initialValue: 'initial' }));

      act(() => {
        result.current.setValue('changed');
      });

      expect(result.current.value).toBe('changed');

      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toBe('initial');
    });

    it('resets touched state', () => {
      const { result } = renderHook(() => useFormField());

      act(() => {
        result.current.setTouched(true);
      });

      expect(result.current.isTouched).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.isTouched).toBe(false);
    });

    it('calls onChange with initial value', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useFormField({ initialValue: 'initial', onChange }));

      act(() => {
        result.current.setValue('changed');
      });

      onChange.mockClear();

      act(() => {
        result.current.reset();
      });

      expect(onChange).toHaveBeenCalledWith('initial');
    });
  });

  describe('setTouched', () => {
    it('sets touched state', () => {
      const { result } = renderHook(() => useFormField());

      act(() => {
        result.current.setTouched(true);
      });

      expect(result.current.isTouched).toBe(true);

      act(() => {
        result.current.setTouched(false);
      });

      expect(result.current.isTouched).toBe(false);
    });
  });

  describe('dirty state', () => {
    it('is not dirty when value equals initial value', () => {
      const { result } = renderHook(() => useFormField({ initialValue: 'test' }));

      expect(result.current.isDirty).toBe(false);
      expect(result.current.isPristine).toBe(true);
    });

    it('is dirty when value differs from initial value', () => {
      const { result } = renderHook(() => useFormField({ initialValue: 'test' }));

      act(() => {
        result.current.setValue('changed');
      });

      expect(result.current.isDirty).toBe(true);
      expect(result.current.isPristine).toBe(false);
    });

    it('becomes pristine again when set back to initial', () => {
      const { result } = renderHook(() => useFormField({ initialValue: 'test' }));

      act(() => {
        result.current.setValue('changed');
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.setValue('test');
      });

      expect(result.current.isDirty).toBe(false);
      expect(result.current.isPristine).toBe(true);
    });
  });
});
