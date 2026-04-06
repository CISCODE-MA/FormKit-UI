/**
 * I18nContext - Internationalization context provider
 * Provides translations throughout the form components
 */

import { createContext, type ReactNode, type JSX, useMemo } from 'react';
import type { Locale, TranslationKeys } from '../../core/i18n';
import { DEFAULT_LOCALE, getTranslation } from '../../core/i18n';
import { en, fr } from '../../locales';

/**
 * All available translations
 */
const translations: Record<Locale, TranslationKeys> = {
  en,
  fr,
};

/**
 * I18n context value
 */
export interface I18nContextValue {
  /** Current locale */
  locale: Locale;
  /** Get translation by key path with optional parameter interpolation */
  t: (path: string, params?: Record<string, string | number>, fallback?: string) => string;
  /** Full translations object for current locale */
  translations: TranslationKeys;
}

/**
 * Default context value with English locale
 */
const defaultContextValue: I18nContextValue = {
  locale: DEFAULT_LOCALE,
  t: (path: string, params?: Record<string, string | number>, fallback?: string) =>
    getTranslation(translations[DEFAULT_LOCALE], path, params, fallback),
  translations: translations[DEFAULT_LOCALE],
};

/**
 * I18n React context
 */
export const I18nContext = createContext<I18nContextValue>(defaultContextValue);

/**
 * Props for I18nProvider
 */
type I18nProviderProps = {
  /** Locale to use */
  locale?: Locale;
  /** Custom translations (overrides built-in) */
  customTranslations?: Partial<TranslationKeys>;
  /** Children */
  children: ReactNode;
};

/**
 * I18nProvider component
 * Wraps form components to provide translations
 *
 * @example
 * ```tsx
 * <I18nProvider locale="fr">
 *   <DynamicForm ... />
 * </I18nProvider>
 * ```
 */
export default function I18nProvider({
  locale = DEFAULT_LOCALE,
  customTranslations,
  children,
}: I18nProviderProps): JSX.Element {
  const contextValue = useMemo<I18nContextValue>(() => {
    // Merge custom translations with built-in
    const baseTranslations = translations[locale];
    const mergedTranslations: TranslationKeys = customTranslations
      ? (deepMerge(
          baseTranslations as unknown as Record<string, unknown>,
          customTranslations as unknown as Record<string, unknown>,
        ) as unknown as TranslationKeys)
      : baseTranslations;

    return {
      locale,
      t: (path: string, params?: Record<string, string | number>, fallback?: string) =>
        getTranslation(mergedTranslations, path, params, fallback),
      translations: mergedTranslations,
    };
  }, [locale, customTranslations]);

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

/**
 * Deep merge utility for translations
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue !== undefined &&
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>,
        ) as T[Extract<keyof T, string>];
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

export type { I18nProviderProps };
