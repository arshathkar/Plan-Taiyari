/**
 * Ripple Rules Engine (§7.7)
 * Pure functions: given (prevState, nextState), produce Effects[].
 * Each rule is independently testable.
 */

import type { Plan, Task } from '@/domain/schema';

/* ── Effect types ────────────────────────────────────────────── */

export type RippleEffect =
  | { type: 'toast'; message: string }
  | { type: 'banner'; title: string; message: string }
  | { type: 'add_task'; task: Partial<Task> & { id: string; title: string; categoryId: string } }
  | { type: 'add_requirement'; categoryId: string; requirementId: string; label: string }
  | { type: 'update_task_notes'; taskId: string; append: string }
  | { type: 'rebalance_needed' }
  | { type: 'recompute_timeline' }
  | { type: 'add_vendor_to_roster'; vendorId: string }
  | { type: 'add_payment_items'; vendorId: string }
  | { type: 'suggest_complete_task'; taskId: string; taskTitle: string }
  | { type: 'suggest_book_vendor'; vendorCategoryId: string }
  | { type: 'confirm_regenerate'; addedItems: string[]; removedItems: string[] };

/* ── Rule RR1: Event date changed ────────────────────────── */

export function rr1_dateChanged(prev: Plan, next: Plan): RippleEffect[] {
  const prevDate = getEventDate(prev);
  const nextDate = getEventDate(next);
  if (prevDate === nextDate) return [];

  const effects: RippleEffect[] = [{ type: 'recompute_timeline' }];

  // Count tasks that will become tight
  const bookedVendors = next.vendors.filter(v => v.status === 'booked');
  const tightCount = next.tasks.filter(t => !t.done).length; // approximate

  let message = `Date moved to ${nextDate}.`;
  if (bookedVendors.length > 0) {
    message += ` ${bookedVendors.length} vendor${bookedVendors.length > 1 ? 's' : ''} need re-confirming.`;
    // Add re-confirm tasks for booked vendors
    for (const v of bookedVendors) {
      effects.push({
        type: 'add_task',
        task: {
          id: `reconfirm-${v.id.slice(0, 8)}`,
          title: `Re-confirm ${v.name} for new date`,
          categoryId: v.categoryId,
          priority: 0,
          effortDays: 1,
          dependsOn: [],
          mustFinishDaysBefore: 14,
          done: false,
          completedOn: null,
          notes: `Date changed from ${prevDate} to ${nextDate}. Re-confirm availability.`,
          origin: 'ripple',
        },
      });
    }
  }

  effects.push({ type: 'toast', message });
  return effects;
}

/* ── Rule RR2: Guest count changed ──────────────────────── */

export function rr2_guestCountChanged(prev: Plan, next: Plan): RippleEffect[] {
  const prevGuests = prev.intake.guests?.expected;
  const nextGuests = next.intake.guests?.expected;
  if (!prevGuests || !nextGuests || prevGuests === nextGuests) return [];

  const effects: RippleEffect[] = [
    { type: 'rebalance_needed' },
    {
      type: 'banner',
      title: 'Guest count changed',
      message: `${prevGuests} → ${nextGuests} guests. Budget allocations will be recalculated.`,
    },
  ];

  // Update invitation/favour task notes
  const invitationTask = next.tasks.find(t =>
    t.title.toLowerCase().includes('invitation') || t.id.includes('invite')
  );
  if (invitationTask) {
    effects.push({
      type: 'update_task_notes',
      taskId: invitationTask.id,
      append: `Guest count updated to ${nextGuests}.`,
    });
  }

  return effects;
}

/* ── Rule RR3: Budget total changed ──────────────────────── */

export function rr3_budgetChanged(prev: Plan, next: Plan): RippleEffect[] {
  if (prev.budget.totalInr === next.budget.totalInr) return [];

  return [
    { type: 'rebalance_needed' },
    {
      type: 'banner',
      title: 'Budget changed',
      message: `Budget updated from ₹${prev.budget.totalInr.toLocaleString('en-IN')} to ₹${next.budget.totalInr.toLocaleString('en-IN')}.`,
    },
  ];
}

/* ── Rule RR4: Must-haves changed ───────────────────────── */

