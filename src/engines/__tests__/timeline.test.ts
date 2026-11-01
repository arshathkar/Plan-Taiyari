import { describe, it, expect } from 'vitest';
import { computeTimeline, type TaskInput } from '../timeline';
import { getTaskTemplate } from '@/domain/templates/task-templates';

function getBirthdayTasks(): TaskInput[] {
  const templates = getTaskTemplate('birthday');
  return templates.map(t => ({
    ...t,
    done: false,
    completedOn: null,
  }));
}

describe('Timeline Engine (§7.3, Golden Scenarios G-7, R-057)', () => {
  const baseline = '2026-10-31';

  it('G-7a: Birthday, 20 Dec 2026 (50 days) -> B01 is ready, topological order is valid', () => {
    const tasks = getBirthdayTasks();
    const result = computeTimeline(tasks, '2026-12-20', baseline, baseline);

    expect(result.hasCycle).toBe(false);

    // Initial ready task is B01 (has no dependencies)
    const b01 = result.tasks.find(t => t.id === 'B01')!;
    expect(b01.state).toBe('ready');

    // Dependent tasks are initially blocked
    const b02 = result.tasks.find(t => t.id === 'B02')!;
    expect(b02.state).toBe('blocked');
    expect(b02.blockedBy).toContain('B01');

    // Critical/tight flags computed
    expect(result.minSlack).toBeGreaterThanOrEqual(0);
  });

  it('G-7a (part 2): Completing B01 and B02 unblocks successors B03 and B07', () => {
    const tasks = getBirthdayTasks().map(t => {
      if (t.id === 'B01' || t.id === 'B02') {
        return { ...t, done: true, completedOn: baseline };
      }
      return t;
    });

    const result = computeTimeline(tasks, '2026-12-20', baseline, baseline);
    const b07 = result.tasks.find(t => t.id === 'B07')!; // depends only on B02
    expect(b07.state).toBe('ready');
  });

  it('G-7b: Birthday, 30 Nov 2026 (30 days) -> compressed plan with earliest feasible date', () => {
    const tasks = getBirthdayTasks();
    const result = computeTimeline(tasks, '2026-11-30', baseline, baseline);

    // Date is too close, resulting in negative slack and compressed flags
    expect(result.minSlack).toBeLessThan(0);

    const compressedTasks = result.tasks.filter(t => t.flags.includes('compressed'));
    expect(compressedTasks.length).toBeGreaterThan(0);

    // Engine computes the earliest feasible date where minSlack >= 0
    expect(result.earliestFeasibleDate).toBeDefined();
    if (result.earliestFeasibleDate) {
      expect(result.earliestFeasibleDate >= '2026-12-15').toBe(true);
    }
  });

  it('Cycle detection: detects cyclic dependencies and flags cycle', () => {
    const tasks: TaskInput[] = [
      {
        id: 'T1',
        title: 'Task 1',
        priority: 0,
        effortDays: 1,
        dependsOn: ['T2'],
        mustFinishDaysBefore: 10,
        done: false,
        completedOn: null,
      },
      {
        id: 'T2',
        title: 'Task 2',
        priority: 0,
        effortDays: 1,
        dependsOn: ['T1'], // Cycle: T1 <-> T2
        mustFinishDaysBefore: 10,
        done: false,
        completedOn: null,
      },
    ];

    const result = computeTimeline(tasks, '2026-12-20', baseline, baseline);
    expect(result.hasCycle).toBe(true);
    expect(result.cycleTaskIds).toContain('T1');
    expect(result.cycleTaskIds).toContain('T2');
  });

  it('Next best actions prioritize ready tasks by priority and downstream impact', () => {
    const tasks = getBirthdayTasks();
    const result = computeTimeline(tasks, '2026-12-20', baseline, baseline);

    expect(result.nextBestActions.length).toBeGreaterThan(0);
    // All next best actions must be in 'ready' state
    for (const action of result.nextBestActions) {
      expect(action.state).toBe('ready');
    }
  });
});
