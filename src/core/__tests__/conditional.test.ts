/**
 * Tests for core/conditional.ts
 */

import { describe, it, expect } from 'vitest';
import { evaluateRule, isFieldVisible } from '../conditional';
import type { ConditionalRule } from '../types';

describe('evaluateRule', () => {
  describe('equals operator', () => {
    it('returns true when values match', () => {
      const rule: ConditionalRule = { field: 'role', operator: 'equals', value: 'admin' };
      expect(evaluateRule(rule, { role: 'admin' })).toBe(true);
    });

    it('returns false when values differ', () => {
      const rule: ConditionalRule = { field: 'role', operator: 'equals', value: 'admin' };
      expect(evaluateRule(rule, { role: 'user' })).toBe(false);
    });

    it('returns false when field is missing', () => {
      const rule: ConditionalRule = { field: 'role', operator: 'equals', value: 'admin' };
      expect(evaluateRule(rule, {})).toBe(false);
    });
  });

  describe('not_equals operator', () => {
    it('returns true when values differ', () => {
      const rule: ConditionalRule = { field: 'type', operator: 'not_equals', value: 'free' };
      expect(evaluateRule(rule, { type: 'premium' })).toBe(true);
    });

    it('returns false when values match', () => {
      const rule: ConditionalRule = { field: 'type', operator: 'not_equals', value: 'free' };
      expect(evaluateRule(rule, { type: 'free' })).toBe(false);
    });
  });

  describe('is_empty operator', () => {
    it('returns true for null', () => {
      const rule: ConditionalRule = { field: 'name', operator: 'is_empty' };
      expect(evaluateRule(rule, { name: null })).toBe(true);
    });

    it('returns true for undefined', () => {
      const rule: ConditionalRule = { field: 'name', operator: 'is_empty' };
      expect(evaluateRule(rule, {})).toBe(true);
    });

    it('returns true for empty string', () => {
      const rule: ConditionalRule = { field: 'name', operator: 'is_empty' };
      expect(evaluateRule(rule, { name: '' })).toBe(true);
    });

    it('returns false for non-empty value', () => {
      const rule: ConditionalRule = { field: 'name', operator: 'is_empty' };
      expect(evaluateRule(rule, { name: 'John' })).toBe(false);
    });
  });

  describe('is_not_empty operator', () => {
    it('returns true for non-empty value', () => {
      const rule: ConditionalRule = { field: 'email', operator: 'is_not_empty' };
      expect(evaluateRule(rule, { email: 'test@test.com' })).toBe(true);
    });

    it('returns false for empty string', () => {
      const rule: ConditionalRule = { field: 'email', operator: 'is_not_empty' };
      expect(evaluateRule(rule, { email: '' })).toBe(false);
    });

    it('returns false for null', () => {
      const rule: ConditionalRule = { field: 'email', operator: 'is_not_empty' };
      expect(evaluateRule(rule, { email: null })).toBe(false);
    });
  });

  describe('gt operator', () => {
    it('returns true when field value is greater', () => {
      const rule: ConditionalRule = { field: 'age', operator: 'gt', value: 18 };
      expect(evaluateRule(rule, { age: 21 })).toBe(true);
    });

    it('returns false when field value is equal', () => {
      const rule: ConditionalRule = { field: 'age', operator: 'gt', value: 18 };
      expect(evaluateRule(rule, { age: 18 })).toBe(false);
    });

    it('returns false when field value is less', () => {
      const rule: ConditionalRule = { field: 'age', operator: 'gt', value: 18 };
      expect(evaluateRule(rule, { age: 16 })).toBe(false);
    });
  });

  describe('lt operator', () => {
    it('returns true when field value is less', () => {
      const rule: ConditionalRule = { field: 'quantity', operator: 'lt', value: 10 };
      expect(evaluateRule(rule, { quantity: 5 })).toBe(true);
    });

    it('returns false when field value is equal', () => {
      const rule: ConditionalRule = { field: 'quantity', operator: 'lt', value: 10 };
      expect(evaluateRule(rule, { quantity: 10 })).toBe(false);
    });

    it('returns false when field value is greater', () => {
      const rule: ConditionalRule = { field: 'quantity', operator: 'lt', value: 10 };
      expect(evaluateRule(rule, { quantity: 15 })).toBe(false);
    });
  });

  describe('contains operator', () => {
    it('returns true when value contains substring', () => {
      const rule: ConditionalRule = { field: 'email', operator: 'contains', value: '@gmail' };
      expect(evaluateRule(rule, { email: 'test@gmail.com' })).toBe(true);
    });

    it('returns false when value does not contain substring', () => {
      const rule: ConditionalRule = { field: 'email', operator: 'contains', value: '@gmail' };
      expect(evaluateRule(rule, { email: 'test@yahoo.com' })).toBe(false);
    });
  });

  describe('unknown operator', () => {
    it('returns false for unknown operator', () => {
      const rule = { field: 'x', operator: 'unknown' as 'equals', value: 'y' };
      expect(evaluateRule(rule, { x: 'y' })).toBe(false);
    });
  });
});

describe('isFieldVisible', () => {
  const values = { role: 'admin', status: 'active' };

  describe('no conditions', () => {
    it('returns true when no showWhen or hideWhen', () => {
      expect(isFieldVisible(undefined, undefined, values)).toBe(true);
    });
  });

  describe('showWhen only', () => {
    it('returns true when showWhen condition is met', () => {
      const showWhen: ConditionalRule = { field: 'role', operator: 'equals', value: 'admin' };
      expect(isFieldVisible(showWhen, undefined, values)).toBe(true);
    });

    it('returns false when showWhen condition is not met', () => {
      const showWhen: ConditionalRule = { field: 'role', operator: 'equals', value: 'user' };
      expect(isFieldVisible(showWhen, undefined, values)).toBe(false);
    });
  });

  describe('hideWhen only', () => {
    it('returns false when hideWhen condition is met', () => {
      const hideWhen: ConditionalRule = { field: 'status', operator: 'equals', value: 'active' };
      expect(isFieldVisible(undefined, hideWhen, values)).toBe(false);
    });

    it('returns true when hideWhen condition is not met', () => {
      const hideWhen: ConditionalRule = { field: 'status', operator: 'equals', value: 'inactive' };
      expect(isFieldVisible(undefined, hideWhen, values)).toBe(true);
    });
  });

  describe('both showWhen and hideWhen', () => {
    it('hideWhen takes precedence - hides when hideWhen is true', () => {
      const showWhen: ConditionalRule = { field: 'role', operator: 'equals', value: 'admin' };
      const hideWhen: ConditionalRule = { field: 'status', operator: 'equals', value: 'active' };
      // showWhen is true, but hideWhen is also true - should hide
      expect(isFieldVisible(showWhen, hideWhen, values)).toBe(false);
    });

    it('shows field when hideWhen is false and showWhen is true', () => {
      const showWhen: ConditionalRule = { field: 'role', operator: 'equals', value: 'admin' };
      const hideWhen: ConditionalRule = { field: 'status', operator: 'equals', value: 'inactive' };
      expect(isFieldVisible(showWhen, hideWhen, values)).toBe(true);
    });

    it('hides field when hideWhen is false but showWhen is also false', () => {
      const showWhen: ConditionalRule = { field: 'role', operator: 'equals', value: 'user' };
      const hideWhen: ConditionalRule = { field: 'status', operator: 'equals', value: 'inactive' };
      // hideWhen is false, but showWhen is also false - should hide
      expect(isFieldVisible(showWhen, hideWhen, values)).toBe(false);
    });
  });
});