export function rr4_mustHavesChanged(prev: Plan, next: Plan): RippleEffect[] {
  const prevSet = new Set(prev.intake.mustHaves);
  const nextSet = new Set(next.intake.mustHaves);

  const added = [...nextSet].filter(x => !prevSet.has(x));
  const removed = [...prevSet].filter(x => !nextSet.has(x));

  if (added.length === 0 && removed.length === 0) return [];

  const effects: RippleEffect[] = [];
  if (added.length > 0) {
    effects.push({
      type: 'banner',
      title: 'Must-haves updated',
      message: `Added: ${added.join(', ')}. Related categories will be protected in trade-offs.`,
    });
  }

  return effects;
}

/* ── Rule RR5: Task completed ───────────────────────────── */

export function rr5_taskCompleted(prev: Plan, next: Plan): RippleEffect[] {
  const effects: RippleEffect[] = [];

  for (const nextTask of next.tasks) {
    const prevTask = prev.tasks.find(t => t.id === nextTask.id);
    if (!prevTask) continue;
    if (!prevTask.done && nextTask.done) {
      // Find successors that are now unblocked
      const successors = next.tasks.filter(t =>
        t.dependsOn.includes(nextTask.id) && !t.done
      );
      const unblocked = successors.filter(s =>
        s.dependsOn.every(dep => next.tasks.find(t => t.id === dep)?.done)
      );

      effects.push({ type: 'recompute_timeline' });

      if (unblocked.length > 0) {
        const names = unblocked.map(t => t.title).join(', ');
        effects.push({
          type: 'toast',
          message: `${nextTask.title} done! Unblocked: ${names}`,
        });
      }

      // Suggest booking matching vendor if it's a "book" task
      if (nextTask.title.toLowerCase().includes('book')) {
        effects.push({
          type: 'suggest_book_vendor',
          vendorCategoryId: nextTask.categoryId,
        });
      }
    }
  }

  return effects;
}

/* ── Rule RR6: Vendor booked ────────────────────────────── */

export function rr6_vendorBooked(prev: Plan, next: Plan): RippleEffect[] {
  const effects: RippleEffect[] = [];

  for (const nextVendor of next.vendors) {
    const prevVendor = prev.vendors.find(v => v.id === nextVendor.id);
    if (!prevVendor) continue;
    if (prevVendor.status !== 'booked' && nextVendor.status === 'booked') {
      // Add to event-day roster
      effects.push({ type: 'add_vendor_to_roster', vendorId: nextVendor.id });

      // Add payment items
      if (nextVendor.payments.length > 0) {
        effects.push({ type: 'add_payment_items', vendorId: nextVendor.id });
      }

      // Suggest completing the matching "book" task
      const bookTask = next.tasks.find(t =>
        t.categoryId === nextVendor.categoryId &&
        t.title.toLowerCase().includes('book') &&
        !t.done
      );
      if (bookTask) {
        effects.push({
          type: 'suggest_complete_task',
          taskId: bookTask.id,
          taskTitle: bookTask.title,
        });
      }
    }
  }

  return effects;
}

/* ── Rule RR7: Accessibility needs added ─────────────────── */

export function rr7_accessibilityChanged(prev: Plan, next: Plan): RippleEffect[] {
  const prevTags = new Set(prev.intake.accessibility.tags);
  const nextTags = new Set(next.intake.accessibility.tags);

  const added = [...nextTags].filter(x => !prevTags.has(x));
  if (added.length === 0) return [];

  const effects: RippleEffect[] = [];
  const addedItems: string[] = [];

  for (const tag of added) {
    switch (tag) {
      case 'stepFree':
      case 'wheelchair':
        effects.push({
          type: 'add_requirement',
          categoryId: 'venue',
          requirementId: `acc-${tag}`,
          label: 'Step-free / wheelchair accessible entry and venue',
        });
        addedItems.push('venue accessibility requirement');
        break;
      case 'elderSeating':
        effects.push({
          type: 'add_requirement',
          categoryId: 'venue',
          requirementId: 'acc-elder',
          label: 'Comfortable seating for elderly guests',
        });
        addedItems.push('elder seating requirement');
        break;
      case 'hearing':
        effects.push({
          type: 'add_requirement',
          categoryId: 'music',
          requirementId: 'acc-hearing',
          label: 'Hearing-accessible: induction loop / sign language interpreter',
        });
        addedItems.push('hearing accessibility requirement');
        break;
    }
  }

  if (addedItems.length > 0) {
    effects.push({
      type: 'toast',
      message: `Added: ${addedItems.join(', ')}`,
    });
  }

  return effects;
}

