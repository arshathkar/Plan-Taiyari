/**
 * Plan Taiyari — Domain Schema (§8)
 * Zod is the source of truth. Types are inferred from schemas.
 */
import { z } from 'zod';

/* ── Primitives ─────────────────────────────────────────────── */

export const EventType = z.enum(['birthday', 'wedding', 'community']);
export type EventType = z.infer<typeof EventType>;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const text = (max: number) => z.string().trim().max(max);
const rupees = z.number().int().min(0).max(1_000_000_000);

/* ── Intake ─────────────────────────────────────────────────── */

export const DateChoice = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('fixed'), date: isoDate }),
  z.object({ kind: z.literal('window'), from: isoDate, to: isoDate }),
  z.object({ kind: z.literal('undecided'), horizonDays: z.number().int().min(7).max(1095) }),
]);
export type DateChoice = z.infer<typeof DateChoice>;

export const Intake = z.object({
  eventType: EventType.nullable(),
  title: text(80).optional(),
  date: DateChoice.nullable(),
  guests: z.object({
    expected: z.number().int().min(1).max(5000),
    min: z.number().int().min(1).max(5000).optional(),
    max: z.number().int().min(1).max(5000).optional(),
  }).nullable(),
  budget: z.object({
    basis: z.enum(['total', 'perHead']),
    amountInr: rupees,
  }).nullable(),
  city: text(60).optional(),
  venueType: z.enum(['home', 'hall', 'outdoor', 'banquet', 'undecided']).default('undecided'),
  mustHaves: z.array(text(60)).max(8).default([]),
  desiredExperience: text(300).default(''),
  experienceChips: z.array(text(30)).max(8).default([]),
  cultural: z.object({
    chips: z.array(text(40)).max(8),
    notes: text(300),
  }).default({ chips: [], notes: '' }),
  dietary: z.object({
    tags: z.array(z.enum(['veg', 'nonVeg', 'jain', 'vegan', 'halal', 'noOnionGarlic'])).max(6),
    notes: text(200),
  }).default({ tags: [], notes: '' }),
  accessibility: z.object({
    tags: z.array(z.enum(['stepFree', 'elderSeating', 'wheelchair', 'hearing', 'sensoryFriendly', 'restrooms', 'parking', 'other'])).max(8),
    notes: text(300),
  }).default({ tags: [], notes: '' }),
  alcohol: z.enum(['yes', 'no', 'undecided']).default('undecided'),
  children: z.boolean().default(false),
  answered: z.object({
    mustHaves: z.boolean(),
    dietary: z.boolean(),
    accessibility: z.boolean(),
    cultural: z.boolean(),
  }),
});
export type Intake = z.infer<typeof Intake>;

/* ── Budget ─────────────────────────────────────────────────── */

export const BudgetCategory = z.object({
  id: z.string().regex(/^[a-z_]{2,24}$/),
  label: text(40),
  weight: z.number().min(0).max(100),
  minPct: z.number().min(0).max(100),
  maxPct: z.number().min(0).max(100),
  elasticity: z.number().min(0).max(1),
  maxCut: z.number().min(0).max(1),
  amountInr: rupees,
  locked: z.boolean().default(false),
  protected: z.boolean().default(false),
  committedInr: rupees.default(0),
  paidInr: rupees.default(0),
});
export type BudgetCategory = z.infer<typeof BudgetCategory>;

/* ── Tasks ──────────────────────────────────────────────────── */

export const Priority = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
export type Priority = z.infer<typeof Priority>;

export const Task = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,16}$/),
  title: text(120),
  categoryId: z.string(),
  priority: Priority,
  effortDays: z.number().int().min(0).max(120),
  dependsOn: z.array(z.string()).max(12),
  mustFinishDaysBefore: z.number().int().min(-30).max(1095),
  done: z.boolean(),
  completedOn: isoDate.nullable(),
  owner: text(40).optional(),
  notes: text(500).default(''),
  origin: z.enum(['template', 'user', 'ai', 'ripple']),
});
export type Task = z.infer<typeof Task>;

/* ── Vendors ────────────────────────────────────────────────── */

export const CoverageValue = z.enum(['covered', 'partial', 'notCovered', 'unknown']);
export type CoverageValue = z.infer<typeof CoverageValue>;

