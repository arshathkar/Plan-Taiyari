'use client';

import { useSyncExternalStore } from 'react';
import { usePlanStore } from '@/store/plan-store';
import { copy } from '@/copy/en-IN';
import { formatInr, daysFromNow, todayIst, computeTimeline } from '@/engines';
import ui from '@/components/ui.module.css';

const emptySubscribe = () => () => {};

export default function OverviewPage() {
  const plan = usePlanStore(s => s.plan);
  const today = useSyncExternalStore(emptySubscribe, todayIst, () => '2026-11-01');

  if (!plan) return null;
  const eventDate = plan.intake.date?.kind === 'fixed' ? plan.intake.date.date : null;
  const daysLeft = eventDate ? daysFromNow(eventDate, today) : null;

  // Compute timeline for next actions
  const timelineResult = computeTimeline(
    plan.tasks.map(t => ({
      id: t.id, title: t.title, priority: t.priority,
      effortDays: t.effortDays, dependsOn: t.dependsOn,
      mustFinishDaysBefore: t.mustFinishDaysBefore,
      done: t.done, completedOn: t.completedOn,
    })),
    eventDate ?? today,
    today,
    plan.baselineDate
  );

  const nextActions = timelineResult.nextBestActions.slice(0, 3);
  const completedCount = plan.tasks.filter(t => t.done).length;
  const totalTasks = plan.tasks.length;

  // Budget summary
  const totalBudget = plan.budget.totalInr;
  const committed = plan.budget.categories.reduce((s, c) => s + c.committedInr, 0);
  const paid = plan.budget.categories.reduce((s, c) => s + c.paidInr, 0);

  // Risks
  const risks: string[] = [];
  const compressedTasks = timelineResult.tasks.filter(t => t.flags.includes('compressed'));
  if (compressedTasks.length > 0) risks.push(copy.overview.riskLabels.compressed);
  const overBudget = plan.budget.categories.filter(c => c.committedInr > c.amountInr);
  if (overBudget.length > 0) risks.push(copy.overview.riskLabels.overBudget.replace('{n}', String(overBudget.length)));
  const blockedP0 = timelineResult.tasks.filter(t => t.state === 'blocked' && t.priority === 0);
  if (blockedP0.length > 0) risks.push(copy.overview.riskLabels.blockedP0.replace('{n}', String(blockedP0.length)));

  return (
    <div className={`${ui.stack} ${ui.stackGap5}`}>
      <h1>Overview</h1>

      {/* Days counter */}
      {daysLeft !== null && (
        <div className={`${ui.card}`} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--primary)' }}>
            {daysLeft > 0 ? daysLeft : daysLeft === 0 ? '🎉' : Math.abs(daysLeft)}
          </div>
          <div style={{ fontSize: 'var(--text-base)', color: 'var(--ink-2)' }}>
            {daysLeft > 0
              ? copy.overview.daysToGo.replace('{n}', String(daysLeft))
              : daysLeft === 0
                ? copy.overview.today
                : copy.overview.passed.replace('{n}', String(Math.abs(daysLeft)))}
          </div>
        </div>
      )}

      <div className={ui.grid2}>
        {/* Budget summary */}
        <div className={ui.card}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Budget</h3>
          <div className={`${ui.stack} ${ui.stackGap2}`}>
            <div className={`${ui.row} ${ui.rowBetween}`}>
              <span className="text-muted">Total</span>
              <strong>{formatInr(totalBudget)}</strong>
            </div>
            <div className={`${ui.row} ${ui.rowBetween}`}>
              <span className="text-muted">Committed</span>
              <span>{formatInr(committed)}</span>
            </div>
            <div className={`${ui.row} ${ui.rowBetween}`}>
              <span className="text-muted">Paid</span>
              <span>{formatInr(paid)}</span>
            </div>
            <div className={ui.progressTrack}>
              <div className={ui.progressFill} style={{ width: `${Math.min(100, (committed / totalBudget) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Task progress */}
        <div className={ui.card}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Tasks</h3>
          <div className={`${ui.stack} ${ui.stackGap2}`}>
            <div className={`${ui.row} ${ui.rowBetween}`}>
              <span className="text-muted">Completed</span>
              <strong>{completedCount} / {totalTasks}</strong>
            </div>
            <div className={ui.progressTrack}>
              <div className={ui.progressFill} style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }} />
            </div>
            {timelineResult.earliestFeasibleDate && (
              <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                ⚠️ {copy.timeline.feasible.replace('{date}', timelineResult.earliestFeasibleDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Next best actions */}
      <div className={ui.card}>
        <h3 style={{ marginBottom: 'var(--space-3)' }}>{copy.overview.nextActions}</h3>
        {nextActions.length === 0 ? (
          <p className="text-muted">All caught up! No pending tasks.</p>
        ) : (
          <div className={`${ui.stack} ${ui.stackGap3}`}>
            {nextActions.map((task, i) => (
              <div key={task.id} className={`${ui.row} ${ui.rowGap3}`} style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--primary)', width: 32, textAlign: 'center' }}>
                  {i + 1}
                </span>
                <div className={`${ui.stack} ${ui.stackGap1}`}>
                  <strong>{task.title}</strong>
                  <span className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                    P{task.priority} · {task.downstreamCount > 0 ? `Unblocks ${task.downstreamCount} tasks` : 'No dependants'}
                    {task.flags.includes('tight') ? ' · Tight timeline' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risks */}
      {risks.length > 0 && (
        <div className={ui.card}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>{copy.overview.risks}</h3>
          <div className={`${ui.stack} ${ui.stackGap2}`}>
            {risks.map((risk, i) => (
              <div key={i} className={`${ui.banner} ${ui.bannerWarning}`}>
                ⚠️ {risk}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendor summary */}
      <div className={ui.card}>
        <h3 style={{ marginBottom: 'var(--space-3)' }}>Vendors</h3>
        {plan.vendors.length === 0 ? (
          <p className="text-muted">No vendors added yet.</p>
        ) : (
          <div className={`${ui.row} ${ui.rowGap4} ${ui.rowWrap}`}>
            {['shortlisted', 'called', 'quoted', 'booked'].map(status => {
              const count = plan.vendors.filter(v => v.status === status).length;
              if (count === 0) return null;
              return (
                <span key={status} className={`${ui.statusChip} ${status === 'booked' ? ui.statusSuccess : ui.statusNeutral}`}>
                  {count} {status}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
