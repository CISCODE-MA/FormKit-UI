/**
 * PhoneInput component with country code selection and formatting
 */

import { forwardRef, useId, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ValidationRule } from '../validation/types';
import { useFormField } from '../hooks/useFormField';
import { useValidation } from '../hooks/useValidation';
import { useFieldError } from '../hooks/useFieldError';

/**
 * Country data type
 */
export interface CountryData {
  /** ISO 3166-1 alpha-2 country code */
  code: string;
  /** Country name */
  name: string;
  /** Dial code (e.g., +1) */
  dialCode: string;
  /** Phone format pattern (# = digit) */
  format?: string;
  /** Flag emoji */
  flag: string;
}

/**
 * Default country codes
 */
export const DEFAULT_COUNTRIES: CountryData[] = [
  { code: 'US', name: 'United States', dialCode: '+1', format: '(###) ###-####', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dialCode: '+1', format: '(###) ###-####', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', format: '#### ######', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', dialCode: '+49', format: '### #######', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', format: '# ## ## ## ##', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', format: '### ### ####', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', format: '### ### ###', flag: '🇪🇸' },
  { code: 'AU', name: 'Australia', dialCode: '+61', format: '### ### ###', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', dialCode: '+81', format: '##-####-####', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dialCode: '+86', format: '### #### ####', flag: '🇨🇳' },
  { code: 'IN', name: 'India', dialCode: '+91', format: '##### #####', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', format: '(##) #####-####', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', format: '## #### ####', flag: '🇲🇽' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', format: '##-####-####', flag: '🇰🇷' },
  { code: 'RU', name: 'Russia', dialCode: '+7', format: '### ###-##-##', flag: '🇷🇺' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', format: '# ########', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', format: '##-### ## ##', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', format: '## ### ## ##', flag: '🇨🇭' },
  { code: 'PL', name: 'Poland', dialCode: '+48', format: '### ### ###', flag: '🇵🇱' },
  { code: 'AT', name: 'Austria', dialCode: '+43', format: '### ######', flag: '🇦🇹' },
];

/**
 * Props for PhoneInput component
 */
export interface PhoneInputProps {
  /** Input name attribute */
  name: string;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Default country code */
  defaultCountry?: string;
  /** Default phone number (without country code) */
  defaultValue?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Custom CSS class name for the container */
  className?: string;
  /** Custom CSS class name for the input element */
  inputClassName?: string;
  /** Validation rules */
  validationRules?: ValidationRule[];
  /** When to validate */
  validateOn?: 'change' | 'blur' | 'submit';
  /** Debounce validation (ms) */
  debounce?: number;
  /** Show error message */
  showError?: boolean;
  /** Auto-dismiss errors after delay (ms) */
  autoDismissError?: number;
  /** Hint or help text */
  hint?: string;
  /** Available countries (defaults to common countries) */
  countries?: CountryData[];
  /** Show country dropdown */
  showCountrySelect?: boolean;
  /** Show country flag */
  showFlag?: boolean;
  /** Auto-format phone number as user types */
  autoFormat?: boolean;
  /** Change handler (returns full phone with country code) */
  onChange?: (value: string, country: CountryData) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Country change handler */
  onCountryChange?: (country: CountryData) => void;
  /** Validation change handler */
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Format a phone number based on country format
 */
export function formatPhoneNumber(phoneNumber: string, format?: string): string {
  if (!format) return phoneNumber;

  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, '');
  if (!digits) return '';

  let result = '';
  let digitIndex = 0;

  for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
    if (format[i] === '#') {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += format[i];
    }
  }

  // Add remaining digits if any
  if (digitIndex < digits.length) {
    result += digits.slice(digitIndex);
  }

  return result;
}

/**
 * Parse a phone number to raw digits
 */
export function parsePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}

/**
 * Get full phone number with country code
 */
export function getFullPhoneNumber(phoneNumber: string, country: CountryData): string {
  const digits = parsePhoneNumber(phoneNumber);
  if (!digits) return '';
  return `${country.dialCode}${digits}`;
}

/**
 * Chevron down icon
 */
function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * Country dropdown component
 */
interface CountryDropdownProps {
  countries: CountryData[];
  selectedCountry: CountryData;
  onSelect: (country: CountryData) => void;
  disabled?: boolean;
  showFlag?: boolean;
}

function CountryDropdown({
  countries,
  selectedCountry,
  onSelect,
  disabled = false,
  showFlag = true,
}: CountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    const lower = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.dialCode.includes(search) ||
        c.code.toLowerCase().includes(lower),
    );
  }, [countries, search]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (country: CountryData) => {
      onSelect(country);
      setIsOpen(false);
      setSearch('');
    },
    [onSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      } else if (e.key === 'Enter' && filteredCountries.length > 0) {
        handleSelect(filteredCountries[0]);
      }
    },
    [filteredCountries, handleSelect],
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-1 px-2 py-2 border-r border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-l"
        aria-label={`Selected country: ${selectedCountry.name}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {showFlag && <span className="text-lg">{selectedCountry.flag}</span>}
        <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          role="listbox"
          aria-label="Select country"
        >
          <div className="p-2 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search countries..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelect(country)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                  country.code === selectedCountry.code
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700'
                }`}
                role="option"
                aria-selected={country.code === selectedCountry.code}
              >
                {showFlag && <span className="text-lg">{country.flag}</span>}
                <span className="flex-1">{country.name}</span>
                <span className="text-gray-500">{country.dialCode}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * PhoneInput component with country code selection and formatting
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      name,
      label,
      placeholder = 'Enter phone number',
      defaultCountry = 'US',
      defaultValue = '',
      required = false,
      disabled = false,
      readOnly = false,
      className = '',
      inputClassName = '',
      validationRules = [],
      validateOn = 'blur',
      debounce,
      showError = true,
      autoDismissError,
      hint,
      countries = DEFAULT_COUNTRIES,
      showCountrySelect = true,
      showFlag = true,
      autoFormat = true,
      onChange,
      onBlur,
      onFocus,
      onCountryChange,
      onValidationChange,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = `phone-${name}-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = hint ? `${fieldId}-hint` : undefined;

    // Internal ref
    const inputRef = useRef<HTMLInputElement>(null);

    // Find initial country
    const initialCountry = useMemo(
      () => countries.find((c) => c.code === defaultCountry) || countries[0],
      [countries, defaultCountry],
    );

    // State
    const [selectedCountry, setSelectedCountry] = useState<CountryData>(initialCountry);
    const [phoneNumber, setPhoneNumber] = useState<string>(() =>
      autoFormat ? formatPhoneNumber(defaultValue, initialCountry.format) : defaultValue,
    );

    // Display value
    const displayValue = phoneNumber;

    // Field state management
    const {
      isTouched,
      handleBlur: fieldBlur,
      handleFocus,
    } = useFormField({
      initialValue: displayValue,
      disabled,
      readOnly,
      onBlur: () => {
        onBlur?.();
        if (validateOn === 'blur') {
          const fullNumber = getFullPhoneNumber(phoneNumber, selectedCountry);
          validate(fullNumber);
        }
      },
      onFocus,
    });

    // Validation
    const { errors, isValid, validate } = useValidation({
      rules: validationRules,
      debounce,
    });

    // Notify parent of validation changes
    useEffect(() => {
      if (onValidationChange) {
        onValidationChange(isValid);
      }
    }, [isValid, onValidationChange]);

    // Error handling
    const { error, setErrors } = useFieldError({
      fieldName: name,
      autoDismiss: autoDismissError,
    });

    // Sync validation errors to field errors
    if (errors.length > 0 && error !== errors[0]) {
      setErrors(errors);
    } else if (errors.length === 0 && error !== null) {
      setErrors([]);
    }

    // Handle input change
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formatted = autoFormat
          ? formatPhoneNumber(rawValue, selectedCountry.format)
          : rawValue;

        setPhoneNumber(formatted);

        const fullNumber = getFullPhoneNumber(formatted, selectedCountry);
        onChange?.(fullNumber, selectedCountry);

        if (validateOn === 'change') {
          validate(fullNumber);
        }
      },
      [autoFormat, selectedCountry, onChange, validateOn, validate],
    );

    // Handle country change
    const handleCountryChange = useCallback(
      (country: CountryData) => {
        setSelectedCountry(country);
        onCountryChange?.(country);

        // Reformat phone number with new country format
        if (autoFormat && phoneNumber) {
          const formatted = formatPhoneNumber(phoneNumber, country.format);
          setPhoneNumber(formatted);
        }

        const fullNumber = getFullPhoneNumber(phoneNumber, country);
        onChange?.(fullNumber, country);
      },
      [autoFormat, phoneNumber, onChange, onCountryChange],
    );

    // Handle blur
    const handleBlur = useCallback(() => {
      fieldBlur();
    }, [fieldBlur]);

    const hasError = isTouched && error !== null;
    const showHint = hint && !hasError;

    return (
      <div className={`formkit-phone-container ${className} mb-4`}>
        {label ? (
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        ) : (
          <label htmlFor={fieldId} className="sr-only">
            {name}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <div className="relative flex">
          {showCountrySelect && (
            <CountryDropdown
              countries={countries}
              selectedCountry={selectedCountry}
              onSelect={handleCountryChange}
              disabled={disabled}
              showFlag={showFlag}
            />
          )}
          <input
            ref={(node) => {
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            id={fieldId}
            name={name}
            type="tel"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            className={`formkit-phone-input ${inputClassName} flex-1 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 ${showCountrySelect ? 'rounded-r border-l-0' : 'rounded'} transition-all duration-150 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:border-gray-300 ${hasError ? 'formkit-phone-error border-red-500 focus:ring-red-500 focus:border-red-500 hover:border-red-400' : ''} ${isTouched && isValid ? 'border-green-500 focus:ring-green-500 focus:border-green-500 hover:border-green-400' : ''}`}
            aria-invalid={hasError}
            aria-describedby={
              [hasError ? errorId : undefined, showHint ? hintId : undefined]
                .filter(Boolean)
                .join(' ') || undefined
            }
          />
        </div>
        {showHint && (
          <div id={hintId} className="text-xs text-gray-500 mt-1">
            {hint}
          </div>
        )}
        {showError && hasError && (
          <div id={errorId} className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
            {error}
          </div>
        )}
      </div>
    );
  },
);

PhoneInput.displayName = 'PhoneInput';
