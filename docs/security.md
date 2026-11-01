# Security — Plan Taiyari

## Trust Model

Plan Taiyari has an extremely simple trust model: **there is no server-side trust boundary**. All data stays in the browser.

### Assets
| Asset | Where | Protection |
|---|---|---|
| User's event plan | localStorage | Browser same-origin policy |
| User preferences | localStorage | Browser same-origin policy |
| Undo/redo history | In-memory (Zustand) | Lost on page close |
| Snapshots | localStorage | Browser same-origin policy |

### What We Don't Have
- No authentication / sessions
- No database
- No API keys or secrets
- No server-side user data
- No cookies
- No analytics or telemetry

## Input Validation

All data entering the system is validated with Zod schemas:

- **Intake form** — Zod-validated before `generatePlan`
- **Import JSON** — Parsed and validated against `PlanSchema`; rejected if invalid
- **INR parser** — Rejects invalid formats, capped at ₹100 crore
- **Text fields** — Length-limited (40–600 chars depending on field)
- **Arrays** — Size-limited (max 120 tasks, 40 vendors, 60 ideas, etc.)
- **Numbers** — Range-limited (guests 1–5000, budget 0–₹1B)

## Data Integrity

- On load, stored data is validated against the Zod schema
- Corrupt data is quarantined to `plantaiyari:plan:v1:corrupt` key
- The app starts fresh rather than crashing on bad data

## XSS Prevention

- React's JSX escapes all text content by default
- No `dangerouslySetInnerHTML` anywhere in the codebase
- No user-generated HTML rendering
- CSS Modules provide style isolation

## Export/Import Safety

- Exported JSON is a plain data file (no executable content)
- Imported JSON is fully validated before being loaded
- Invalid imports are rejected with a user-friendly message

## Dependencies

- Minimal dependency footprint: `next`, `react`, `zod`, `zustand`, `uuid`
- No CDN-loaded external scripts
- No third-party analytics or tracking libraries
