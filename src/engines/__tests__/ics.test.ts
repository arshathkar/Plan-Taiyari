import { describe, it, expect } from 'vitest';
import { buildIcs } from '../ics';

describe('ICS Calendar Export Engine (§7.9, UT-ICS, R-057)', () => {
  it('generates valid RFC 5545 format with VCALENDAR and VEVENT blocks', () => {
    const tasks = [
      { id: 'B01', title: 'Fix total budget', latestFinish: '2026-11-05' },
      { id: 'B06', title: 'Book venue; get in writing', latestFinish: '2026-11-15' },
    ];
    const planId = 'plan-12345678';

    const ics = buildIcs(tasks, planId);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Plan Taiyari//Celebration Planner//EN');
    expect(ics).toContain('END:VCALENDAR');

    // Each task has a VEVENT
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Fix total budget');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261105');
    expect(ics).toContain('SUMMARY:Book venue\\; get in writing'); // Escapes semicolon
    expect(ics).toContain('DTSTART;VALUE=DATE:20261115');
    expect(ics).toContain('B01-plan-12345678@plantaiyari.local');

    // Windows CRLF line endings
    expect(ics).toContain('\r\n');
  });

  it('handles empty task lists gracefully', () => {
    const ics = buildIcs([], 'empty-plan');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).not.toContain('BEGIN:VEVENT');
  });
});
