# Architecture — Plan Taiyari

## System Overview

Plan Taiyari is a fully client-side Next.js application. There is no backend database, no authentication, and no server-side state. All user data lives in the browser's `localStorage`.

```
┌────────────────────────────────────────────────────┐
│                   Browser                           │
│                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐   │
│  │ React UI │──▶│ Zustand   │──▶│ localStorage │   │
│  │ (Pages)  │   │ Store     │   │              │   │
│  └────┬─────┘   └────┬─────┘   └──────────────┘   │
│       │              │                              │
│       ▼              ▼                              │
│  ┌──────────────────────────┐                      │
│  │    Pure Engines          │                      │
│  │  (budget, timeline,      │                      │
│  │   vendor, rebalance,     │                      │
│  │   ripple, INR, dates)    │                      │
│  └──────────────────────────┘                      │
│                                                     │
│  ┌──────────────────────────┐                      │
│  │    Domain (Zod schemas)  │                      │
│  │    + Templates           │                      │
│  └──────────────────────────┘                      │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│               Next.js Server (SSG)                  │
│  - Static page generation                           │
│  - /api/health endpoint                             │
│  - No database, no sessions                         │
└────────────────────────────────────────────────────┘
```

## Design Principles

1. **Engines are pure functions** — No React, no network, no clock (except `todayIst`). Every engine can be unit-tested in isolation.
2. **Zod is the source of truth** — TypeScript types are inferred from Zod schemas. Validation and typing cannot drift.
3. **UI proposes, engines compute** — The UI collects input, engines compute results, the user decides.
4. **Undo everything** — 50-step undo/redo stack + named snapshots. Every `updatePlan` pushes to the undo stack.
5. **Strings from the copy deck** — All user-facing text lives in `src/copy/en-IN.ts`.

## Data Flow

```
User Input → Store Action → Engine Computation → Plan Update → localStorage Persist → UI Re-render
                    │                                    │
                    └── Undo stack push ◀────────────────┘
```

## Key Algorithms

### Budget Allocator (§7.1)
- Weighted water-filling with iterative clamping
- Locked categories are excluded from the pool
- Largest-remainder rounding to ₹100 ensures exact sum

### What-If Rebalance (§7.2)
- Guest scaling with per-category elasticity
- Floor computation with maxCut (halved for protected categories)
- Staged trimming: unprotected first, then protected
- Infeasible detection with levers (reduce guests, raise budget, drop optional)

### Timeline Engine (§7.3)
- Kahn's topological sort for dependency validation
- Backward pass: latest finish times
- Forward pass: earliest start times
- Slack, flags (compressed, overdue, at-risk, tight, critical)
- Priority scoring: tier dominates, urgency and downstream count break ties

### Ripple Rules (§7.7)
- 10 pure rules (RR1–RR10)
- Each rule: `(prevState, nextState) → Effects[]`
- Effects are applied by the reducer as a second step
