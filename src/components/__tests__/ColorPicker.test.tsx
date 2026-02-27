import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ColorPicker,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  parseColor,
  isLightColor,
  DEFAULT_SWATCHES,
} from '../ColorPicker';

describe('ColorPicker', () => {
  describe('basic rendering', () => {
    it('renders with name', () => {
      render(<ColorPicker name="color" />);
      const input = document.querySelector('input[name="color"]');
      expect(input).toBeInTheDocument();
    });

    it('renders color preview', () => {
      render(<ColorPicker name="color" />);
      const preview = screen.getByRole('img');
      expect(preview).toBeInTheDocument();
    });

    it('renders hex input', () => {
      render(<ColorPicker name="color" />);
      const hexInput = screen.getByLabelText('Hex color value');
      expect(hexInput).toBeInTheDocument();
    });

    it('renders default color', () => {
      render(<ColorPicker name="color" defaultValue="#ff0000" />);
      const hexInput = screen.getByLabelText('Hex color value');
      expect(hexInput).toHaveValue('#ff0000');
    });

    it('renders with label', () => {
      render(<ColorPicker name="color" label="Pick a color" />);
      expect(screen.getByText('Pick a color')).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<ColorPicker name="color" label="Color" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('hex input', () => {
    it('updates color on valid hex input', async () => {
      const handleChange = vi.fn();
      render(<ColorPicker name="color" onChange={handleChange} />);

      const hexInput = screen.getByLabelText('Hex color value');
      await userEvent.clear(hexInput);
      await userEvent.type(hexInput, '#ff5500');

      expect(handleChange).toHaveBeenCalledWith('#ff5500');
    });

    it('adds hash if missing', async () => {
      render(<ColorPicker name="color" />);

      const hexInput = screen.getByLabelText('Hex color value');
      await userEvent.clear(hexInput);
      await userEvent.type(hexInput, 'ff5500');

      expect(hexInput).toHaveValue('#ff5500');
    });

    it('shows placeholder', () => {
      render(<ColorPicker name="color" placeholder="#123456" />);
      const hexInput = screen.getByLabelText('Hex color value');
      expect(hexInput).toHaveAttribute('placeholder', '#123456');
    });

    it('has max length of 7', () => {
      render(<ColorPicker name="color" />);
      const hexInput = screen.getByLabelText('Hex color value');
      expect(hexInput).toHaveAttribute('maxLength', '7');
    });

    it('reverts invalid hex on blur', async () => {
      render(<ColorPicker name="color" defaultValue="#123456" />);

      const hexInput = screen.getByLabelText('Hex color value');
      await userEvent.clear(hexInput);
      await userEvent.type(hexInput, 'invalid');
      fireEvent.blur(hexInput);

      expect(hexInput).toHaveValue('#123456');
    });
  });

  describe('color swatches', () => {
    it('renders default swatches', () => {
      render(<ColorPicker name="color" showSwatches />);
      const swatchList = screen.getByRole('listbox');
      expect(swatchList).toBeInTheDocument();
    });

    it('renders custom swatches', () => {
      const customSwatches = ['#ff0000', '#00ff00', '#0000ff'];
      render(<ColorPicker name="color" swatches={customSwatches} />);

      const swatches = screen.getAllByRole('option');
      expect(swatches).toHaveLength(3);
    });

    it('selects color on swatch click', async () => {
      const handleChange = vi.fn();
      render(<ColorPicker name="color" onChange={handleChange} swatches={['#ff0000']} />);

      const swatch = screen.getByRole('option');
      await userEvent.click(swatch);

      expect(handleChange).toHaveBeenCalledWith('#ff0000');
    });

    it('shows checkmark on selected swatch', async () => {
      render(<ColorPicker name="color" defaultValue="#ef4444" />);

      // Find the swatch for red color
      const selectedSwatch = screen.getByRole('option', { selected: true });
      expect(selectedSwatch).toBeInTheDocument();
    });

    it('can hide swatches', () => {
      render(<ColorPicker name="color" showSwatches={false} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('disables swatches when picker is disabled', () => {
      render(<ColorPicker name="color" disabled swatches={['#ff0000']} />);
      const swatch = screen.getByRole('option');
      expect(swatch).toBeDisabled();
    });
  });

  describe('RGB inputs', () => {
    it('renders RGB inputs by default', () => {
      render(<ColorPicker name="color" showRgbInputs />);

      expect(screen.getByLabelText('R value')).toBeInTheDocument();
      expect(screen.getByLabelText('G value')).toBeInTheDocument();
      expect(screen.getByLabelText('B value')).toBeInTheDocument();
    });

    it('displays correct RGB values', () => {
      render(<ColorPicker name="color" defaultValue="#ff8000" showRgbInputs />);

      expect(screen.getByLabelText('R value')).toHaveValue(255);
      expect(screen.getByLabelText('G value')).toHaveValue(128);
      expect(screen.getByLabelText('B value')).toHaveValue(0);
    });

    it('updates color on R change', async () => {
      const handleChange = vi.fn();
      render(
        <ColorPicker name="color" defaultValue="#808080" onChange={handleChange} showRgbInputs />,
      );

      const rInput = screen.getByLabelText('R value');
      await userEvent.clear(rInput);
      await userEvent.type(rInput, '255');

      expect(handleChange).toHaveBeenCalled();
    });

    it('updates color on G change', async () => {
      const handleChange = vi.fn();
      render(
        <ColorPicker name="color" defaultValue="#808080" onChange={handleChange} showRgbInputs />,
      );

      const gInput = screen.getByLabelText('G value');
      await userEvent.clear(gInput);
      await userEvent.type(gInput, '255');

      expect(handleChange).toHaveBeenCalled();
    });

    it('updates color on B change', async () => {
      const handleChange = vi.fn();
      render(
        <ColorPicker name="color" defaultValue="#808080" onChange={handleChange} showRgbInputs />,
      );

      const bInput = screen.getByLabelText('B value');
      await userEvent.clear(bInput);
      await userEvent.type(bInput, '255');

      expect(handleChange).toHaveBeenCalled();
    });

    it('can hide RGB inputs', () => {
      render(<ColorPicker name="color" showRgbInputs={false} />);
      expect(screen.queryByLabelText('R value')).not.toBeInTheDocument();
    });
  });

  describe('HSL inputs', () => {
    it('does not show HSL inputs by default', () => {
      render(<ColorPicker name="color" />);
      expect(screen.queryByLabelText('Hue value')).not.toBeInTheDocument();
    });

    it('renders HSL inputs when enabled', () => {
      render(<ColorPicker name="color" showHslInputs />);

      expect(screen.getByLabelText('Hue value')).toBeInTheDocument();
      expect(screen.getByLabelText('Saturation value')).toBeInTheDocument();
      expect(screen.getByLabelText('Lightness value')).toBeInTheDocument();
    });

    it('updates color on HSL change', async () => {
      const handleChange = vi.fn();
      render(
        <ColorPicker name="color" defaultValue="#ff0000" onChange={handleChange} showHslInputs />,
      );

      const hInput = screen.getByLabelText('Hue value');
      await userEvent.clear(hInput);
      await userEvent.type(hInput, '120');

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('alpha slider', () => {
    it('does not show alpha by default', () => {
      render(<ColorPicker name="color" />);
      expect(screen.queryByLabelText('Alpha/opacity value')).not.toBeInTheDocument();
    });

    it('renders alpha slider when enabled', () => {
      render(<ColorPicker name="color" showAlpha />);
      expect(screen.getByLabelText('Alpha/opacity value')).toBeInTheDocument();
    });

    it('updates alpha on slider change', async () => {
      render(<ColorPicker name="color" showAlpha />);

      const alphaSlider = screen.getByLabelText('Alpha/opacity value');
      fireEvent.change(alphaSlider, { target: { value: '0.5' } });

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('includes alpha in output when less than 1', async () => {
      const handleChange = vi.fn();
      render(<ColorPicker name="color" showAlpha onChange={handleChange} defaultValue="#ff0000" />);

      const alphaSlider = screen.getByLabelText('Alpha/opacity value');
      fireEvent.change(alphaSlider, { target: { value: '0.5' } });

      // Alpha value should be appended as hex
      expect(handleChange).toHaveBeenCalledWith(expect.stringMatching(/^#ff0000[a-f0-9]{2}$/i));
    });
  });

  describe('controlled vs uncontrolled', () => {
    it('works as uncontrolled with defaultValue', async () => {
      const handleChange = vi.fn();
      render(
        <ColorPicker
          name="color"
          defaultValue="#ffffff"
          onChange={handleChange}
          swatches={['#000000']}
        />,
      );

      const swatch = screen.getByRole('option');
      await userEvent.click(swatch);

      const hexInput = screen.getByLabelText('Hex color value');
      expect(hexInput).toHaveValue('#000000');
      expect(handleChange).toHaveBeenCalledWith('#000000');
    });

    it('works as controlled with value', async () => {
      const handleChange = vi.fn();
      render(
        <ColorPicker name="color" value="#ff0000" onChange={handleChange} swatches={['#00ff00']} />,
      );

      const swatch = screen.getByRole('option');
      await userEvent.click(swatch);

      // Value should not change (controlled)
      expect(handleChange).toHaveBeenCalledWith('#00ff00');
    });
  });

  describe('disabled state', () => {
    it('disables hex input', () => {
      render(<ColorPicker name="color" disabled />);
      const hexInput = screen.getByLabelText('Hex color value');
      expect(hexInput).toBeDisabled();
    });

    it('disables RGB inputs', () => {
      render(<ColorPicker name="color" disabled showRgbInputs />);
      expect(screen.getByLabelText('R value')).toBeDisabled();
      expect(screen.getByLabelText('G value')).toBeDisabled();
      expect(screen.getByLabelText('B value')).toBeDisabled();
    });

    it('disables alpha slider', () => {
      render(<ColorPicker name="color" disabled showAlpha />);
      expect(screen.getByLabelText('Alpha/opacity value')).toBeDisabled();
    });

    it('disables swatch selection', async () => {
      const handleChange = vi.fn();
      render(<ColorPicker name="color" disabled onChange={handleChange} swatches={['#ff0000']} />);

      const swatch = screen.getByRole('option');
      await userEvent.click(swatch);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('hint and error', () => {
    it('shows hint text', () => {
      render(<ColorPicker name="color" hint="Choose your favorite color" />);
      expect(screen.getByText('Choose your favorite color')).toBeInTheDocument();
    });

    it('shows error message', () => {
      render(<ColorPicker name="color" error="Invalid color" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid color');
    });

    it('hides hint when error is present', () => {
      render(<ColorPicker name="color" hint="Choose color" error="Invalid" />);
      expect(screen.queryByText('Choose color')).not.toBeInTheDocument();
      expect(screen.getByText('Invalid')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible color preview', () => {
      render(<ColorPicker name="color" defaultValue="#ff0000" />);
      const preview = screen.getByRole('img');
      expect(preview).toHaveAttribute('aria-label', expect.stringContaining('#ff0000'));
    });

    it('swatches have accessible labels', () => {
      render(<ColorPicker name="color" swatches={['#ff0000']} />);
      const swatch = screen.getByRole('option');
      expect(swatch).toHaveAttribute('aria-label', '#ff0000');
    });

    it('links hex input to label', () => {
      render(<ColorPicker name="color" label="Color" />);
      const label = screen.getByText('Color');
      const hexInput = screen.getByLabelText('Hex color value');

      expect(label).toHaveAttribute('for', hexInput.id);
    });

    it('marks invalid when error exists', () => {
      render(<ColorPicker name="color" error="Invalid" />);
      const hiddenInput = document.querySelector('input[name="color"]');
      expect(hiddenInput).toHaveAttribute('aria-invalid', 'true');
    });
  });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('hexToRgb', () => {
  it('converts hex to RGB', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('handles hex without hash', () => {
    expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('handles mixed case', () => {
    expect(hexToRgb('#FF00ff')).toEqual({ r: 255, g: 0, b: 255 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('invalid')).toBeNull();
    expect(hexToRgb('#gg0000')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('converts RGB to hex', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
  });

  it('clamps values to valid range', () => {
    expect(rgbToHex(300, -50, 128)).toBe('#ff0080');
  });

  it('pads single digit hex values', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(15, 15, 15)).toBe('#0f0f0f');
  });
});

describe('rgbToHsl', () => {
  it('converts red', () => {
    const hsl = rgbToHsl(255, 0, 0);
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts green', () => {
    const hsl = rgbToHsl(0, 255, 0);
    expect(hsl.h).toBe(120);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts blue', () => {
    const hsl = rgbToHsl(0, 0, 255);
    expect(hsl.h).toBe(240);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts gray', () => {
    const hsl = rgbToHsl(128, 128, 128);
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBe(50);
  });
});

describe('hslToRgb', () => {
  it('converts red', () => {
    const rgb = hslToRgb(0, 100, 50);
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('converts green', () => {
    const rgb = hslToRgb(120, 100, 50);
    expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('converts blue', () => {
    const rgb = hslToRgb(240, 100, 50);
    expect(rgb).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('converts gray', () => {
    const rgb = hslToRgb(0, 0, 50);
    expect(rgb.r).toBe(rgb.g);
    expect(rgb.g).toBe(rgb.b);
  });
});

describe('parseColor', () => {
  it('parses hex colors', () => {
    expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('parses short hex colors', () => {
    expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('parses hex with alpha', () => {
    expect(parseColor('#ff000080')).toEqual({ r: 255, g: 0, b: 0, a: 128 / 255 });
  });

  it('parses rgb colors', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('parses rgba colors', () => {
    expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });

  it('parses hsl colors', () => {
    const result = parseColor('hsl(0, 100%, 50%)');
    expect(result?.r).toBe(255);
    expect(result?.g).toBe(0);
    expect(result?.b).toBe(0);
  });

  it('parses hsla colors', () => {
    const result = parseColor('hsla(0, 100%, 50%, 0.5)');
    expect(result?.a).toBe(0.5);
  });

  it('returns null for invalid colors', () => {
    expect(parseColor('invalid')).toBeNull();
    expect(parseColor('')).toBeNull();
  });
});

describe('isLightColor', () => {
  it('returns true for white', () => {
    expect(isLightColor('#ffffff')).toBe(true);
  });

  it('returns false for black', () => {
    expect(isLightColor('#000000')).toBe(false);
  });

  it('returns true for yellow', () => {
    expect(isLightColor('#ffff00')).toBe(true);
  });

  it('returns false for dark blue', () => {
    expect(isLightColor('#000080')).toBe(false);
  });

  it('returns true for invalid colors', () => {
    expect(isLightColor('invalid')).toBe(true);
  });
});

describe('DEFAULT_SWATCHES', () => {
  it('is an array of hex colors', () => {
    expect(Array.isArray(DEFAULT_SWATCHES)).toBe(true);
    expect(DEFAULT_SWATCHES.length).toBeGreaterThan(0);
    expect(DEFAULT_SWATCHES.every((c) => /^#[a-f0-9]{6}$/i.test(c))).toBe(true);
  });
});
