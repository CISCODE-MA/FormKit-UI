/**
 * PhoneField - Phone number input with country code selector
 */

import { useState, type JSX, type ChangeEvent } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';
import countriesData from '../../data/countries.json';

/**
 * Country code option
 */
type CountryCode = {
  code: string;
  name: string;
  dialCode: string;
};

/**
 * Flag CDN base URL
 */
const FLAG_CDN = 'https://flagcdn.com';

/**
 * Get flag image URL for a country code
 */
function getFlagUrl(code: string, size: 'sm' | 'md' = 'sm'): string {
  const width = size === 'sm' ? 20 : 40;
  return `${FLAG_CDN}/w${width}/${code.toLowerCase()}.png`;
}

/**
 * All country codes from JSON data
 */
const COUNTRY_CODES: CountryCode[] = countriesData.countries;

/**
 * Props for PhoneField
 */
type Props = {
  config: FieldConfig;
};

/**
 * Phone value structure
 */
type PhoneValue = {
  countryCode: string;
  dialCode: string;
  number: string;
};

/**
 * Parse stored value into PhoneValue
 */
function parsePhoneValue(value: unknown): PhoneValue {
  if (typeof value === 'object' && value !== null) {
    const v = value as Partial<PhoneValue>;
    return {
      countryCode: v.countryCode ?? 'US',
      dialCode: v.dialCode ?? '+1',
      number: v.number ?? '',
    };
  }
  // If it's just a string, treat it as the number with default country
  if (typeof value === 'string') {
    return { countryCode: 'US', dialCode: '+1', number: value };
  }
  return { countryCode: 'US', dialCode: '+1', number: '' };
}

/**
 * PhoneField component for phone number input with country selection
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function PhoneField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();
  const [isOpen, setIsOpen] = useState(false);

  const fieldId = `field-${config.key}`;
  const countrySelectId = `${fieldId}-country`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const rawValue = getValue(config.key);
  const phoneValue = parsePhoneValue(rawValue);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;
  const showSuccess = touched && !error && !!phoneValue.number;

  // Find current country
  const currentCountry =
    COUNTRY_CODES.find((c) => c.code === phoneValue.countryCode) ?? COUNTRY_CODES[0];

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  // Handle country change
  const handleCountryChange = (country: CountryCode) => {
    setValue(config.key, {
      countryCode: country.code,
      dialCode: country.dialCode,
      number: phoneValue.number,
    });
    setIsOpen(false);
  };

  // Handle phone number change
  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, spaces, dashes, and parentheses
    const cleaned = e.target.value.replace(/[^\d\s\-()]/g, '');
    setValue(config.key, {
      countryCode: phoneValue.countryCode,
      dialCode: phoneValue.dialCode,
      number: cleaned,
    });
  };

  return (
    <div className="formkit-phone-field flex flex-col gap-1 mb-4">
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      <div className="relative flex">
        {/* Country selector */}
        <div className="relative">
          <button
            id={countrySelectId}
            type="button"
            disabled={isDisabled}
            onClick={() => setIsOpen(!isOpen)}
            onBlur={() => {
              // Delay to allow click on dropdown items
              setTimeout(() => setIsOpen(false), 150);
            }}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label={`Select country code, current: ${currentCountry.name} ${currentCountry.dialCode}`}
            className={`
              formkit-phone-country-select
              flex items-center gap-1
              px-3 py-2 sm:px-4 sm:py-2.5
              text-sm sm:text-base
              border border-r-0 rounded-l-md
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
              ${
                showError
                  ? 'border-red-500 hover:border-red-400'
                  : 'border-gray-300 hover:border-gray-400'
              }
              ${
                isDisabled
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-white cursor-pointer'
              }
            `}
          >
            <img
              src={getFlagUrl(currentCountry.code)}
              alt=""
              aria-hidden="true"
              className="h-4 w-5 object-cover rounded-sm"
            />
            <span className="text-gray-700">{currentCountry.dialCode}</span>
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Country dropdown */}
          {isOpen && !isDisabled && (
            <ul
              role="listbox"
              aria-label="Select country"
              className="
                absolute z-50 mt-1 left-0
                max-h-60 w-64 overflow-auto
                bg-white border border-gray-300 rounded-md shadow-lg
                py-1
              "
            >
              {COUNTRY_CODES.map((country) => (
                <li
                  key={country.code}
                  role="option"
                  aria-selected={country.code === phoneValue.countryCode}
                  onClick={() => handleCountryChange(country)}
                  className={`
                    flex items-center gap-2 px-3 py-2
                    cursor-pointer
                    hover:bg-blue-50
                    ${country.code === phoneValue.countryCode ? 'bg-blue-100' : ''}
                  `}
                >
                  <img
                    src={getFlagUrl(country.code)}
                    alt=""
                    aria-hidden="true"
                    className="h-4 w-5 object-cover rounded-sm"
                  />
                  <span className="flex-1 text-sm text-gray-700">{country.name}</span>
                  <span className="text-sm text-gray-500">{country.dialCode}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Phone number input */}
        <input
          id={fieldId}
          name={config.key}
          type="tel"
          inputMode="tel"
          value={phoneValue.number}
          placeholder={config.placeholder ?? 'Phone number'}
          disabled={isDisabled}
          readOnly={config.readOnly}
          aria-invalid={showError}
          aria-required={config.required}
          aria-describedby={describedBy}
          onChange={handleNumberChange}
          onBlur={() => setTouched(config.key, true)}
          className={`
            formkit-phone-input
            flex-1 px-3 py-2 sm:px-4 sm:py-2.5
            text-sm sm:text-base
            border rounded-r-md
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:border-blue-500
            ${
              showError
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500 hover:border-red-400'
                : showSuccess
                  ? 'border-green-500 focus:ring-green-500 focus:border-green-500 hover:border-green-400'
                  : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'
            }
            ${
              isDisabled
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed hover:border-gray-300'
                : 'bg-white'
            }
          `}
        />
      </div>

      {config.description && !showError && (
        <p id={descId} className="text-xs text-gray-500 mt-1">
          {config.description}
        </p>
      )}

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as PhoneFieldProps, PhoneValue, CountryCode };
