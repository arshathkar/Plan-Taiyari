/**
 * Timeline Engine (§7.3)
 * Dependency-aware scheduling with priority scoring.
 * Pure function — current date is passed in, no side effects.
 */
import { daysBetween, addDays } from './dates';

export interface TaskInput {
  id: string;
  title: string;
  priority: 0 | 1 | 2 | 3;
  effortDays: number;
  dependsOn: string[];
  mustFinishDaysBefore: number;
  done: boolean;
  completedOn: string | null;
}

export interface ComputedTask extends TaskInput {
  state: 'ready' | 'blocked' | 'done';
  flags: Array<'critical' | 'tight' | 'atRisk' | 'overdue' | 'compressed'>;
  slack: number;
  latestFinish: string;
  earliestStart: string;
  earliestFinish: string;
  priorityScore: number;
  blockedBy: string[];
  downstreamCount: number;
}

export interface TimelineResult {
  tasks: ComputedTask[];
  nextBestActions: ComputedTask[];
  earliestFeasibleDate: string | null;
  minSlack: number;
  hasCycle: boolean;
  cycleTaskIds: string[];
}

/**
 * Compute timeline: states, flags, slack, scores, earliest feasible date.
 */
export function computeTimeline(
  tasks: TaskInput[],
  eventDate: string,
  today: string,
  baselineDate: string
): TimelineResult {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const E = eventDate; // event day
  const T = today;

  // Step 1: Topological sort (Kahn's algorithm) — detect cycles
  const { sorted, hasCycle, cycleTaskIds } = topologicalSort(tasks);

  if (hasCycle) {
    return {
      tasks: tasks.map(t => makeDefaultComputed(t, eventDate, today)),
      nextBestActions: [],
      earliestFeasibleDate: null,
      minSlack: 0,
      hasCycle: true,
      cycleTaskIds,
    };
  }

  // Build successor map
  const successors = new Map<string, string[]>();
  for (const t of tasks) {
    successors.set(t.id, []);
  }
  for (const t of tasks) {
    for (const dep of t.dependsOn) {
      successors.get(dep)?.push(t.id);
    }
  }

  // Count downstream not-done tasks
  const downstreamCount = new Map<string, number>();
  for (const id of [...sorted].reverse()) {
    const succs = successors.get(id) ?? [];
    let count = 0;
    for (const s of succs) {
      const st = taskMap.get(s);
      if (st && !st.done) {
        count += 1 + (downstreamCount.get(s) ?? 0);
      }
    }
    downstreamCount.set(id, count);
  }

  // Step 2: Backward pass (latest times)
  const latestFinish = new Map<string, number>(); // days from today
  const daysToEvent = daysBetween(T, E);

  for (const id of [...sorted].reverse()) {
    const task = taskMap.get(id)!;
    let lf = daysToEvent - task.mustFinishDaysBefore;

    // Constrained by successors
    const succs = successors.get(id) ?? [];
    for (const s of succs) {
      const sTask = taskMap.get(s)!;
      const sLf = latestFinish.get(s)!;
      const sLs = sLf - sTask.effortDays;
      lf = Math.min(lf, sLs);
    }

    latestFinish.set(id, lf);
  }

  // Step 3: Forward pass (earliest times)
  const earliestStart = new Map<string, number>();
  const earliestFinish = new Map<string, number>();

  for (const id of sorted) {
    const task = taskMap.get(id)!;

    if (task.done && task.completedOn) {
      const ef = daysBetween(T, task.completedOn);
      earliestFinish.set(id, ef);
      earliestStart.set(id, ef - task.effortDays);
    } else {
      let es = 0; // today
      for (const dep of task.dependsOn) {
        const depEf = earliestFinish.get(dep) ?? 0;
        es = Math.max(es, depEf);
      }
      earliestStart.set(id, es);
      earliestFinish.set(id, es + task.effortDays);
    }
  }

  // Step 4: Compute states, slack, flags, scores
  const computed: ComputedTask[] = [];
  let minSlack = Infinity;

  for (const task of tasks) {
    const lf = latestFinish.get(task.id) ?? 0;
    const ef = earliestFinish.get(task.id) ?? 0;
    const es = earliestStart.get(task.id) ?? 0;
    const slack = lf - ef;

    if (!task.done) {
      minSlack = Math.min(minSlack, slack);
    }

    // State
    let state: 'ready' | 'blocked' | 'done' = 'ready';
    const blockedBy: string[] = [];

    if (task.done) {
      state = 'done';
    } else {
      for (const dep of task.dependsOn) {
        const depTask = taskMap.get(dep);
        if (depTask && !depTask.done) {
          state = 'blocked';
          blockedBy.push(dep);
        }
      }
    }

    // Flags
    const flags: ComputedTask['flags'] = [];

    if (!task.done) {
      if (lf < daysBetween(baselineDate, T)) {
        flags.push('compressed');
      } else if (lf < 0) {
        flags.push('overdue');
      } else if (slack < 0) {
        flags.push('atRisk');
      } else if (slack <= 3) {
        flags.push('tight');
      }

      if (slack <= 0) {
        flags.push('critical');
      }
    }

    // Priority score: 100 × (4 − p) + 5 × urgency + 3 × downstream
    const urgency = Math.max(0, Math.min(10, 10 - lf / 3));
    const downstream = Math.min(10, downstreamCount.get(task.id) ?? 0);
    const priorityScore = 100 * (4 - task.priority) + 5 * Math.round(urgency) + 3 * downstream;

    computed.push({
      ...task,
      state,
      flags,
      slack,
      latestFinish: addDays(T, lf),
      earliestStart: addDays(T, es),
      earliestFinish: addDays(T, ef),
      priorityScore,
      blockedBy,
      downstreamCount: downstreamCount.get(task.id) ?? 0,
    });
  }

  if (minSlack === Infinity) minSlack = 0;

  // Earliest feasible date
  let earliestFeasibleDate: string | null = null;
  if (minSlack < 0) {
    earliestFeasibleDate = addDays(E, -minSlack);
  }

  // Next best actions: top 3 ready tasks by score
  const readyTasks = computed
    .filter(t => t.state === 'ready')
    .sort((a, b) => b.priorityScore - a.priorityScore);
  const nextBestActions = readyTasks.slice(0, 3);

  return {
    tasks: computed,
    nextBestActions,
    earliestFeasibleDate,
    minSlack,
    hasCycle: false,
    cycleTaskIds: [],
  };
}

