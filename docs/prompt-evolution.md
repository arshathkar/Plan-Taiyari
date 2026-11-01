# Prompt Evolution Log — Plan Taiyari

## Overview

Plan Taiyari uses a **template-based assistant** rather than live LLM calls. This document describes the design of the assistant's deterministic response system and how it could evolve with AI integration.

## Current State: Template Mode

The assistant panel (F5) uses predefined response templates triggered by keyword matching:

### Supported Prompts
| User says | Assistant does |
|---|---|
| "Cut X% from the budget" | Runs the rebalance engine with new budget, shows category-by-category changes |
| "We now expect N more guests" | Explains guest scaling impact on catering, invitations, venue |
| "What should I do next?" | Shows top 3 ready tasks from the timeline engine |
| "Show me the budget summary" | Lists all categories with amounts, committed, and paid |
| "How is my timeline looking?" | Shows task progress (done/total) |
| "Make it more relaxed" | Suggests style changes (acoustic music, buffet, photo booth) |
| Vendor-related queries | Shows vendor tracking summary and comparison guidance |

### Response Generation
- All responses are deterministic (same input → same output)
- Budget scenarios use the real `rebalance` engine for accurate numbers
- Task recommendations use the real `computeTimeline` engine
- No network calls, no API keys, no external dependencies

## Design Rationale

1. **Reliability** — Template responses never hallucinate or produce wrong numbers
2. **Speed** — Instant responses with no network latency
3. **Privacy** — No user data leaves the browser
4. **Offline** — Works without internet connection

## Future Evolution (if AI is enabled)

The architecture supports swapping template responses for LLM-powered ones:

### Phase 1: Structured Operations
The assistant could return typed operations (`Op[]`) validated by Zod:
- `set_budget_total`, `set_guest_count`, `run_scenario`
- `add_task`, `complete_task`, `upsert_vendor`
- Each op shown as a diff card with checkboxes

### Phase 2: Natural Language Understanding
- Parse "Sunrise quoted 33,500 with 2,400 extra for staff" into `upsert_quote`
- Numeric provenance check: every number must appear in the user's message
- Claims guard: block market prices, vendor recommendations, phone numbers

### Phase 3: Contextual Ideas
- Generate event-specific ideas based on the full intake context
- Suggest budget optimisations based on spending patterns
- Recommend next actions based on timeline analysis

## Version History
| Version | Date | Change |
|---|---|---|
| v1.0 | Nov 2026 | Template-based responses with keyword matching |
