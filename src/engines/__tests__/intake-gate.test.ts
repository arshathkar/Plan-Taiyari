import { describe, it, expect } from 'vitest';
import { isReadyToPlan, missingFields, nextQuestion, answeredCount } from '../intake-gate';
import type { Intake } from '@/domain/schema';

function makeBaseIntake(): Intake {
  return {
    eventType: 'birthday',
    title: 'Aarav 10th Birthday',
    date: { kind: 'fixed', date: '2026-12-20' },
    guests: { min: 40, expected: 50, max: 60 },
    budget: { basis: 'total', amountInr: 100000 },
    city: 'Bengaluru',
    venueType: 'hall',
    mustHaves: ['Good food', 'Photo booth'],
    desiredExperience: 'Fun and memorable',
    experienceChips: ['interactive', 'kids'],
    cultural: { chips: [], notes: '' },
    dietary: { tags: ['veg'], notes: '' },
    accessibility: { tags: ['wheelchair'], notes: '' },
    alcohol: 'no',
    children: true,
    answered: {
      mustHaves: true,
      dietary: true,
      accessibility: true,
      cultural: true,
    },
  };
}

describe('Intake Gate Engine (§7.6, Golden G-9, R-057)', () => {
  it('IG-1: All required answered -> gate open', () => {
    const intake = makeBaseIntake();
    expect(isReadyToPlan(intake)).toBe(true);
    expect(missingFields(intake)).toEqual([]);
  });

  it('IG-2: Budget missing -> closed; missing = [budget]', () => {
    const intake = makeBaseIntake();
    intake.budget = null;
    expect(isReadyToPlan(intake)).toBe(false);
    expect(missingFields(intake)).toContain('budget');
  });

  it('IG-3: Must-haves not marked answered -> closed', () => {
    const intake = makeBaseIntake();
    intake.mustHaves = [];
    intake.answered.mustHaves = false;
    expect(isReadyToPlan(intake)).toBe(false);
    expect(missingFields(intake)).toContain('must-haves');
  });

  it('IG-4: Must-haves empty but answered ("None of these") -> open if rest complete', () => {
    const intake = makeBaseIntake();
    intake.mustHaves = [];
    intake.answered.mustHaves = true;
    expect(isReadyToPlan(intake)).toBe(true);
    expect(missingFields(intake)).not.toContain('must-haves');
  });

  it('IG-5: Date undecided with horizon 60 days -> open', () => {
    const intake = makeBaseIntake();
    intake.date = { kind: 'undecided', horizonDays: 60 };
    expect(isReadyToPlan(intake)).toBe(true);
  });

  it('IG-6: Guests expected < 1 -> invalid, closed', () => {
    const intake = makeBaseIntake();
    intake.guests = { min: 0, expected: 0, max: 0 };
    expect(isReadyToPlan(intake)).toBe(false);
    expect(missingFields(intake)).toContain('guest count');
  });

  it('IG-7: Budget < ₹1000 -> invalid, closed', () => {
    const intake = makeBaseIntake();
    intake.budget = { basis: 'total', amountInr: 500 };
    expect(isReadyToPlan(intake)).toBe(false);
    expect(missingFields(intake)).toContain('budget');
  });

  it('nextQuestion returns the first unanswered question in fixed order', () => {
    const intake = makeBaseIntake();
    intake.budget = null;
    intake.answered.accessibility = false;
    // Budget comes before accessibility in question order
    expect(nextQuestion(intake)).toBe('budget');
  });

  it('answeredCount correctly tracks progress', () => {
    const intake = makeBaseIntake();
    const full = answeredCount(intake);
    expect(full.answered).toBe(full.total);

    intake.budget = null;
    const missingOne = answeredCount(intake);
    expect(missingOne.answered).toBe(full.total - 1);
  });
});
