/**
 * Core i18n types and utilities
 * Framework-FREE — no React imports allowed in this file
 */

/**
 * Supported locales
 */
export type Locale = 'en' | 'fr';

/**
 * Default locale
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Translation keys structure
 */
export interface TranslationKeys {
  // Form actions
  form: {
    submit: string;
    reset: string;
    next: string;
    back: string;
    confirm: string;
    submitting: string;
  };

  // Field actions
  field: {
    add: string;
    remove: string;
    showPassword: string;
    hidePassword: string;
    clearSelection: string;
    search: string;
    selectOption: string;
    noOptions: string;
    noOptionsFound: string;
    loading: string;
    selected: string;
    typeAndEnter: string;
    phoneNumber: string;
  };

  // Accessibility
  a11y: {
    formSteps: string;
    required: string;
    stepCurrent: string;
    stepCompleted: string;
    stepNumber: string;
    removeItem: string;
    addItem: string;
    calendar: string;
  };

  // Date/Time
  datetime: {
    months: {
      january: string;
      february: string;
      march: string;
      april: string;
      may: string;
      june: string;
      july: string;
      august: string;
      september: string;
      october: string;
      november: string;
      december: string;
    };
    monthsShort: {
      jan: string;
      feb: string;
      mar: string;
      apr: string;
      may: string;
      jun: string;
      jul: string;
      aug: string;
      sep: string;
      oct: string;
      nov: string;
      dec: string;
    };
    days: {
      sunday: string;
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
    };
    daysShort: {
      sun: string;
      mon: string;
      tue: string;
      wed: string;
      thu: string;
      fri: string;
      sat: string;
    };
    am: string;
    pm: string;
    today: string;
    selectDate: string;
    selectTime: string;
    hour: string;
    minute: string;
    previousMonth: string;
    nextMonth: string;
    dateLabel: string;
    timeLabel: string;
  };

  // File upload
  file: {
    dragDrop: string;
    browse: string;
    remove: string;
    maxSize: string;
    invalidType: string;
    exceedsMaxSize: string;
    selected: string;
    accepted: string;
  };

  // Phone field
  phone: {
    searchCountry: string;
    selectCountry: string;
  };

  // Rating field
  rating: {
    stars: string;
    outOf: string;
    noRating: string;
  };

  // Tags field
  tags: {
    addTag: string;
    removeTag: string;
    maxTags: string;
  };
}

/**
 * Get a nested translation value by dot-notation path
 * @param translations - Translation object
 * @param path - Dot-notation path (e.g., 'form.submit')
 * @param fallback - Fallback value if path not found
 */
export function getTranslation(
  translations: TranslationKeys,
  path: string,
  fallback?: string,
): string {
  const keys = path.split('.');
  let current: unknown = translations;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return fallback ?? path;
    }
  }

  return typeof current === 'string' ? current : (fallback ?? path);
}
