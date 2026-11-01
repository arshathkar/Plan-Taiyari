/**
 * Plan Taiyari — Zustand Store (F10)
 * Plan state with localStorage persistence, undo/redo, and snapshots.
 */
'use client';

import { create } from 'zustand';
import type { Plan, Intake } from '@/domain/schema';
import { Plan as PlanSchema } from '@/domain/schema';
import { getBudgetTemplate, getTaskTemplate, getVendorTemplate } from '@/domain/templates';
import { allocateBudget } from '@/engines/budget-allocator';
import { todayIst } from '@/engines/dates';
import { buildSamplePlan } from '@/fixtures/sample-birthday';

/* ── Types ──────────────────────────────────────────────────── */

export interface AppSettings {
  theme: 'auto' | 'light' | 'dark';
  reduceTransparency: boolean;
  reduceMotion: boolean;
  textSize: 100 | 115 | 130;
}

export interface Snapshot {
  name: string;
  createdAt: string;
  plan: Plan;
}

interface PlanState {
  plan: Plan | null;
  settings: AppSettings;
  undoStack: Plan[];
  redoStack: Plan[];
  snapshots: Snapshot[];

  // Actions
  setPlan: (plan: Plan) => void;
  updatePlan: (updater: (plan: Plan) => Plan) => void;
  undo: () => void;
  redo: () => void;
  saveSnapshot: (name: string) => void;
  restoreSnapshot: (index: number) => void;
  clearPlan: () => void;
  setSettings: (partial: Partial<AppSettings>) => void;
  generatePlan: (intake: Intake) => void;
  loadSampleEvent: () => void;
  exportPlan: () => string;
  importPlan: (json: string) => boolean;
}

/* ── Storage helpers ────────────────────────────────────────── */

const PLAN_KEY = 'plantaiyari:plan:v1';
const SETTINGS_KEY = 'plantaiyari:settings:v1';
const SNAPSHOTS_KEY = 'plantaiyari:snapshots:v1';
const CORRUPT_KEY = 'plantaiyari:plan:v1:corrupt';

