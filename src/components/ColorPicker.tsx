import * as React from 'react';

// ============================================================================
// Color Utility Functions
// ============================================================================

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Parse any color string to RGB
 */
export function parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
  // Handle hex
  const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
      a: hexMatch[4] ? parseInt(hexMatch[4], 16) / 255 : 1,
    };
  }

  // Handle short hex
  const shortHexMatch = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(color);
  if (shortHexMatch) {
    return {
      r: parseInt(shortHexMatch[1] + shortHexMatch[1], 16),
      g: parseInt(shortHexMatch[2] + shortHexMatch[2], 16),
      b: parseInt(shortHexMatch[3] + shortHexMatch[3], 16),
      a: 1,
    };
  }

  // Handle rgb/rgba
  const rgbMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
    color,
  );
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
    };
  }

  // Handle hsl/hsla
  const hslMatch = /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
    color,
  );
  if (hslMatch) {
    const rgb = hslToRgb(
      parseInt(hslMatch[1], 10),
      parseInt(hslMatch[2], 10),
      parseInt(hslMatch[3], 10),
    );
    return {
      ...rgb,
      a: hslMatch[4] ? parseFloat(hslMatch[4]) : 1,
    };
  }

  return null;
}

/**
 * Check if a color is light (for contrast purposes)
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  // Using relative luminance formula
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

// ============================================================================
// Default Color Swatches
// ============================================================================

export const DEFAULT_SWATCHES = [
  // Reds
  '#ef4444',
  '#dc2626',
  '#b91c1c',
  // Oranges
  '#f97316',
  '#ea580c',
  '#c2410c',
  // Yellows
  '#eab308',
  '#ca8a04',
  '#a16207',
  // Greens
  '#22c55e',
  '#16a34a',
  '#15803d',
  // Blues
  '#3b82f6',
  '#2563eb',
  '#1d4ed8',
  // Purples
  '#a855f7',
  '#9333ea',
  '#7e22ce',
  // Pinks
  '#ec4899',
  '#db2777',
  '#be185d',
  // Grays
  '#6b7280',
  '#4b5563',
  '#374151',
  // Black & White
  '#000000',
  '#ffffff',
];

// ============================================================================
// Types
// ============================================================================

export type ColorFormat = 'hex' | 'rgb' | 'hsl';

export interface ColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Input name for form submission */
  name: string;
  /** Current color value (hex format) */
  value?: string;
  /** Default color value */
  defaultValue?: string;
  /** Callback when color changes */
  onChange?: (color: string) => void;
  /** Label text */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Hint text below the input */
  hint?: string;
  /** Error message */
  error?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Color format to display */
  format?: ColorFormat;
  /** Allow alpha/opacity selection */
  showAlpha?: boolean;
  /** Custom color swatches */
  swatches?: string[];
  /** Show preset swatches */
  showSwatches?: boolean;
  /** Number of swatch columns */
  swatchColumns?: number;
  /** Show RGB sliders */
  showRgbInputs?: boolean;
  /** Show HSL inputs */
  showHslInputs?: boolean;
  /** Additional class for the container */
  className?: string;
  /** Placeholder text for hex input */
  placeholder?: string;
}

// ============================================================================
// ColorPicker Component
// ============================================================================

