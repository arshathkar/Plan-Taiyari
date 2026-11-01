import { describe, it, expect } from 'vitest';
import {
  EventType,
  DateChoice,
  Intake,
  BudgetCategory,
  Task,
} from '../schema';

describe('Domain Schemas (§8, UT-SCHEMA, R-057)', () => {
  describe('EventType', () => {
    it('accepts valid event types', () => {
      expect(EventType.parse('birthday')).toBe('birthday');
      expect(EventType.parse('wedding')).toBe('wedding');
      expect(EventType.parse('community')).toBe('community');
    });

    it('rejects unsupported event types', () => {
      expect(() => EventType.parse('corporate')).toThrow();
      expect(() => EventType.parse('')).toThrow();
    });
  });

  describe('DateChoice', () => {
    it('accepts fixed dates', () => {
      const parsed = DateChoice.parse({ kind: 'fixed', date: '2026-12-20' });
      expect(parsed.kind).toBe('fixed');
    });

    it('accepts date windows', () => {
      const parsed = DateChoice.parse({
        kind: 'window',
        from: '2026-12-01',
        to: '2026-12-31',
      });
      expect(parsed.kind).toBe('window');
    });

    it('accepts undecided dates with horizonDays', () => {
      const parsed = DateChoice.parse({ kind: 'undecided', horizonDays: 60 });
      expect(parsed.kind).toBe('undecided');
    });
  });

  describe('Intake', () => {
    it('parses valid intake object', () => {
      const valid = {
        eventType: 'birthday',
        title: 'Maya 5th Birthday',
        date: { kind: 'fixed', date: '2026-12-20' },
        guests: { min: 20, expected: 30, max: 40 },
        budget: { basis: 'total', amountInr: 50000 },
        city: 'Mumbai',
        venueType: 'hall',
        mustHaves: ['Cake cutting', 'Games'],
        desiredExperience: 'Cheerful and lively',
        experienceChips: ['interactive', 'kids'],
        cultural: { chips: [], notes: '' },
        dietary: { tags: ['veg'], notes: '' },
        accessibility: { tags: [], notes: '' },
        alcohol: 'no',
        children: true,
        answered: {
          mustHaves: true,
          dietary: true,
          accessibility: true,
          cultural: true,
        },
      };

      const parsed = Intake.parse(valid);
      expect(parsed.title).toBe('Maya 5th Birthday');
      expect(parsed.guests?.expected).toBe(30);
    });

    it('strips unknown keys', () => {
      const input = {
        eventType: 'birthday',
        title: 'Test Birthday',
        date: null,
        guests: null,
        budget: null,
        city: '',
        venueType: 'hall',
        mustHaves: [],
        desiredExperience: '',
        experienceChips: [],
        cultural: { chips: [], notes: '' },
        dietary: { tags: [], notes: '' },
        accessibility: { tags: [], notes: '' },
        alcohol: 'no',
        children: false,
        answered: {
          mustHaves: false,
          dietary: false,
          accessibility: false,
          cultural: false,
        },
        maliciousExtraKey: 'should-be-stripped',
      };

      const parsed = Intake.parse(input) as Record<string, unknown>;
      expect(parsed.maliciousExtraKey).toBeUndefined();
    });
  });

  describe('BudgetCategory', () => {
    it('validates budget category bounds', () => {
      const valid = {
        id: 'catering',
        label: 'Catering & Drinks',
        weight: 36,
        minPct: 15,
        maxPct: 55,
        elasticity: 1.0,
        maxCut: 0.35,
        amountInr: 36000,
        locked: false,
        protected: false,
        committedInr: 10000,
        paidInr: 0,
      };

      const parsed = BudgetCategory.parse(valid);
      expect(parsed.amountInr).toBe(36000);
    });
  });

  describe('Task', () => {
    it('validates priority within 0–3 range', () => {
      const task = {
        id: 'B01',
        title: 'Fix budget',
        categoryId: 'budget',
        priority: 0,
        effortDays: 1,
        dependsOn: [],
        mustFinishDaysBefore: 45,
        done: false,
        completedOn: null,
        notes: '',
        origin: 'template' as const,
      };

      expect(Task.parse(task).priority).toBe(0);
      expect(() => Task.parse({ ...task, priority: 5 })).toThrow();
    });
  });
});
