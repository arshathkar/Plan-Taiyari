import { describe, it, expect } from 'vitest';
import { parseInr, formatInr, formatInrCompact, formatPct } from '../inr';

describe('INR Engine (§7.8, R-057)', () => {
  describe('parseInr', () => {
    it('parses numeric strings with commas', () => {
      expect(parseInr('1,00,000')).toBe(100000);
      expect(parseInr('50,000')).toBe(50000);
      expect(parseInr('5000')).toBe(5000);
    });

    it('parses currency symbols and prefixes', () => {
      expect(parseInr('₹1,00,000')).toBe(100000);
      expect(parseInr('Rs. 50000')).toBe(50000);
      expect(parseInr('rs 25000')).toBe(25000);
      expect(parseInr('INR 75,000')).toBe(75000);
    });

    it('parses suffixes like /- and only', () => {
      expect(parseInr('₹1,00,000/-')).toBe(100000);
      expect(parseInr('50000 only')).toBe(50000);
      expect(parseInr('Rs. 25,000/- only')).toBe(25000);
    });

    it('parses Indian shorthand notation (k, lakh, crore)', () => {
      expect(parseInr('80k')).toBe(80000);
      expect(parseInr('80 thousand')).toBe(80000);
      expect(parseInr('1 lakh')).toBe(100000);
      expect(parseInr('1.5 lakh')).toBe(150000);
      expect(parseInr('2.5 lakhs')).toBe(250000);
      expect(parseInr('5 lac')).toBe(500000);
      expect(parseInr('1 cr')).toBe(10000000);
      expect(parseInr('1.2 crore')).toBe(12000000);
      expect(parseInr('2 crores')).toBe(20000000);
    });

    it('returns null for invalid inputs', () => {
      expect(parseInr('')).toBeNull();
      expect(parseInr('abc')).toBeNull();
      expect(parseInr('-5000')).toBeNull();
      expect(parseInr('0')).toBeNull();
      // Exceeds 100 crore
      expect(parseInr('200 crore')).toBeNull();
    });
  });

  describe('formatInr', () => {
    it('formats numbers in Indian numbering system', () => {
      expect(formatInr(100000)).toBe('₹1,00,000');
      expect(formatInr(50000)).toBe('₹50,000');
      expect(formatInr(10000000)).toBe('₹1,00,00,000');
    });
  });

  describe('formatInrCompact', () => {
    it('formats numbers in compact Indian notation', () => {
      expect(formatInrCompact(100000)).toBe('₹1L');
      expect(formatInrCompact(150000)).toBe('₹1.5L');
      expect(formatInrCompact(80000)).toBe('₹80K');
      expect(formatInrCompact(20000000)).toBe('₹2Cr');
      expect(formatInrCompact(500)).toBe('₹500');
    });
  });

  describe('formatPct', () => {
    it('formats percentages cleanly', () => {
      expect(formatPct(25)).toBe('25%');
      expect(formatPct(33.3)).toBe('33.3%');
      expect(formatPct(0)).toBe('0%');
    });
  });
});
