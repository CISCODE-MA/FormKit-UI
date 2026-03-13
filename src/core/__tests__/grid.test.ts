/**
 * Tests for grid utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getGridColumnsClass,
  getColSpanClass,
  getGapClass,
  getGridContainerClass,
  normalizeColumnCount,
} from '../grid';

describe('grid utilities', () => {
  describe('getGridColumnsClass', () => {
    it('returns simple column class for number', () => {
      expect(getGridColumnsClass(1)).toBe('grid-cols-1');
      expect(getGridColumnsClass(3)).toBe('grid-cols-3');
      expect(getGridColumnsClass(12)).toBe('grid-cols-12');
    });

    it('returns responsive classes for object config', () => {
      expect(getGridColumnsClass({ default: 1, md: 2 })).toBe('grid-cols-1 md:grid-cols-2');
      expect(getGridColumnsClass({ default: 1, sm: 2, lg: 3 })).toBe(
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      );
      expect(getGridColumnsClass({ default: 1, sm: 2, md: 3, lg: 4, xl: 6 })).toBe(
        'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
      );
    });

    it('handles partial responsive config', () => {
      expect(getGridColumnsClass({ md: 2 })).toBe('md:grid-cols-2');
      expect(getGridColumnsClass({ lg: 4 })).toBe('lg:grid-cols-4');
    });

    it('defaults to 1 column', () => {
      expect(getGridColumnsClass()).toBe('grid-cols-1');
    });
  });

  describe('getColSpanClass', () => {
    it('returns simple col-span class for number', () => {
      expect(getColSpanClass(1)).toBe('col-span-1');
      expect(getColSpanClass(6)).toBe('col-span-6');
      expect(getColSpanClass(12)).toBe('col-span-12');
    });

    it('returns responsive classes for object config', () => {
      expect(getColSpanClass({ default: 12, md: 6 })).toBe('col-span-12 md:col-span-6');
      expect(getColSpanClass({ default: 12, sm: 6, lg: 4 })).toBe(
        'col-span-12 sm:col-span-6 lg:col-span-4',
      );
    });

    it('adds default span when not specified in responsive config', () => {
      expect(getColSpanClass({ md: 6 })).toBe('col-span-1 md:col-span-6');
      expect(getColSpanClass({ md: 6 }, 2)).toBe('col-span-2 md:col-span-6');
    });

    it('uses default span when undefined', () => {
      expect(getColSpanClass(undefined)).toBe('col-span-1');
      expect(getColSpanClass(undefined, 4)).toBe('col-span-4');
    });
  });

  describe('getGapClass', () => {
    it('returns gap class', () => {
      expect(getGapClass(2)).toBe('gap-2');
      expect(getGapClass(4)).toBe('gap-4');
      expect(getGapClass(8)).toBe('gap-8');
    });

    it('defaults to gap-4', () => {
      expect(getGapClass()).toBe('gap-4');
    });
  });

  describe('getGridContainerClass', () => {
    it('combines grid, columns, and gap classes', () => {
      expect(getGridContainerClass(2, 4)).toBe('grid grid-cols-2 gap-4');
      expect(getGridContainerClass(3, 6)).toBe('grid grid-cols-3 gap-6');
    });

    it('works with responsive columns', () => {
      expect(getGridContainerClass({ default: 1, md: 2 }, 4)).toBe(
        'grid grid-cols-1 md:grid-cols-2 gap-4',
      );
    });

    it('uses defaults', () => {
      expect(getGridContainerClass()).toBe('grid grid-cols-1 gap-4');
    });
  });

  describe('normalizeColumnCount', () => {
    it('returns number as-is', () => {
      expect(normalizeColumnCount(2)).toBe(2);
      expect(normalizeColumnCount(6)).toBe(6);
    });

    it('extracts default from responsive config', () => {
      expect(normalizeColumnCount({ default: 2, md: 4 })).toBe(2);
      expect(normalizeColumnCount({ default: 1, lg: 3 })).toBe(1);
    });

    it('returns fallback when no default in responsive config', () => {
      expect(normalizeColumnCount({ md: 4 })).toBe(1);
      expect(normalizeColumnCount({ md: 4 }, 2)).toBe(2);
    });

    it('returns fallback when undefined', () => {
      expect(normalizeColumnCount(undefined)).toBe(1);
      expect(normalizeColumnCount(undefined, 3)).toBe(3);
    });
  });
});
