/**
 * Conditional field visibility logic
 * Framework-FREE — no React imports allowed in this file
 */

import type { ConditionalRule, FormValues } from './types';

/**
 * Evaluate a conditional rule against form values
 * Used for showWhen/hideWhen field visibility
 *
 * @param rule - The conditional rule to evaluate
 * @param values - Current form values
 * @returns true if the condition is met
 *
 * @example
 * ```typescript
 * const rule = { field: 'role', operator: 'equals', value: 'admin' };
 * const values = { role: 'admin' };
 * evaluateRule(rule, values); // true
 * ```
 */
export function evaluateRule(rule: ConditionalRule, values: FormValues): boolean {
  const fieldValue = values[rule.field];

  switch (rule.operator) {
    case 'equals':
      return fieldValue === rule.value;

    case 'not_equals':
      return fieldValue !== rule.value;

    case 'is_empty':
      return fieldValue === null || fieldValue === undefined || fieldValue === '';

    case 'is_not_empty':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';

    case 'gt':
      return Number(fieldValue) > Number(rule.value);

    case 'lt':
      return Number(fieldValue) < Number(rule.value);

    case 'contains':
      return String(fieldValue).includes(String(rule.value));

    default:
      return false;
  }
}

/**
 * Check if a field should be visible based on showWhen/hideWhen rules
 *
 * @param showWhen - Rule that must be true for field to show (optional)
 * @param hideWhen - Rule that when true hides the field (optional)
 * @param values - Current form values
 * @returns true if field should be visible
 */
export function isFieldVisible(
  showWhen: ConditionalRule | undefined,
  hideWhen: ConditionalRule | undefined,
  values: FormValues,
): boolean {
  // If hideWhen is set and evaluates to true, hide the field
  if (hideWhen && evaluateRule(hideWhen, values)) {
    return false;
  }

  // If showWhen is set, field only visible when rule is true
  if (showWhen) {
    return evaluateRule(showWhen, values);
  }

  // No conditions, field is visible by default
  return true;
}