export const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(
  (
    {
      name,
      value: controlledValue,
      defaultValue = '#3b82f6',
      onChange,
      label,
      required,
      hint,
      error: propError,
      disabled = false,
      format = 'hex',
      showAlpha = false,
      swatches = DEFAULT_SWATCHES,
      showSwatches = true,
      swatchColumns = 8,
      showRgbInputs = true,
      showHslInputs = false,
      className = '',
      placeholder = '#000000',
      ...props
    },
    ref,
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [hexInput, setHexInput] = React.useState(defaultValue);
    const [alpha, setAlpha] = React.useState(1);

    const currentValue = isControlled ? controlledValue : internalValue;
    const error = propError;

    // Parse current color to RGB
    const rgb = React.useMemo(() => {
      const parsed = parseColor(currentValue);
      return parsed || { r: 0, g: 0, b: 0, a: 1 };
    }, [currentValue]);

    // Parse current color to HSL
    const hsl = React.useMemo(() => {
      return rgbToHsl(rgb.r, rgb.g, rgb.b);
    }, [rgb]);

    // Update internal state when controlled value changes
    React.useEffect(() => {
      if (isControlled && controlledValue) {
        setHexInput(controlledValue);
        const parsed = parseColor(controlledValue);
        if (parsed) {
          setAlpha(parsed.a);
        }
      }
    }, [isControlled, controlledValue]);

    const updateColor = React.useCallback(
      (newColor: string, newAlpha?: number) => {
        const finalAlpha = newAlpha ?? alpha;
        let colorValue = newColor;

        // Include alpha in output if enabled
        if (showAlpha && finalAlpha < 1) {
          const parsed = parseColor(newColor);
          if (parsed) {
            const alphaHex = Math.round(finalAlpha * 255)
              .toString(16)
              .padStart(2, '0');
            colorValue = `${newColor}${alphaHex}`;
          }
        }

        if (!isControlled) {
          setInternalValue(colorValue);
          setHexInput(newColor);
        }

        onChange?.(colorValue);
      },
      [alpha, showAlpha, isControlled, onChange],
    );

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Add # if not present
      if (value && !value.startsWith('#')) {
        value = '#' + value;
      }

      setHexInput(value);

      // Validate and update if valid
      if (/^#[a-f\d]{6}$/i.test(value)) {
        updateColor(value);
      }
    };

    const handleHexInputBlur = () => {
      // On blur, revert to current value if invalid
      if (!/^#[a-f\d]{6}$/i.test(hexInput)) {
        setHexInput(currentValue.slice(0, 7));
      }
    };

    const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
      const newRgb = { ...rgb, [channel]: value };
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      updateColor(hex);
    };

    const handleHslChange = (channel: 'h' | 's' | 'l', value: number) => {
      const newHsl = { ...hsl, [channel]: value };
      const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      updateColor(hex);
    };

    const handleAlphaChange = (value: number) => {
      setAlpha(value);
      updateColor(currentValue.slice(0, 7), value);
    };

    const handleSwatchClick = (swatchColor: string) => {
      if (!disabled) {
        updateColor(swatchColor);
      }
    };

    const getDisplayValue = (): string => {
      switch (format) {
        case 'rgb':
          return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        case 'hsl':
          return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        default:
          return currentValue.slice(0, 7);
      }
    };

    const id = `color-picker-${name}`;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
      <div className={`flex flex-col gap-2 ${className}`} {...props}>
        {/* Label */}
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Hidden input for form submission */}
        <input
          ref={ref}
          type="hidden"
          name={name}
          value={currentValue}
          aria-invalid={!!error}
          aria-describedby={
            [error ? errorId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined
          }
        />

        {/* Color Preview and Hex Input */}
        <div className="flex items-center gap-3">
          {/* Color Preview Box */}
          <div
            className={`
              w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm
              flex items-center justify-center overflow-hidden
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{ backgroundColor: currentValue.slice(0, 7) }}
            aria-label={`Selected color: ${getDisplayValue()}`}
            role="img"
          >
            {/* Checkerboard for alpha preview */}
            {showAlpha && alpha < 1 && (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: currentValue.slice(0, 7),
                  opacity: alpha,
                }}
              />
            )}
          </div>

          {/* Hex Input */}
          <div className="flex-1">
            <input
              id={id}
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              onBlur={handleHexInputBlur}
              disabled={disabled}
              placeholder={placeholder}
              className={`
                w-full px-3 py-2 border rounded-md text-sm font-mono uppercase
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
                ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
              `}
              aria-label="Hex color value"
              maxLength={7}
            />
          </div>
        </div>

        {/* Color Swatches */}
        {showSwatches && swatches.length > 0 && (
          <div
            className="grid gap-1 mt-2"
            style={{ gridTemplateColumns: `repeat(${swatchColumns}, minmax(0, 1fr))` }}
            role="listbox"
            aria-label="Color swatches"
          >
            {swatches.map((swatchColor, index) => {
              const isSelected = currentValue.toLowerCase().startsWith(swatchColor.toLowerCase());
              const isLight = isLightColor(swatchColor);

              return (
                <button
                  key={`${swatchColor}-${index}`}
                  type="button"
                  onClick={() => handleSwatchClick(swatchColor)}
                  disabled={disabled}
                  className={`
                    w-full aspect-square rounded-md border-2 transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                    ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-1'
                        : 'border-gray-200 hover:border-gray-400'
                    }
                    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                  style={{ backgroundColor: swatchColor }}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={swatchColor}
                  title={swatchColor}
                >
                  {isSelected && (
                    <svg
                      className={`w-4 h-4 mx-auto ${isLight ? 'text-gray-800' : 'text-white'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* RGB Inputs */}
        {showRgbInputs && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(['r', 'g', 'b'] as const).map((channel) => (
              <div key={channel} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase">{channel}</label>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[channel]}
                  onChange={(e) => handleRgbChange(channel, parseInt(e.target.value, 10) || 0)}
                  disabled={disabled}
                  className={`
                    w-full px-2 py-1.5 border rounded text-sm text-center
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    border-gray-300
                  `}
                  aria-label={`${channel.toUpperCase()} value`}
                />
              </div>
            ))}
          </div>
        )}

        {/* HSL Inputs */}
        {showHslInputs && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase">H</label>
              <input
                type="number"
                min={0}
                max={360}
                value={hsl.h}
                onChange={(e) => handleHslChange('h', parseInt(e.target.value, 10) || 0)}
                disabled={disabled}
                className={`
                  w-full px-2 py-1.5 border rounded text-sm text-center
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                  border-gray-300
                `}
                aria-label="Hue value"
              />
            </div>
            {(['s', 'l'] as const).map((channel) => (
              <div key={channel} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase">{channel}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={hsl[channel]}
                  onChange={(e) => handleHslChange(channel, parseInt(e.target.value, 10) || 0)}
                  disabled={disabled}
                  className={`
                    w-full px-2 py-1.5 border rounded text-sm text-center
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    border-gray-300
                  `}
                  aria-label={`${channel === 's' ? 'Saturation' : 'Lightness'} value`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Alpha Slider */}
        {showAlpha && (
          <div className="mt-2">
            <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Alpha</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={alpha}
                onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
                disabled={disabled}
                className={`
                  flex-1 h-2 rounded-lg appearance-none cursor-pointer
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                style={{
                  background: `linear-gradient(to right, transparent, ${currentValue.slice(0, 7)})`,
                }}
                aria-label="Alpha/opacity value"
              />
              <span className="text-sm text-gray-600 w-12 text-right">
                {Math.round(alpha * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Hint Text */}
        {hint && !error && (
          <p id={hintId} className="text-sm text-gray-500">
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;
