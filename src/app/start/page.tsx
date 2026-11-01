'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanStore } from '@/store/plan-store';
import { copy } from '@/copy/en-IN';
import { isReadyToPlan, missingFields, answeredCount, parseInr, isValidFutureDate, todayIst } from '@/engines';
import type { Intake, EventType } from '@/domain/schema';
import ui from '@/components/ui.module.css';

const EVENT_TYPES: { value: EventType; label: string; desc: string }[] = [
  { value: 'birthday', label: '🎂 Birthday', desc: 'A birthday party or milestone celebration' },
  { value: 'wedding', label: '💍 Wedding Function', desc: 'Engagement, sangeet, reception or ceremony' },
  { value: 'community', label: '🏘️ Community Event', desc: 'Festival, cultural evening, health camp' },
];

const EXPERIENCE_CHIPS = ['relaxed', 'traditional', 'fun', 'elegant', 'family-first', 'formal', 'casual', 'festive'];
const DIETARY_OPTIONS = [
  { value: 'veg', label: 'Vegetarian' }, { value: 'nonVeg', label: 'Non-vegetarian' },
  { value: 'jain', label: 'Jain' }, { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' }, { value: 'noOnionGarlic', label: 'No onion/garlic' },
] as const;
const ACCESSIBILITY_OPTIONS = [
  { value: 'stepFree', label: 'Step-free access' }, { value: 'elderSeating', label: 'Seating for elders' },
  { value: 'wheelchair', label: 'Wheelchair access' }, { value: 'hearing', label: 'Hearing support' },
  { value: 'sensoryFriendly', label: 'Sensory-friendly' }, { value: 'parking', label: 'Accessible parking' },
] as const;

export default function StartPage() {
  const router = useRouter();
  const generatePlan = usePlanStore(s => s.generatePlan);
  const [today, setToday] = useState('2026-01-01');

  useEffect(() => {
    setToday(todayIst());
  }, []);

  const [intake, setIntake] = useState<Intake>({
    eventType: null, title: '', date: null,
    guests: null, budget: null,
    city: '', venueType: 'undecided',
    mustHaves: [], desiredExperience: '', experienceChips: [],
    cultural: { chips: [], notes: '' },
    dietary: { tags: [], notes: '' },
    accessibility: { tags: [], notes: '' },
    alcohol: 'undecided', children: false,
    answered: { mustHaves: false, dietary: false, accessibility: false, cultural: false },
  });

  const [budgetInput, setBudgetInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [guestInput, setGuestInput] = useState('');
  const [mustHaveInput, setMustHaveInput] = useState('');

  const update = (partial: Partial<Intake>) => setIntake(prev => ({ ...prev, ...partial }));

  const ready = isReadyToPlan(intake);
  const missing = missingFields(intake);
  const progress = answeredCount(intake);

  const handleGenerate = () => {
    if (!ready) return;
    generatePlan(intake);
    router.push('/plan/overview');
  };

  return (
    <main id="main-content" style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      <div className={`${ui.stack} ${ui.stackGap5}`}>
        <div>
          <h1>{copy.appName}</h1>
          <p className="text-muted">{copy.subtitle}</p>
        </div>

        {/* Progress */}
        <div className={ui.card} style={{ padding: 'var(--space-3) var(--space-4)' }}>
          <div className={`${ui.row} ${ui.rowBetween}`} style={{ marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              {copy.intake.progress.replace('{answered}', String(progress.answered)).replace('{total}', String(progress.total))}
            </span>
            <span className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
              {progress.answered < progress.total
                ? copy.intake.progressHelpful.replace('{remaining}', String(progress.total - progress.answered))
                : '✓ All done!'}
            </span>
          </div>
          <div className={ui.progressTrack}>
            <div className={ui.progressFill} style={{ width: `${(progress.answered / progress.total) * 100}%` }} />
          </div>
        </div>

        {/* Event type */}
        <div className={ui.card}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>{copy.intake.questions.eventType}</h3>
          <div className={`${ui.stack} ${ui.stackGap2}`}>
            {EVENT_TYPES.map(et => (
              <button key={et.value}
                className={intake.eventType === et.value ? ui.chipSelected : ui.chip}
                onClick={() => update({ eventType: et.value })}
                style={{ width: '100%', justifyContent: 'flex-start', padding: 'var(--space-3) var(--space-4)' }}>
                <span style={{ fontSize: 'var(--text-lg)', marginRight: 'var(--space-2)' }}>{et.label}</span>
                <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>{et.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className={ui.card}>
          <div className={ui.field}>
            <label className={ui.fieldLabel}>{copy.intake.questions.date}</label>
            <input
              type="date"
              className={ui.input}
              value={dateInput}
              onChange={e => {
                const val = e.target.value;
                setDateInput(val);
                if (val && isValidFutureDate(val, today)) {
                  update({ date: { kind: 'fixed', date: val } });
                }
              }}
              min={today}
            />
            <button
              type="button"
              className={intake.date?.kind === 'undecided' ? ui.chipSelected : ui.chip}
              style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
              onClick={() => {
                setDateInput('');
                update({ date: { kind: 'undecided', horizonDays: 60 } });
              }}
            >
              {intake.date?.kind === 'undecided' ? '✓ ' : ''}Not decided yet (plan for ~60 days)
            </button>
          </div>
        </div>

        {/* Guests */}
        <div className={ui.card}>
          <div className={ui.field}>
            <label className={ui.fieldLabel}>{copy.intake.questions.guests}</label>
            <input
              type="number"
              className={ui.input}
              placeholder="e.g. 50"
              min={1}
              max={5000}
              value={guestInput}
              onChange={e => {
                setGuestInput(e.target.value);
                const n = parseInt(e.target.value);
                if (n >= 1) update({ guests: { expected: n } });
              }}
            />
          </div>
        </div>

        {/* Budget */}
        <div className={ui.card}>
          <div className={ui.field}>
            <label className={ui.fieldLabel}>{copy.intake.questions.budget}</label>
            <input
              className={ui.input}
              placeholder="e.g. ₹1,00,000 or 1 lakh"
              value={budgetInput}
              onChange={e => {
                setBudgetInput(e.target.value);
                const parsed = parseInr(e.target.value);
                if (parsed && parsed >= 1000) {
                  update({ budget: { basis: 'total', amountInr: parsed } });
                }
              }}
            />
            <span className={ui.fieldHint}>
              {intake.budget ? `Understood: ₹${new Intl.NumberFormat('en-IN').format(intake.budget.amountInr)}` : 'Try: 1 lakh, 80k, ₹50,000'}
            </span>
          </div>
        </div>

        {/* Must-haves */}
        <div className={ui.card}>
          <div className={ui.field}>
            <label className={ui.fieldLabel}>{copy.intake.questions.mustHaves}</label>
            <div className={`${ui.row} ${ui.rowGap2} ${ui.rowWrap}`}>
              {['great food', 'photos', 'live music', 'decor', 'games', 'cake'].map(chip => (
                <button
                  type="button"
                  key={chip}
                  className={intake.mustHaves.includes(chip) ? ui.chipSelected : ui.chip}
                  onClick={() => {
                    const has = intake.mustHaves.includes(chip);
                    const updated = has ? intake.mustHaves.filter(m => m !== chip) : [...intake.mustHaves, chip];
                    update({
                      mustHaves: updated,
                      answered: { ...intake.answered, mustHaves: true },
                    });
                  }}
                >
                  {intake.mustHaves.includes(chip) ? '✓ ' : ''}{chip}
                </button>
              ))}
            </div>
            <div className={`${ui.row} ${ui.rowGap2}`} style={{ marginTop: 'var(--space-2)' }}>
              <input
                className={ui.input}
                placeholder="Add your own..."
                value={mustHaveInput}
                onChange={e => setMustHaveInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && mustHaveInput.trim()) {
                    e.preventDefault();
                    update({
                      mustHaves: [...intake.mustHaves, mustHaveInput.trim()],
                      answered: { ...intake.answered, mustHaves: true },
                    });
                    setMustHaveInput('');
                  }
                }}
                style={{ flex: 1 }}
              />
              {mustHaveInput.trim() && (
                <button
                  type="button"
                  className={ui.btnSecondary}
                  onClick={() => {
                    update({
                      mustHaves: [...intake.mustHaves, mustHaveInput.trim()],
                      answered: { ...intake.answered, mustHaves: true },
                    });
                    setMustHaveInput('');
                  }}
                >
                  Add
                </button>
              )}
            </div>
            <button
              type="button"
              className={intake.answered.mustHaves && intake.mustHaves.length === 0 ? ui.chipSelected : ui.chip}
              onClick={() => update({
                mustHaves: [],
                answered: { ...intake.answered, mustHaves: true },
              })}
              style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
            >
              {intake.answered.mustHaves && intake.mustHaves.length === 0 ? '✓ ' : ''}{copy.intake.skipNone}
            </button>
          </div>
        </div>

        {/* Dietary */}
        <div className={ui.card}>
          <div className={ui.field}>
            <label className={ui.fieldLabel}>{copy.intake.questions.dietary}</label>
            <div className={`${ui.row} ${ui.rowGap2} ${ui.rowWrap}`}>
              {DIETARY_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  className={intake.dietary.tags.includes(opt.value) ? ui.chipSelected : ui.chip}
                  onClick={() => {
                    const has = intake.dietary.tags.includes(opt.value);
                    const updated = has
                      ? intake.dietary.tags.filter(t => t !== opt.value)
                      : [...intake.dietary.tags, opt.value];
                    update({
                      dietary: { ...intake.dietary, tags: updated as typeof intake.dietary.tags },
                      answered: { ...intake.answered, dietary: true },
                    });
                  }}
                >
                  {intake.dietary.tags.includes(opt.value) ? '✓ ' : ''}{opt.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={intake.answered.dietary && intake.dietary.tags.length === 0 ? ui.chipSelected : ui.chip}
              onClick={() => update({
                dietary: { ...intake.dietary, tags: [] },
                answered: { ...intake.answered, dietary: true },
              })}
              style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
            >
              {intake.answered.dietary && intake.dietary.tags.length === 0 ? '✓ ' : ''}{copy.intake.skipNone}
            </button>
          </div>
        </div>

        {/* Accessibility */}
        <div className={ui.card}>
          <div className={ui.field}>
            <label className={ui.fieldLabel}>{copy.intake.questions.accessibility}</label>
            <div className={`${ui.row} ${ui.rowGap2} ${ui.rowWrap}`}>
              {ACCESSIBILITY_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  className={intake.accessibility.tags.includes(opt.value) ? ui.chipSelected : ui.chip}
                  onClick={() => {
                    const has = intake.accessibility.tags.includes(opt.value);
                    const updated = has
                      ? intake.accessibility.tags.filter(t => t !== opt.value)
                      : [...intake.accessibility.tags, opt.value];
                    update({
                      accessibility: { ...intake.accessibility, tags: updated as typeof intake.accessibility.tags },
                      answered: { ...intake.answered, accessibility: true },
                    });
                  }}
                >
                  {intake.accessibility.tags.includes(opt.value) ? '✓ ' : ''}{opt.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={intake.answered.accessibility && intake.accessibility.tags.length === 0 ? ui.chipSelected : ui.chip}
              onClick={() => update({
                accessibility: { ...intake.accessibility, tags: [] },
                answered: { ...intake.answered, accessibility: true },
              })}
              style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
            >
              {intake.answered.accessibility && intake.accessibility.tags.length === 0 ? '✓ ' : ''}{copy.intake.skipNone}
            </button>
          </div>
        </div>

        {/* Cultural */}
        <div className={ui.card}>
          <div className={ui.field}>
            <label className={ui.fieldLabel}>{copy.intake.questions.cultural}</label>
            <p className={ui.fieldHint}>Are there rituals or ceremonies you want time for?</p>
            <textarea
              className={ui.input}
              rows={2}
              placeholder="Optional notes..."
              value={intake.cultural.notes}
              onChange={e => update({
                cultural: { ...intake.cultural, notes: e.target.value },
                answered: { ...intake.answered, cultural: true },
              })}
              style={{ resize: 'vertical' }}
            />
            <button
              type="button"
              className={intake.answered.cultural && !intake.cultural.notes.trim() ? ui.chipSelected : ui.chip}
              onClick={() => update({
                cultural: { chips: [], notes: '' },
                answered: { ...intake.answered, cultural: true },
              })}
              style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
            >
              {intake.answered.cultural && !intake.cultural.notes.trim() ? '✓ ' : ''}{copy.intake.skipNone}
            </button>
          </div>
        </div>

        {/* Experience (optional) */}
        <div className={ui.card}>
          <div className={ui.field}>
            <label className={ui.fieldLabel}>{copy.intake.questions.experience}</label>
            <div className={`${ui.row} ${ui.rowGap2} ${ui.rowWrap}`}>
              {EXPERIENCE_CHIPS.map(chip => (
                <button key={chip}
                  className={intake.experienceChips.includes(chip) ? ui.chipSelected : ui.chip}
                  onClick={() => {
                    const has = intake.experienceChips.includes(chip);
                    update({ experienceChips: has ? intake.experienceChips.filter(c => c !== chip) : [...intake.experienceChips, chip] });
                  }}>{chip}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className={ui.card} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <button className={ui.btnPrimary} onClick={handleGenerate} disabled={!ready}
            style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-4) var(--space-7)' }}>
            {ready ? copy.intake.gate.ready : '🔒 Generate my plan'}
          </button>
          {!ready && (
            <p className="text-muted" style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
              {copy.intake.gate.disabled.replace('{list}', missing.join(', '))}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
