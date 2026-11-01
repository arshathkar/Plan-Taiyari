# Plan Taiyari — Celebration and Event Planner

A free, privacy-first event planning tool for first-time organisers in India. Plan weddings, birthdays, and community events with smart budgets, dependency-aware timelines, vendor checklists, and personalised ideas — all running locally in your browser.

## 🔗 Live Demo : https://plan-taiyari.vercel.app/

## 🎯 Problem Statement Alignment

> **Challenge:** "Create a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas."

| Brief requirement | Where it's built |
|---|---|
| Planning assistant | F5 — Assistant panel with suggested prompts and deterministic operations |
| Weddings, birthdays, community events | F1 — Three event types, each with dedicated templates (Appendix A/B/C) |
| Budgets | F2 — Weighted allocation, what-if scenarios, spending tracker |
| Timelines | F3 — Dependency-aware tasks with Kahn's topological sort + CPM scheduling |
| Vendor checklists | F4 — Per-category requirements, call questions, quote comparison |
| Personalized ideas | F6 — Context-based suggestions with pin/dismiss |

## ✨ Features

### Core Planning (F1–F4)
- **Guided intake** — Step-by-step brief collection with gate validation
- **Smart budget allocation** — Weighted water-filling with bounds, locks, and protection
- **What-if scenarios** — Change budget or guest count and see the impact instantly
- **Dependency-aware timeline** — Tasks ordered correctly (book venue → send invites)
- **Vendor management** — Requirement checklists, call questions, quote comparison with fit scores

### Intelligence (F5–F6)
- **Planning assistant** — Predefined prompts that trigger deterministic plan operations
- **Personalised ideas** — Suggestions based on event type, budget, and preferences

### Event Day & Export (F7–F8)
- **Event day mode** — Run sheet, vendor contacts, day-before checklist, payments due
- **Export** — JSON export/import, ICS calendar download, print-optimised CSS

### Privacy & Settings (F9–F11)
- **100% local** — All data in localStorage, no server, no analytics, no cookies
- **Glassmorphic UI** — Beautiful design with full accessibility fallbacks
- **Accessibility** — Keyboard nav, screen reader support, reduced motion/transparency, text sizing

## 🏗️ Architecture

```
Browser (localStorage)
  └── Next.js App Router (React 19 + TypeScript)
       ├── features/ — page components per PRD feature
       ├── engines/ — pure deterministic functions (budget, timeline, vendor, rebalance, ripple)
       ├── domain/ — Zod schemas (source of truth) + templates
       ├── store/ — Zustand with undo/redo + snapshots
       ├── components/ — reusable UI (glass cards, donut chart, assistant panel)
       └── copy/ — all user-facing strings (en-IN)
```

### Key Engine Algorithms
| Engine | Algorithm |
|---|---|
| Budget allocator | Weighted water-filling with iterative clamping, largest-remainder rounding to ₹100 |
| What-if rebalance | Guest scaling with elasticity, staged trimming (unprotected → protected), infeasible levers |
| Timeline | Kahn's topological sort + backward/forward pass CPM, slack, flags, priority scoring |
| Vendor comparison | Weighted coverage %, cost scoring, fit score with sensitivity analysis |
| Ripple rules | 10 pure rules (RR1–RR10) for interconnected decision propagation |

## 🛠️ Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| State | Zustand with localStorage persistence |
| Validation | Zod schemas (types inferred) |
| Styling | CSS Modules + custom design tokens (no CSS framework) |
| Design | Glassmorphic with WCAG 2.2 AA fallbacks |

## 🚀 Getting Started

```bash
# Clone and install
git clone <repo-url>
cd plan-taiyari
npm install

# Development
npm run dev        # http://localhost:3000

# Production build
npm run build
npm start
```

### Environment Variables (optional)
```
AI_ENABLED=false   # AI features use template-based responses
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── start/             # Intake flow
│   ├── plan/              # Plan screens (overview, budget, timeline, vendors, ideas, event-day, settings)
│   ├── about/             # About page with traceability table
│   ├── privacy/           # Privacy policy
│   └── api/health/        # Health check endpoint
├── components/            # Reusable UI components
│   ├── ThemeProvider.tsx   # Theme/accessibility context
│   ├── AssistantPanel.tsx  # F5 assistant with predefined prompts
│   ├── DonutChart.tsx      # SVG donut with accessible table
│   └── ui.module.css      # Component library
├── domain/
│   ├── schema.ts          # Zod schemas (source of truth)
│   └── templates/         # Budget, task, vendor templates per event type
├── engines/               # Pure deterministic functions
│   ├── budget-allocator.ts
│   ├── rebalance.ts       # What-if trade-off analysis
│   ├── timeline.ts        # Dependency-aware scheduling
│   ├── vendor-compare.ts  # Quote comparison with fit scores
│   ├── ripple.ts          # Interconnected decision rules
│   ├── intake-gate.ts     # Intake validation
│   ├── inr.ts             # ₹ parsing and formatting
│   ├── dates.ts           # IST date helpers
│   └── ics.ts             # RFC 5545 calendar export
├── store/
│   └── plan-store.ts      # Zustand with undo/redo, snapshots, localStorage
├── copy/
│   └── en-IN.ts           # All user-facing strings
├── fixtures/
│   └── sample-birthday.ts # Sample event for "Try Sample"
└── styles/
    ├── tokens.css         # Design tokens (light/dark, contrast verified)
    └── glass.css          # Glassmorphic surfaces with fallbacks
```

## 🔒 Privacy

- **Zero data collection** — no analytics, cookies, tracking, or server storage
- **localStorage only** — all data stays on the user's device
- **Export/import** — full data portability via JSON
- **Delete all** — one-click data removal in Settings
- **Zod validation** — corrupt data is quarantined, not lost

## ♿ Accessibility

- WCAG 2.2 AA target
- Keyboard navigation with visible focus indicators
- Screen reader compatible (ARIA labels, live regions)
- Reduced motion / reduced transparency support
- High contrast and forced colors fallbacks
- Text size adjustment (100%/115%/130%)
- Print stylesheet for all plan pages

## 📋 Requirement Traceability

Every feature maps to a numbered requirement (R-001 to R-065) in the PRD. See the [About page](/about) in the app for the complete traceability table.

## License

MIT
