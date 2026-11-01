/**
 * Plan Taiyari — Copy Deck (§5.12)
 * All user-facing strings in one module for consistency and future translation.
 * Key naming: section.element.variant
 */
export const copy = {
  // Branding
  appName: 'Plan Taiyari',
  subtitle: 'Celebration and Event Planner',
  tagline: 'Plan a celebration without losing track.',

  // Landing
  landing: {
    heroTitle: 'Plan a celebration without losing track',
    heroSubtitle: 'Every decision — budget, guests, venue, caterer — depends on the others. Plan Taiyari keeps them connected so you always know what to do next.',
    ctaStart: 'Plan my event',
    ctaSample: 'Try a sample event',
    proofPoints: [
      'Ask the right questions first, then build the plan',
      'See where your money goes — and what happens when things change',
      'Compare vendor quotes honestly, with only what you entered',
    ],
    privacyNote: 'Your plan stays on this device. No sign-up needed.',
  },

  // Intake
  intake: {
    gate: {
      disabled: 'Still need: {list}',
      ready: "You're ready. Generate my plan.",
    },
    skipNone: 'None of these',
    progress: '{answered} of {total} answered',
    progressHelpful: '{remaining} quick things left',
    switchToForm: 'Switch to form view',
    switchToChat: 'Switch to guided view',
    questions: {
      eventType: 'What are you celebrating?',
      date: 'When is the event?',
      guests: 'How many guests are you expecting?',
      budget: "What's your total budget?",
      mustHaves: 'What are your must-haves?',
      dietary: 'Any dietary needs to plan for?',
      accessibility: 'Any accessibility needs?',
      cultural: 'Any cultural or religious considerations?',
      experience: 'What vibe are you going for?',
      venueType: 'Do you have a venue type in mind?',
      city: 'Which city is the event in?',
    },
  },

  // Budget
  budget: {
    labelSplit: 'Planning split — based on typical party shares, not vendor prices.',
    perHead: 'per head',
    locked: 'Locked',
    protected: 'Protected (must-have)',
    total: 'Total budget',
    allocated: 'Allocated',
    unallocated: 'Unallocated',
    committed: 'Committed',
    paid: 'Paid',
    overspend: 'Over budget',
    tabs: {
      plan: 'Plan',
      whatIf: 'What if',
      spending: 'Spending',
    },
  },

  // What-if
  whatIf: {
    title: 'What if things change?',
    chipMinus20: 'Budget −20%',
    chipPlus20: 'Budget +20%',
    budgetLabel: 'Budget change',
    guestsLabel: 'Guest count',
    protectLabel: 'Protect categories',
    applyScenario: 'Apply this scenario',
    discard: 'Discard',
    infeasible: "This doesn't fit even with every category at its minimum. Here's what could close the gap.",
    reasons: {
      guest_scaled: 'Scales with guest count',
      trimmed: 'Trimmed to fit the new budget',
      at_minimum: 'Already at its minimum share',
      protected: 'Protected as a must-have — trimmed less',
      locked: 'Locked at a fixed amount',
      contingency_kept: 'Contingency kept as a buffer',
      surplus_added: 'Extra budget distributed by share',
    },
    levers: {
      reduce_guests: 'Reduce guests to at most {n}',
      raise_budget: 'Raise the budget by about {amount}',
      drop_optional: 'Drop optional categories (frees about {amount})',
    },
  },

  // Timeline
  timeline: {
    blocked: 'Waiting for: {tasks}',
    unblocked: '{n} tasks are now ready.',
    feasible: 'This plan fits if the event is on or after {date}.',
    nextActions: 'Next best actions',
    views: {
      checklist: 'Checklist',
      timeline: 'Timeline',
    },
    states: {
      ready: 'Ready',
      blocked: 'Blocked',
      done: 'Done',
    },
    flags: {
      critical: 'Critical — no slack',
      tight: 'Tight — {days} days of slack',
      atRisk: 'At risk — overdue by {days} days',
      overdue: 'Overdue',
      compressed: 'Compressed — plan was already tight when created',
    },
    priorities: {
      0: 'P0 — Must do now',
      1: 'P1 — Important',
      2: 'P2 — Should do',
      3: 'P3 — Nice to have',
    },
  },

  // Vendors
  vendor: {
    disclosure: 'Plan Taiyari does not look up vendors, prices or availability. Everything here is what you entered. Confirm availability and prices with each vendor in writing.',
    unknown: 'Unknown — ask',
    fitNote: 'Best fit to your checklist and cost — not a quality rating.',
    tabs: {
      requirements: 'Requirements',
      callQuestions: 'Call questions',
      vendors: 'Vendors & quotes',
      compare: 'Compare',
    },
    statuses: {
      shortlisted: 'Shortlisted',
      called: 'Called',
      quoted: 'Quoted',
      booked: 'Booked',
      rejected: 'Rejected',
    },
    whatToAskNext: 'What to ask next',
    addVendor: 'Add a vendor',
    addQuote: 'Add a quote',
  },

  // Ideas
  ideas: {
    title: 'Ideas for your event',
    pin: 'Pin to plan',
    dismiss: 'Dismiss',
    moreLikeThis: 'More like this',
    differentDirection: 'Different direction',
    builtInLabel: 'Built-in ideas',
    focusPlaceholder: 'Focus on... (e.g. food, activities)',
    whyFits: 'Why this fits',
  },

  // Assistant
  assistant: {
    placeholder: 'Ask me to change anything…',
    apply: 'Apply selected',
    dismiss: 'Dismiss',
    highRisk: 'Changes money, dates or completion — review.',
    aiSuggested: 'Template-suggested',
    suggestedPrompts: [
      'Cut 20% from the budget',
      'We now expect 15 more guests',
      'Make it more relaxed',
      'Add a games corner for kids',
      'My aunt uses a wheelchair',
    ],
  },

  // AI status
  ai: {
    on: 'AI on',
    busy: 'AI busy — using built-in planner',
    off: 'Using built-in planner',
  },

  // Event day
  eventDay: {
    runSheet: 'Run sheet',
    vendorRoster: 'Vendor contacts',
    dayBefore: 'Day-before checklist',
    paymentsDue: 'Payments due',
    printPlan: 'Print / save as PDF',
    exportCalendar: 'Export to calendar (.ics)',
  },

  // Overview
  overview: {
    daysToGo: '{n} days to go',
    today: "It's today!",
    passed: '{n} days ago',
    nextActions: 'Next best actions',
    risks: 'Things to watch',
    riskLabels: {
      compressed: 'Plan is compressed — some tasks were tight from the start',
      overBudget: '{n} categories are over budget',
      unknownExtras: '{n} unknown vendor charges',
      blockedP0: '{n} critical tasks are blocked',
    },
  },

  // Settings
  settings: {
    theme: 'Theme',
    themeOptions: { auto: 'Auto', light: 'Light', dark: 'Dark' },
    reduceTransparency: 'Reduce transparency',
    reduceMotion: 'Reduce motion',
    textSize: 'Text size',
    exportData: 'Export plan as JSON',
    importData: 'Import plan from JSON',
    deleteAll: 'Delete all data',
    deleteConfirm: 'This will remove your entire plan and cannot be undone. Continue?',
  },

  // Sample event
  sample: {
    banner: 'Sample data — pre-written, not real vendors.',
    clear: 'Clear sample & start fresh',
  },

  // States
  states: {
    empty: {
      vendors: 'No vendors yet. Add your first vendor to get started.',
      ideas: 'Generate ideas based on your event details.',
      timeline: 'Your timeline will appear once you generate a plan.',
    },
    offline: "You're offline. Your plan is saved on this device.",
    error: 'Something went wrong. {message}',
  },

  // Privacy
  privacy: {
    title: 'Privacy',
    body: 'Your plan stays on this device in your browser storage. Plan Taiyari does not have user accounts, does not store your data on any server, and does not use cookies or analytics. No personal information leaves your browser.',
  },

  // About
  about: {
    title: 'About Plan Taiyari',
    whatItDoes: 'Plan Taiyari helps first-time organizers plan celebrations — weddings, birthdays, and community events — with connected budgets, timelines, and vendor checklists.',
    whatItDoesNot: 'Plan Taiyari does not look up vendors, estimate prices, check availability, book anything, or give legal, medical, or religious advice.',
  },

  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    undo: 'Undo',
    redo: 'Redo',
    confirm: 'Confirm',
    loading: 'Thinking…',
    retry: 'Try again',
  },

  // Formatting helpers
  format: {
    daysBeforeEvent: '{n} days before the event',
    perHead: '₹{amount} per head',
  },
} as const;

export type CopyKeys = typeof copy;
