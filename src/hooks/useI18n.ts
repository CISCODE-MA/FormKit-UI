/**
 * useI18n hook - Access translations in components
 */

import { useContext } from 'react';
import { I18nContext, type I18nContextValue } from '../components/context/I18nContext';

/**
 * Hook to access i18n translations
 *
 * @returns I18n context value with t() function and locale
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale } = useI18n();
 *   return <button>{t('form.submit')}</button>;
 * }
 * ```
 */
export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

export type { I18nContextValue };