/** Kahn's topological sort — returns sorted IDs and cycle info */
function topologicalSort(tasks: TaskInput[]) {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  const taskIds = new Set(tasks.map(t => t.id));

  for (const t of tasks) {
    inDegree.set(t.id, 0);
    adj.set(t.id, []);
  }

  for (const t of tasks) {
    for (const dep of t.dependsOn) {
      if (taskIds.has(dep)) {
        adj.get(dep)!.push(t.id);
        inDegree.set(t.id, (inDegree.get(t.id) ?? 0) + 1);
      }
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    sorted.push(id);
    for (const next of adj.get(id) ?? []) {
      const newDeg = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, newDeg);
      if (newDeg === 0) queue.push(next);
    }
  }

  const hasCycle = sorted.length < tasks.length;
  const cycleTaskIds = hasCycle
    ? tasks.filter(t => !sorted.includes(t.id)).map(t => t.id)
    : [];

  return { sorted, hasCycle, cycleTaskIds };
}

function makeDefaultComputed(task: TaskInput, eventDate: string, today: string): ComputedTask {
  return {
    ...task,
    state: task.done ? 'done' : 'ready',
    flags: [],
    slack: 0,
    latestFinish: eventDate,
    earliestStart: today,
    earliestFinish: today,
    priorityScore: 100 * (4 - task.priority),
    blockedBy: [],
    downstreamCount: 0,
  };
}