function safeGetItem(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSetItem(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

function safeRemoveItem(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

function loadPlan(): Plan | null {
  const raw = safeGetItem(PLAN_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const result = PlanSchema.safeParse(parsed?.plan ?? parsed);
    if (result.success) return result.data;
    // Quarantine corrupt data
    safeSetItem(CORRUPT_KEY, raw);
    safeRemoveItem(PLAN_KEY);
    return null;
  } catch {
    safeSetItem(CORRUPT_KEY, raw);
    safeRemoveItem(PLAN_KEY);
    return null;
  }
}

function savePlan(plan: Plan | null): void {
  if (plan) {
    safeSetItem(PLAN_KEY, JSON.stringify({ v: 1, plan }));
  } else {
    safeRemoveItem(PLAN_KEY);
  }
}

function loadSettings(): AppSettings {
  const defaults: AppSettings = { theme: 'auto', reduceTransparency: false, reduceMotion: false, textSize: 100 };
  const raw = safeGetItem(SETTINGS_KEY);
  if (!raw) return defaults;
  try { return { ...defaults, ...JSON.parse(raw) }; } catch { return defaults; }
}

function saveSettings(s: AppSettings): void {
  safeSetItem(SETTINGS_KEY, JSON.stringify(s));
}

function loadSnapshots(): Snapshot[] {
  const raw = safeGetItem(SNAPSHOTS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) ?? []; } catch { return []; }
}

function saveSnapshots(s: Snapshot[]): void {
  safeSetItem(SNAPSHOTS_KEY, JSON.stringify(s));
}

/* ── Store ──────────────────────────────────────────────────── */

export const usePlanStore = create<PlanState>()((set, get) => ({
  plan: null,
  settings: loadSettings(),
  undoStack: [],
  redoStack: [],
  snapshots: loadSnapshots(),

  setPlan: (plan) => {
    const current = get().plan;
    set(state => ({
      plan,
      undoStack: current ? [...state.undoStack.slice(-49), current] : state.undoStack,
      redoStack: [],
    }));
    savePlan(plan);
  },

  updatePlan: (updater) => {
    const current = get().plan;
    if (!current) return;
    const updated = updater(current);
    const withTimestamp = { ...updated, updatedAt: new Date().toISOString() };
    set(state => ({
      plan: withTimestamp,
      undoStack: [...state.undoStack.slice(-49), current],
      redoStack: [],
    }));
    savePlan(withTimestamp);
  },

  undo: () => {
    const { undoStack, plan } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set(state => ({
      plan: prev,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: plan ? [...state.redoStack, plan] : state.redoStack,
    }));
    savePlan(prev);
  },

  redo: () => {
    const { redoStack, plan } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set(state => ({
      plan: next,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: plan ? [...state.undoStack, plan] : state.undoStack,
    }));
    savePlan(next);
  },

  saveSnapshot: (name) => {
    const plan = get().plan;
    if (!plan) return;
    const snap: Snapshot = { name, createdAt: new Date().toISOString(), plan: structuredClone(plan) };
    set(state => {
      const updated = [...state.snapshots, snap].slice(-20);
      saveSnapshots(updated);
      return { snapshots: updated };
    });
  },

  restoreSnapshot: (index) => {
    const snap = get().snapshots[index];
    if (!snap) return;
    get().setPlan(structuredClone(snap.plan));
  },

  clearPlan: () => {
    set({ plan: null, undoStack: [], redoStack: [] });
    safeRemoveItem(PLAN_KEY);
  },

  setSettings: (partial) => {
    set(state => {
      const updated = { ...state.settings, ...partial };
      saveSettings(updated);
      return { settings: updated };
    });
  },

  generatePlan: (intake) => {
    if (!intake.eventType || !intake.budget || !intake.guests) return;

    const today = todayIst();
    const eventType = intake.eventType;
    const totalBudget = intake.budget.basis === 'perHead'
      ? intake.budget.amountInr * intake.guests.expected
      : intake.budget.amountInr;

    // Budget allocation
    const template = getBudgetTemplate(eventType);
    const catInputs = template.map(t => ({ id: t.id, weight: t.weight, minPct: t.minPct, maxPct: t.maxPct }));
    const allocationResult = allocateBudget(totalBudget, catInputs);
    const allocations = allocationResult.ok ? allocationResult.allocations : [];

    const categories = template.map(t => {
      const alloc = allocations.find(a => a.id === t.id);
      return {
        id: t.id, label: t.label, weight: t.weight,
        minPct: t.minPct, maxPct: t.maxPct,
        elasticity: t.elasticity, maxCut: t.maxCut,
        amountInr: alloc?.amountInr ?? 0,
        locked: false, protected: false,
        committedInr: 0, paidInr: 0,
      };
    });

    // Tasks
    const taskTemplate = getTaskTemplate(eventType);
    const tasks = taskTemplate.map(t => ({
      id: t.id, title: t.title, categoryId: t.categoryId,
      priority: t.priority as 0 | 1 | 2 | 3,
      effortDays: t.effortDays,
      dependsOn: t.dependsOn,
      mustFinishDaysBefore: t.mustFinishDaysBefore,
      done: false, completedOn: null,
      notes: '', origin: 'template' as const,
    }));

    const eventDate = intake.date?.kind === 'fixed' ? intake.date.date : todayIst();

    // Vendor categories from templates
    const vendorTemplates = getVendorTemplate(eventType);
    const vendorCategories = vendorTemplates.map(vt => ({
      id: vt.id,
      label: vt.label,
      requirements: vt.requirements.map(r => ({ ...r })),
      questions: vt.questions.map(q => ({
        ...q,
        asked: false,
        answer: '',
        origin: 'bank' as const,
      })),
      fitWeights: vt.fitWeights,
    }));

    // Built-in initial ideas
    const defaultIdeas = [
      { id: 'idea_memory_wall', title: 'Memory wall with photos', body: 'Set up a simple board or string display where guests can pin their favourite photos and notes.', whyFits: 'Adds a personal, family-first touch', categoryId: 'decoration', relativeCost: 'low' as const, effort: 'low' as const, tags: ['personal', 'family', 'decor'], pinned: false, dismissed: false, origin: 'builtIn' as const },
      { id: 'idea_live_music', title: 'Live music corner', body: 'Hire a solo acoustic musician or ask a musically talented friend to play for 30 minutes during dinner.', whyFits: 'Creates a relaxed atmosphere', categoryId: 'entertainment', relativeCost: 'medium' as const, effort: 'medium' as const, tags: ['music', 'relaxed', 'ambience'], pinned: false, dismissed: false, origin: 'builtIn' as const },
      { id: 'idea_dessert_station', title: 'Dessert station', body: 'Instead of a single cake, set up a small dessert table with 3-4 options guests can serve themselves.', whyFits: 'Great for vegetarian guests and adds variety', categoryId: 'catering', relativeCost: 'medium' as const, effort: 'low' as const, tags: ['food', 'interactive', 'variety'], pinned: false, dismissed: false, origin: 'builtIn' as const },
      { id: 'idea_kids_corner', title: 'Kid-friendly activity corner', body: 'Set up a crafts and games table so children stay entertained while adults enjoy the event.', whyFits: 'Children attending — keeps them engaged safely', categoryId: 'entertainment', relativeCost: 'low' as const, effort: 'low' as const, tags: ['kids', 'activities', 'safety'], pinned: false, dismissed: false, origin: 'builtIn' as const },
      { id: 'idea_thank_you_notes', title: 'Thank-you notes station', body: 'Provide blank cards and pens so guests can write messages for the guest of honour.', whyFits: 'Personal keepsake that matches a warm vibe', categoryId: 'decoration', relativeCost: 'low' as const, effort: 'low' as const, tags: ['personal', 'keepsake', 'warm'], pinned: false, dismissed: false, origin: 'builtIn' as const },
      { id: 'idea_elder_seating', title: 'Comfortable seating area', body: 'Designate a quieter corner with comfortable chairs and cushions for elders and anyone needing a break.', whyFits: 'Accessibility: elders attending, comfortable seating', categoryId: 'logistics', relativeCost: 'low' as const, effort: 'low' as const, tags: ['accessibility', 'comfort', 'elders'], pinned: false, dismissed: false, origin: 'builtIn' as const },
    ];

    const plan: Plan = {
      schemaVersion: 1,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      baselineDate: today,
      isSample: false,
      intake,
      budget: { totalInr: totalBudget, categories },
      tasks,
      vendorCategories,
      vendors: [],
      ideas: defaultIdeas,
      runSheet: [],
      notes: [],
    };

    get().setPlan(plan);
  },

  loadSampleEvent: () => {
    // Inline sample to avoid circular deps
    const today = todayIst();
    const intake: Intake = {
      eventType: 'birthday',
      title: 'Dad\'s 60th Birthday',
      date: { kind: 'fixed', date: '2026-12-20' },
      guests: { expected: 50 },
      budget: { basis: 'total', amountInr: 100000 },
      city: 'Pune',
      venueType: 'hall',
      mustHaves: ['great food', 'photos'],
      desiredExperience: 'Relaxed, family-first, warm',
      experienceChips: ['relaxed', 'family-first'],
      cultural: { chips: [], notes: '' },
      dietary: { tags: ['veg'], notes: 'Mostly vegetarian family' },
      accessibility: { tags: ['elderSeating'], notes: 'Elders attending, need comfortable seating' },
      alcohol: 'no',
      children: true,
      answered: { mustHaves: true, dietary: true, accessibility: true, cultural: true },
    };

    // Generate plan from intake
    get().generatePlan(intake);

    // Mark as sample and populate with full fixture data
    const plan = get().plan;
    if (plan) {
      const samplePlan = buildSamplePlan(plan);
      set({ plan: samplePlan, undoStack: [], redoStack: [] });
      savePlan(samplePlan);
    }
  },

  exportPlan: () => {
    const plan = get().plan;
    if (!plan) return '{}';
    return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), plan }, null, 2);
  },

  importPlan: (json) => {
    try {
      const data = JSON.parse(json);
      const plan = data.plan ?? data;
      const result = PlanSchema.safeParse(plan);
      if (!result.success) return false;
      get().setPlan(result.data);
      return true;
    } catch {
      return false;
    }
  },
}));

// Hydrate from localStorage on first load (client-side only)
if (typeof window !== 'undefined') {
  const stored = loadPlan();
  if (stored) {
    usePlanStore.setState({ plan: stored });
  }
}
