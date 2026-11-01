'use client';

import { useState, useEffect } from 'react';
import { usePlanStore } from '@/store/plan-store';
import { copy } from '@/copy/en-IN';
import { computeTimeline, todayIst, formatDateDisplay } from '@/engines';
import ui from '@/components/ui.module.css';

export default function TimelinePage() {
  const plan = usePlanStore(s => s.plan);
  const updatePlan = usePlanStore(s => s.updatePlan);
  const [view, setView] = useState<'checklist' | 'timeline'>('checklist');
  const [filter, setFilter] = useState<'all' | 'ready' | 'blocked' | 'done'>('all');
  const [today, setToday] = useState('2026-01-01');

  useEffect(() => {
    setToday(todayIst());
  }, []);

  if (!plan) return null;
  const eventDate = plan.intake.date?.kind === 'fixed' ? plan.intake.date.date : today;

  const result = computeTimeline(
    plan.tasks.map(t => ({
      id: t.id, title: t.title, priority: t.priority,
      effortDays: t.effortDays, dependsOn: t.dependsOn,
      mustFinishDaysBefore: t.mustFinishDaysBefore,
      done: t.done, completedOn: t.completedOn,
    })),
    eventDate, today, plan.baselineDate
  );

  const toggleTask = (taskId: string) => {
    updatePlan(p => ({
      ...p,
      tasks: p.tasks.map(t =>
        t.id === taskId
          ? { ...t, done: !t.done, completedOn: !t.done ? today : null }
          : t
      ),
    }));
  };

  const filtered = result.tasks.filter(t => filter === 'all' || t.state === filter);
  const sorted = [...filtered].sort((a, b) => b.priorityScore - a.priorityScore);

  const grouped = {
    ready: sorted.filter(t => t.state === 'ready'),
    blocked: sorted.filter(t => t.state === 'blocked'),
    done: sorted.filter(t => t.state === 'done'),
  };

  const flagChip = (flag: string) => {
    switch (flag) {
      case 'critical': return { cls: ui.statusDanger, label: 'Critical' };
      case 'tight': return { cls: ui.statusWarning, label: 'Tight' };
      case 'atRisk': return { cls: ui.statusDanger, label: 'At risk' };
      case 'overdue': return { cls: ui.statusDanger, label: 'Overdue' };
      case 'compressed': return { cls: ui.statusWarning, label: 'Compressed' };
      default: return { cls: ui.statusNeutral, label: flag };
    }
  };

  return (
    <div className={`${ui.stack} ${ui.stackGap5}`}>
      <div className={`${ui.row} ${ui.rowBetween} ${ui.rowWrap} ${ui.rowGap3}`}>
        <h1>Timeline</h1>
        <div className={`${ui.row} ${ui.rowGap2}`}>
          <span className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
            {result.tasks.filter(t => t.state === 'done').length} / {result.tasks.length} done
          </span>
        </div>
      </div>

      {/* Feasible date warning */}
      {result.earliestFeasibleDate && (
        <div className={`${ui.banner} ${ui.bannerWarning}`}>
          ⚠️ {copy.timeline.feasible.replace('{date}', formatDateDisplay(result.earliestFeasibleDate))}
        </div>
      )}

      {/* Next best actions */}
      {result.nextBestActions.length > 0 && (
        <div className={ui.card}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>{copy.timeline.nextActions}</h3>
          {result.nextBestActions.map(task => (
            <div key={task.id} className={`${ui.row} ${ui.rowGap3}`} style={{ padding: 'var(--space-2) 0' }}>
              <button onClick={() => toggleTask(task.id)} className={ui.btnGhost}
                style={{ padding: 'var(--space-1)', fontSize: '20px', minHeight: 36, minWidth: 36 }}
                aria-label={`Mark ${task.title} as done`}>
                ☐
              </button>
              <div>
                <strong>{task.title}</strong>
                <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                  Due {formatDateDisplay(task.latestFinish)} · {task.downstreamCount > 0 ? `Unblocks ${task.downstreamCount} tasks` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View toggle and filters */}
      <div className={`${ui.row} ${ui.rowBetween} ${ui.rowWrap} ${ui.rowGap2}`}>
        <div className={ui.tabList} role="tablist">
          <button role="tab" aria-selected={view === 'checklist'} className={view === 'checklist' ? ui.tabActive : ui.tab}
            onClick={() => setView('checklist')}>{copy.timeline.views.checklist}</button>
          <button role="tab" aria-selected={view === 'timeline'} className={view === 'timeline' ? ui.tabActive : ui.tab}
            onClick={() => setView('timeline')}>{copy.timeline.views.timeline}</button>
        </div>
        <div className={`${ui.row} ${ui.rowGap2}`}>
          {(['all', 'ready', 'blocked', 'done'] as const).map(f => (
            <button key={f} className={filter === f ? ui.chipSelected : ui.chip}
              onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : copy.timeline.states[f] ?? f}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist view */}
      {view === 'checklist' && (
        <div className={`${ui.stack} ${ui.stackGap4}`}>
          {filter === 'all' ? (
            <>
              {grouped.ready.length > 0 && <TaskGroup title="Ready" tasks={grouped.ready} toggleTask={toggleTask} flagChip={flagChip} />}
              {grouped.blocked.length > 0 && <TaskGroup title="Blocked" tasks={grouped.blocked} toggleTask={toggleTask} flagChip={flagChip} />}
              {grouped.done.length > 0 && <TaskGroup title="Done" tasks={grouped.done} toggleTask={toggleTask} flagChip={flagChip} />}
            </>
          ) : (
            <TaskGroup title={filter} tasks={sorted} toggleTask={toggleTask} flagChip={flagChip} />
          )}
        </div>
      )}

      {/* Timeline view */}
      {view === 'timeline' && (
        <div className={`${ui.stack} ${ui.stackGap2}`}>
          {[...filtered].sort((a, b) => a.latestFinish.localeCompare(b.latestFinish)).map(task => (
            <div key={task.id} className={`${ui.row} ${ui.rowGap3}`} style={{ padding: 'var(--space-2) var(--space-3)', borderLeft: `3px solid ${task.state === 'done' ? 'var(--status-success-text)' : task.flags.includes('critical') ? 'var(--status-danger-text)' : 'var(--primary)'}` }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)', minWidth: 90 }}>
                {formatDateDisplay(task.latestFinish)}
              </span>
              <span style={{ textDecoration: task.state === 'done' ? 'line-through' : undefined, color: task.state === 'done' ? 'var(--ink-3)' : undefined }}>
                {task.title}
              </span>
              {task.flags.map(f => {
                const { cls, label } = flagChip(f);
                return <span key={f} className={`${ui.statusChip} ${cls}`}>{label}</span>;
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskGroup({ title, tasks, toggleTask, flagChip }: {
  title: string;
  tasks: Array<{ id: string; title: string; priority: number; state: string; flags: string[]; latestFinish: string; blockedBy: string[]; downstreamCount: number }>;
  toggleTask: (id: string) => void;
  flagChip: (f: string) => { cls: string; label: string };
}) {
  return (
    <div>
      <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ink-3)' }}>
        {title} ({tasks.length})
      </h3>
      <div className={`${ui.stack} ${ui.stackGap2}`}>
        {tasks.map(task => (
          <div key={task.id} className={ui.card} style={{ padding: 'var(--space-3) var(--space-4)' }}>
            <div className={`${ui.row} ${ui.rowGap3}`}>
              <button onClick={() => toggleTask(task.id)}
                style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-1)', minHeight: 36, minWidth: 36 }}
                aria-label={task.state === 'done' ? `Reopen ${task.title}` : `Complete ${task.title}`}>
                {task.state === 'done' ? '☑' : '☐'}
              </button>
              <div className={`${ui.stack} ${ui.stackGap1}`} style={{ flex: 1 }}>
                <div className={`${ui.row} ${ui.rowGap2} ${ui.rowWrap}`}>
                  <span style={{ textDecoration: task.state === 'done' ? 'line-through' : undefined, fontWeight: 500 }}>
                    {task.title}
                  </span>
                  <span className={`${ui.statusChip} ${ui.statusNeutral}`}>P{task.priority}</span>
                  {task.flags.map(f => {
                    const { cls, label } = flagChip(f);
                    return <span key={f} className={`${ui.statusChip} ${cls}`}>{label}</span>;
                  })}
                </div>
                <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                  Due {formatDateDisplay(task.latestFinish)}
                  {task.state === 'blocked' && task.blockedBy.length > 0 && (
                    <> · Waiting for: {task.blockedBy.join(', ')}</>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