export const Requirement = z.object({
  id: z.string(),
  label: text(120),
  weight: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  must: z.boolean(),
});
export type Requirement = z.infer<typeof Requirement>;

export const Extra = z.object({
  label: text(80),
  amountInr: rupees.nullable(),
  condition: text(120).optional(),
});
export type Extra = z.infer<typeof Extra>;

export const Quote = z.object({
  id: z.string(),
  totalInr: rupees,
  coverage: z.record(z.string(), CoverageValue),
  extras: z.array(Extra).max(12),
  advancePct: z.number().min(0).max(100).nullable(),
  cancellation: text(300).nullable(),
  validUntil: isoDate.nullable(),
  notes: text(300).default(''),
});
export type Quote = z.infer<typeof Quote>;

export const PaymentItem = z.object({
  label: text(60),
  dueOn: isoDate,
  amountInr: rupees,
  paid: z.boolean(),
});
export type PaymentItem = z.infer<typeof PaymentItem>;

export const Vendor = z.object({
  id: z.string(),
  categoryId: z.string(),
  name: text(80),
  status: z.enum(['shortlisted', 'called', 'quoted', 'booked', 'rejected']),
  contactNote: text(120).default(''),
  quote: Quote.nullable(),
  payments: z.array(PaymentItem).max(10),
});
export type Vendor = z.infer<typeof Vendor>;

/* ── Vendor Categories ──────────────────────────────────────── */

export const CallQuestion = z.object({
  id: z.string(),
  text: text(240),
  requirementId: z.string().optional(),
  asked: z.boolean(),
  answer: text(300).default(''),
  origin: z.enum(['bank', 'ai', 'user']),
});
export type CallQuestion = z.infer<typeof CallQuestion>;

export const VendorCategory = z.object({
  id: z.string(),
  label: text(40),
  requirements: z.array(Requirement).max(20),
  questions: z.array(CallQuestion).max(40),
  fitWeights: z.tuple([z.number(), z.number(), z.number()]).default([0.6, 0.3, 0.1]),
});
export type VendorCategory = z.infer<typeof VendorCategory>;

/* ── Ideas ──────────────────────────────────────────────────── */

export const Idea = z.object({
  id: z.string(),
  title: text(80),
  body: text(600),
  whyFits: text(240),
  categoryId: z.string(),
  relativeCost: z.enum(['low', 'medium', 'high']),
  effort: z.enum(['low', 'medium', 'high']),
  tags: z.array(text(24)).max(6),
  pinned: z.boolean(),
  dismissed: z.boolean(),
  origin: z.enum(['ai', 'builtIn']),
});
export type Idea = z.infer<typeof Idea>;

/* ── Run Sheet & Notes ──────────────────────────────────────── */

export const RunSheetItem = z.object({
  id: z.string(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  activity: text(100),
  owner: text(40).optional(),
  notes: text(200).default(''),
});
export type RunSheetItem = z.infer<typeof RunSheetItem>;

export const Note = z.object({
  id: z.string(),
  text: text(500),
  createdAt: z.string(),
});
export type Note = z.infer<typeof Note>;

/* ── Plan (top-level) ───────────────────────────────────────── */

export const Plan = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  baselineDate: isoDate,
  isSample: z.boolean().default(false),
  intake: Intake,
  budget: z.object({
    totalInr: rupees,
    categories: z.array(BudgetCategory).max(16),
  }),
  tasks: z.array(Task).max(120),
  vendorCategories: z.array(VendorCategory).max(12),
  vendors: z.array(Vendor).max(40),
  ideas: z.array(Idea).max(60),
  runSheet: z.array(RunSheetItem).max(60),
  notes: z.array(Note).max(60),
});
export type Plan = z.infer<typeof Plan>;

/* ── Persistence Envelope ───────────────────────────────────── */

export const PlanEnvelope = z.object({
  v: z.literal(1),
  plan: Plan,
});
export type PlanEnvelope = z.infer<typeof PlanEnvelope>;

export const SnapshotEntry = z.object({
  name: text(80),
  createdAt: z.string(),
  plan: Plan,
});
export type SnapshotEntry = z.infer<typeof SnapshotEntry>;
