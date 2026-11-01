'use client';

import { useState } from 'react';
import { usePlanStore } from '@/store/plan-store';
import { copy } from '@/copy/en-IN';
import { formatInr, formatPct } from '@/engines';
import ui from '@/components/ui.module.css';

export default function BudgetPage() {
  const plan = usePlanStore(s => s.plan);
  const updatePlan = usePlanStore(s => s.updatePlan);
  const [tab, setTab] = useState<'plan' | 'whatIf' | 'spending'>('plan');
  const [scenarioBudgetPct, setScenarioBudgetPct] = useState(0);
  const [scenarioGuests, setScenarioGuests] = useState(plan?.intake.guests?.expected ?? 50);

  if (!plan) return null;

  const { categories } = plan.budget;
  const totalBudget = plan.budget.totalInr;
  const guests = plan.intake.guests?.expected ?? 1;

  const toggleLock = (catId: string) => {
    updatePlan(p => ({
      ...p,
      budget: {
        ...p.budget,
        categories: p.budget.categories.map(c =>
          c.id === catId ? { ...c, locked: !c.locked } : c
        ),
      },
    }));
  };

  const toggleProtect = (catId: string) => {
    updatePlan(p => ({
      ...p,
      budget: {
        ...p.budget,
        categories: p.budget.categories.map(c =>
          c.id === catId ? { ...c, protected: !c.protected } : c
        ),
      },
    }));
  };

  // Simple what-if calculation
  const computeWhatIf = () => {
    const newBudget = Math.round(totalBudget * (1 + scenarioBudgetPct / 100));
    const guestRatio = scenarioGuests / guests;

    return categories.map(c => {
      if (c.locked) return { ...c, newAmount: c.amountInr, reason: 'locked' as const };

      const need = Math.round(c.amountInr * (1 + c.elasticity * (guestRatio - 1)));
      const minAmount = Math.round((c.minPct / 100) * newBudget);
      const maxAmount = Math.round((c.maxPct / 100) * newBudget);
      const share = Math.round((c.weight / 100) * newBudget);
      const newAmount = Math.max(minAmount, Math.min(maxAmount, share));

      let reason: string = 'trimmed';
      if (newAmount >= need) reason = guestRatio > 1 ? 'guest_scaled' : 'surplus_added';
      if (newAmount <= minAmount) reason = 'at_minimum';
      if (c.protected) reason = 'protected';

      return { ...c, newAmount, reason };
    });
  };

  const whatIfResults = tab === 'whatIf' ? computeWhatIf() : [];
  const newBudgetTotal = Math.round(totalBudget * (1 + scenarioBudgetPct / 100));

  return (
    <div className={`${ui.stack} ${ui.stackGap5}`}>
      <div className={`${ui.row} ${ui.rowBetween}`}>
        <h1>Budget</h1>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{formatInr(totalBudget)}</div>
          <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
            {formatInr(Math.round(totalBudget / guests))} {copy.budget.perHead}
          </div>
        </div>
      </div>

      <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>{copy.budget.labelSplit}</p>

      {/* Tabs */}
      <div className={ui.tabList} role="tablist">
        {(['plan', 'whatIf', 'spending'] as const).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? ui.tabActive : ui.tab}
            onClick={() => setTab(t)}
          >
            {copy.budget.tabs[t]}
          </button>
        ))}
      </div>

      {/* Plan tab */}
      {tab === 'plan' && (
        <div className={`${ui.stack} ${ui.stackGap3}`}>
          {categories.map(c => {
            const pct = totalBudget > 0 ? (c.amountInr / totalBudget) * 100 : 0;
            const perHead = guests > 0 ? Math.round(c.amountInr / guests) : 0;
            return (
              <div key={c.id} className={ui.card} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                <div className={`${ui.row} ${ui.rowBetween}`}>
                  <div className={`${ui.stack} ${ui.stackGap1}`}>
                    <div className={`${ui.row} ${ui.rowGap2}`}>
                      <strong>{c.label}</strong>
                      {c.locked && <span className={`${ui.statusChip} ${ui.statusInfo}`}>🔒 {copy.budget.locked}</span>}
                      {c.protected && <span className={`${ui.statusChip} ${ui.statusSuccess}`}>⭐ {copy.budget.protected}</span>}
                    </div>
                    <span className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                      {formatPct(Math.round(pct * 10) / 10)} · {formatInr(perHead)} {copy.budget.perHead}
                    </span>
                  </div>
                  <div className={`${ui.row} ${ui.rowGap2}`}>
                    <strong style={{ fontSize: 'var(--text-lg)' }}>{formatInr(c.amountInr)}</strong>
                    <button onClick={() => toggleLock(c.id)} className={ui.btnGhost} style={{ padding: 'var(--space-1)', minHeight: 32, minWidth: 32 }} title={c.locked ? 'Unlock' : 'Lock'}>
                      {c.locked ? '🔓' : '🔒'}
                    </button>
                    <button onClick={() => toggleProtect(c.id)} className={ui.btnGhost} style={{ padding: 'var(--space-1)', minHeight: 32, minWidth: 32 }} title={c.protected ? 'Unprotect' : 'Protect'}>
                      {c.protected ? '⭐' : '☆'}
                    </button>
                  </div>
                </div>
                <div className={ui.progressTrack} style={{ marginTop: 'var(--space-2)' }}>
                  <div className={ui.progressFill} style={{ width: `${pct}%`, background: c.locked ? 'var(--status-info-text)' : undefined }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* What-if tab */}
      {tab === 'whatIf' && (
        <div className={`${ui.stack} ${ui.stackGap4}`}>
          <div className={ui.card}>
            <h3 style={{ marginBottom: 'var(--space-3)' }}>{copy.whatIf.title}</h3>

            <div className={`${ui.stack} ${ui.stackGap4}`}>
              {/* Budget slider */}
              <div className={ui.field}>
                <label className={ui.fieldLabel}>{copy.whatIf.budgetLabel}: {scenarioBudgetPct > 0 ? '+' : ''}{scenarioBudgetPct}%</label>
                <input type="range" min={-50} max={50} step={5} value={scenarioBudgetPct}
                  onChange={e => setScenarioBudgetPct(Number(e.target.value))}
                  style={{ width: '100%' }} aria-label="Budget change percentage" />
                <div className={`${ui.row} ${ui.rowGap2} ${ui.rowWrap}`}>
                  <button className={ui.chip} onClick={() => setScenarioBudgetPct(-20)}>{copy.whatIf.chipMinus20}</button>
                  <button className={ui.chip} onClick={() => setScenarioBudgetPct(20)}>{copy.whatIf.chipPlus20}</button>
                  <button className={ui.chip} onClick={() => setScenarioBudgetPct(0)}>Reset</button>
                </div>
              </div>

              {/* Guest slider */}
              <div className={ui.field}>
                <label className={ui.fieldLabel}>{copy.whatIf.guestsLabel}: {scenarioGuests}</label>
                <input type="range" min={Math.max(1, Math.round(guests * 0.5))} max={Math.round(guests * 2)} value={scenarioGuests}
                  onChange={e => setScenarioGuests(Number(e.target.value))}
                  style={{ width: '100%' }} aria-label="Guest count" />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className={ui.card}>
            <div className={`${ui.row} ${ui.rowBetween}`} style={{ marginBottom: 'var(--space-3)' }}>
              <h3>Results</h3>
              <span style={{ fontWeight: 700 }}>New total: {formatInr(newBudgetTotal)}</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-ui)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Category</th>
                  <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Before</th>
                  <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>After</th>
                  <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Change</th>
                  <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {whatIfResults.map(r => {
                  const change = r.newAmount - r.amountInr;
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: 'var(--space-2)', fontWeight: 500 }}>{r.label}</td>
                      <td style={{ textAlign: 'right', padding: 'var(--space-2)' }}>{formatInr(r.amountInr)}</td>
                      <td style={{ textAlign: 'right', padding: 'var(--space-2)', fontWeight: 600 }}>{formatInr(r.newAmount)}</td>
                      <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: change > 0 ? 'var(--status-success-text)' : change < 0 ? 'var(--status-danger-text)' : 'var(--ink-3)' }}>
                        {change > 0 ? '+' : ''}{formatInr(change)}
                      </td>
                      <td style={{ padding: 'var(--space-2)' }}>
                        <span className={`${ui.statusChip} ${ui.statusNeutral}`}>
                          {copy.whatIf.reasons[r.reason as keyof typeof copy.whatIf.reasons] ?? r.reason}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Spending tab */}
      {tab === 'spending' && (
        <div className={`${ui.stack} ${ui.stackGap3}`}>
          {categories.map(c => {
            const remaining = c.amountInr - c.committedInr;
            const isOver = c.committedInr > c.amountInr;
            return (
              <div key={c.id} className={ui.card} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                <div className={`${ui.row} ${ui.rowBetween}`} style={{ marginBottom: 'var(--space-2)' }}>
                  <strong>{c.label}</strong>
                  {isOver && <span className={`${ui.statusChip} ${ui.statusDanger}`}>⚠️ {copy.budget.overspend}</span>}
                </div>
                <div className={`${ui.stack} ${ui.stackGap1}`} style={{ fontSize: 'var(--text-sm)' }}>
                  <div className={`${ui.row} ${ui.rowBetween}`}>
                    <span className="text-muted">Planned</span><span>{formatInr(c.amountInr)}</span>
                  </div>
                  <div className={`${ui.row} ${ui.rowBetween}`}>
                    <span className="text-muted">{copy.budget.committed}</span><span>{formatInr(c.committedInr)}</span>
                  </div>
                  <div className={`${ui.row} ${ui.rowBetween}`}>
                    <span className="text-muted">{copy.budget.paid}</span><span>{formatInr(c.paidInr)}</span>
                  </div>
                  <div className={`${ui.row} ${ui.rowBetween}`}>
                    <span className="text-muted">Remaining</span>
                    <span style={{ color: isOver ? 'var(--status-danger-text)' : undefined, fontWeight: 600 }}>{formatInr(remaining)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
