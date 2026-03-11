/**
 * English translations
 */

import type { TranslationKeys } from '../core/i18n';

const en: TranslationKeys = {
  // Form actions
  form: {
    submit: 'Submit',
    reset: 'Reset',
    next: 'Next',
    back: 'Back',
    confirm: 'Confirm',
    submitting: 'Submitting...',
  },

  // Field actions
  field: {
    add: 'Add',
    remove: 'Remove',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    clearSelection: 'Clear selection',
    search: 'Search...',
    selectOption: 'Select an option...',
    noOptions: 'No options available',
    noOptionsFound: 'No options found',
    loading: 'Loading...',
    selected: 'selected',
    typeAndEnter: 'Type and press Enter',
    phoneNumber: 'Phone number',
  },

  // Accessibility
  a11y: {
    formSteps: 'Form steps',
    required: 'required',
    stepCurrent: 'current',
    stepCompleted: 'completed',
    stepNumber: 'Step',
    removeItem: 'Remove',
    addItem: 'Add',
    calendar: 'Calendar',
  },

  // Date/Time
  datetime: {
    months: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
    },
    monthsShort: {
      jan: 'Jan',
      feb: 'Feb',
      mar: 'Mar',
      apr: 'Apr',
      may: 'May',
      jun: 'Jun',
      jul: 'Jul',
      aug: 'Aug',
      sep: 'Sep',
      oct: 'Oct',
      nov: 'Nov',
      dec: 'Dec',
    },
    days: {
      sunday: 'Sunday',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
    },
    daysShort: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
    },
    am: 'AM',
    pm: 'PM',
    today: 'Today',
    selectDate: 'Select date',
    selectTime: 'Select time',
    hour: 'Hour',
    minute: 'Minute',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    dateLabel: 'Date',
    timeLabel: 'Time',
  },

  // File upload
  file: {
    dragDrop: 'Drag and drop file here, or',
    browse: 'browse',
    remove: 'Remove',
    maxSize: 'Max size:',
    invalidType: 'is not an accepted file type',
    exceedsMaxSize: 'exceeds max size of',
    selected: 'Selected:',
    accepted: 'Accepted:',
  },

  // Phone field
  phone: {
    searchCountry: 'Search country...',
    selectCountry: 'Select country',
  },

  // Rating field
  rating: {
    stars: 'stars',
    outOf: 'out of',
    noRating: 'No rating',
  },

  // Tags field
  tags: {
    addTag: 'Add tag',
    removeTag: 'Remove tag',
    maxTags: 'Maximum tags reached',
  },
};

export default en;