/* ── Rule RR8: Dietary needs changed ─────────────────────── */

export function rr8_dietaryChanged(prev: Plan, next: Plan): RippleEffect[] {
  const prevTags = new Set(prev.intake.dietary.tags);
  const nextTags = new Set(next.intake.dietary.tags);

  const added = [...nextTags].filter(x => !prevTags.has(x));
  if (added.length === 0) return [];

  const effects: RippleEffect[] = [];
  const labels: string[] = [];

  for (const tag of added) {
    const labelMap: Record<string, string> = {
      jain: 'Jain / no-onion-garlic options required',
      vegan: 'Vegan menu options required',
      halal: 'Halal menu required',
      noOnionGarlic: 'No-onion-no-garlic options required',
    };

    if (labelMap[tag]) {
      effects.push({
        type: 'add_requirement',
        categoryId: 'caterer',
        requirementId: `diet-${tag}`,
        label: labelMap[tag],
      });
      labels.push(labelMap[tag]);
    }
  }

  // Update menu task notes
  const menuTask = next.tasks.find(t =>
    t.title.toLowerCase().includes('menu') || t.title.toLowerCase().includes('catering')
  );
  if (menuTask && added.length > 0) {
    effects.push({
      type: 'update_task_notes',
      taskId: menuTask.id,
      append: `Dietary needs updated: ${added.join(', ')}`,
    });
  }

  if (labels.length > 0) {
    effects.push({
      type: 'toast',
      message: `Added caterer requirements: ${labels.join('; ')}`,
    });
  }

  return effects;
}

/* ── Rule RR9: Venue type set to outdoor ─────────────────── */

export function rr9_venueOutdoor(prev: Plan, next: Plan): RippleEffect[] {
  if (prev.intake.venueType === 'outdoor' || next.intake.venueType !== 'outdoor') return [];

  const effects: RippleEffect[] = [
    {
      type: 'add_task',
      task: {
        id: 'weather-backup',
        title: 'Arrange weather backup plan (tent / indoor fallback)',
        categoryId: 'venue',
        priority: 1,
        effortDays: 3,
        dependsOn: [],
        mustFinishDaysBefore: 7,
        done: false,
        completedOn: null,
        notes: 'Outdoor venue selected. Plan for rain or extreme heat.',
        origin: 'ripple',
      },
    },
    {
      type: 'add_requirement',
      categoryId: 'venue',
      requirementId: 'outdoor-weather',
      label: 'Weather backup plan / tent / indoor fallback available',
    },
    {
      type: 'toast',
      message: 'Outdoor venue: added weather backup task and requirements.',
    },
  ];

  return effects;
}

/* ── Rule RR10: Event type changed ──────────────────────── */

export function rr10_eventTypeChanged(prev: Plan, next: Plan): RippleEffect[] {
  if (prev.intake.eventType === next.intake.eventType) return [];

  return [
    {
      type: 'confirm_regenerate',
      addedItems: [`New ${next.intake.eventType} templates`],
      removedItems: [`Old ${prev.intake.eventType} templates`],
    },
  ];
}

/* ── Run all rules ──────────────────────────────────────────── */

export function computeRippleEffects(prev: Plan, next: Plan): RippleEffect[] {
  const allEffects: RippleEffect[] = [
    ...rr1_dateChanged(prev, next),
    ...rr2_guestCountChanged(prev, next),
    ...rr3_budgetChanged(prev, next),
    ...rr4_mustHavesChanged(prev, next),
    ...rr5_taskCompleted(prev, next),
    ...rr6_vendorBooked(prev, next),
    ...rr7_accessibilityChanged(prev, next),
    ...rr8_dietaryChanged(prev, next),
    ...rr9_venueOutdoor(prev, next),
    ...rr10_eventTypeChanged(prev, next),
  ];

  return allEffects;
}

/* ── Helpers ─────────────────────────────────────────────────── */

function getEventDate(plan: Plan): string | null {
  if (plan.intake.date?.kind === 'fixed') return plan.intake.date.date;
  return null;
}
