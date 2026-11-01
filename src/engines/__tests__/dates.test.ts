import { describe, it, expect } from 'vitest';
import {
  daysBetween,
  addDays,
  formatDateDisplay,
  isValidFutureDate,
  daysFromNow,
  formatRelativeDays,
} from '../dates';

describe('Dates Engine (§7.8, R-057)', () => {
  describe('daysBetween', () => {
    it('calculates days between two ISO dates correctly', () => {
      expect(daysBetween('2026-10-31', '2026-12-20')).toBe(50);
      expect(daysBetween('2026-10-31', '2026-11-30')).toBe(30);
      expect(daysBetween('2026-10-31', '2026-10-31')).toBe(0);
      expect(daysBetween('2026-12-20', '2026-10-31')).toBe(-50);
    });

    it('handles month and year boundaries', () => {
      expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
      expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1);
    });
  });

  describe('addDays', () => {
    it('adds positive days correctly', () => {
      expect(addDays('2026-10-31', 50)).toBe('2026-12-20');
      expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    });

    it('subtracts days with negative numbers', () => {
      expect(addDays('2026-12-20', -50)).toBe('2026-10-31');
      expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
    });
  });

  describe('formatDateDisplay', () => {
    it('formats date in en-IN human readable style', () => {
      const display = formatDateDisplay('2026-12-20');
      expect(display).toContain('20');
      expect(display).toContain('Dec');
      expect(display).toContain('2026');
    });
  });

  describe('isValidFutureDate', () => {
    it('validates dates today or in the future up to 3 years', () => {
      expect(isValidFutureDate('2026-10-31', '2026-10-31')).toBe(true);
      expect(isValidFutureDate('2026-12-20', '2026-10-31')).toBe(true);
      expect(isValidFutureDate('2026-10-30', '2026-10-31')).toBe(false);
      expect(isValidFutureDate('2035-01-01', '2026-10-31')).toBe(false);
    });
  });

  describe('daysFromNow', () => {
    it('calculates days from given today date', () => {
      expect(daysFromNow('2026-12-20', '2026-10-31')).toBe(50);
      expect(daysFromNow('2026-10-30', '2026-10-31')).toBe(-1);
    });
  });

  describe('formatRelativeDays', () => {
    it('formats relative day offsets', () => {
      expect(formatRelativeDays(0)).toBe('today');
      expect(formatRelativeDays(1)).toBe('tomorrow');
      expect(formatRelativeDays(-1)).toBe('yesterday');
      expect(formatRelativeDays(12)).toBe('in 12 days');
      expect(formatRelativeDays(-5)).toBe('5 days ago');
    });
  });
});
