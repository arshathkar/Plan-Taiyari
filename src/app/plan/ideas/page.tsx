'use client';

import { useEffect, useMemo } from 'react';
import { usePlanStore } from '@/store/plan-store';
import { copy } from '@/copy/en-IN';
import type { Idea } from '@/domain/schema';
import ui from '@/components/ui.module.css';

const BUILT_IN_IDEAS: Omit<Idea, 'pinned' | 'dismissed'>[] = [
  { id: 'idea_memory_wall', title: 'Memory wall with photos', body: 'Set up a simple board or string display where guests can pin their favourite photos and notes.', whyFits: 'Adds a personal, family-first touch', categoryId: 'decoration', relativeCost: 'low', effort: 'low', tags: ['personal', 'family', 'decor'], origin: 'builtIn' },
  { id: 'idea_live_music', title: 'Live music corner', body: 'Hire a solo acoustic musician or ask a musically talented friend to play for 30 minutes during dinner.', whyFits: 'Creates a relaxed atmosphere', categoryId: 'entertainment', relativeCost: 'medium', effort: 'medium', tags: ['music', 'relaxed', 'ambience'], origin: 'builtIn' },
  { id: 'idea_dessert_station', title: 'Dessert station', body: 'Instead of a single cake, set up a small dessert table with 3-4 options guests can serve themselves.', whyFits: 'Great for vegetarian guests and adds variety', categoryId: 'catering', relativeCost: 'medium', effort: 'low', tags: ['food', 'interactive', 'variety'], origin: 'builtIn' },
  { id: 'idea_kids_corner', title: 'Kid-friendly activity corner', body: 'Set up a crafts and games table so children stay entertained while adults enjoy the event.', whyFits: 'Children attending — keeps them engaged safely', categoryId: 'entertainment', relativeCost: 'low', effort: 'low', tags: ['kids', 'activities', 'safety'], origin: 'builtIn' },
  { id: 'idea_thank_you_notes', title: 'Thank-you notes station', body: 'Provide blank cards and pens so guests can write messages for the guest of honour.', whyFits: 'Personal keepsake that matches a warm vibe', categoryId: 'decoration', relativeCost: 'low', effort: 'low', tags: ['personal', 'keepsake', 'warm'], origin: 'builtIn' },
  { id: 'idea_elder_seating', title: 'Comfortable seating area', body: 'Designate a quieter corner with comfortable chairs and cushions for elders and anyone needing a break.', whyFits: 'Accessibility: elders attending, comfortable seating', categoryId: 'logistics', relativeCost: 'low', effort: 'low', tags: ['accessibility', 'comfort', 'elders'], origin: 'builtIn' },
];

export default function IdeasPage() {
  const plan = usePlanStore(s => s.plan);
  const updatePlan = usePlanStore(s => s.updatePlan);

  // Fallback seed list if plan.ideas is empty
  const defaultList: Idea[] = useMemo(() => {
    return BUILT_IN_IDEAS.map(item => ({
      ...item,
      pinned: false,
      dismissed: false,
    }));
  }, []);

  // Ensure plan.ideas is initialized with all ideas
  useEffect(() => {
    if (plan && (!plan.ideas || plan.ideas.length === 0)) {
      updatePlan(p => ({
        ...p,
        ideas: defaultList,
      }));
    }
  }, [plan, updatePlan, defaultList]);

  if (!plan) return null;

  const allIdeas: Idea[] = (plan.ideas && plan.ideas.length > 0) ? plan.ideas : defaultList;
  const visibleIdeas = allIdeas.filter(i => !i.dismissed);
  const dismissedIdeas = allIdeas.filter(i => i.dismissed);

  const togglePin = (ideaId: string) => {
    updatePlan(p => {
      const source = (p.ideas && p.ideas.length > 0) ? p.ideas : defaultList;
      return {
        ...p,
        ideas: source.map(i => (i.id === ideaId ? { ...i, pinned: !i.pinned } : i)),
      };
    });
  };

  const dismissIdea = (ideaId: string) => {
    updatePlan(p => {
      const source = (p.ideas && p.ideas.length > 0) ? p.ideas : defaultList;
      return {
        ...p,
        ideas: source.map(i => (i.id === ideaId ? { ...i, dismissed: true } : i)),
      };
    });
  };

  const restoreIdea = (ideaId: string) => {
    updatePlan(p => {
      const source = (p.ideas && p.ideas.length > 0) ? p.ideas : defaultList;
      return {
        ...p,
        ideas: source.map(i => (i.id === ideaId ? { ...i, dismissed: false } : i)),
      };
    });
  };

  const restoreAll = () => {
    updatePlan(p => {
      const source = (p.ideas && p.ideas.length > 0) ? p.ideas : defaultList;
      return {
        ...p,
        ideas: source.map(i => ({ ...i, dismissed: false })),
      };
    });
  };

  const costColor = (cost: string) => {
    switch (cost) {
      case 'low': return 'var(--status-success-text)';
      case 'medium': return 'var(--status-warning-text)';
      case 'high': return 'var(--status-danger-text)';
      default: return 'var(--ink-3)';
    }
  };

  return (
    <div className={`${ui.stack} ${ui.stackGap5}`}>
      <div className={`${ui.row} ${ui.rowBetween}`}>
        <h1>{copy.ideas.title}</h1>
        {dismissedIdeas.length > 0 && (
          <button
            type="button"
            className={`${ui.btnGhost} ${ui.btnSmall}`}
            onClick={restoreAll}
          >
            ↺ Restore {dismissedIdeas.length} dismissed idea{dismissedIdeas.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      <div className={`${ui.banner} ${ui.bannerInfo}`}>
        💡 {copy.ideas.builtInLabel} — based on your event type and preferences
      </div>

      {visibleIdeas.length === 0 ? (
        <div className={ui.card} style={{ textAlign: 'center', padding: 'var(--space-7)' }}>
          <h3>All ideas dismissed</h3>
          <p className="text-muted" style={{ margin: 'var(--space-2) 0 var(--space-4)' }}>
            You have dismissed all idea suggestions.
          </p>
          <button type="button" className={ui.btnPrimary} onClick={restoreAll}>
            Restore all ideas
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {visibleIdeas.map(idea => (
            <div
              key={idea.id}
              className={ui.card}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                borderColor: idea.pinned ? 'var(--primary)' : undefined,
                boxShadow: idea.pinned ? '0 0 0 1px var(--primary)' : undefined,
              }}
            >
              <div className={`${ui.row} ${ui.rowBetween}`}>
                <h3 style={{ fontSize: 'var(--text-base)', margin: 0 }}>{idea.title}</h3>
                {idea.pinned && (
                  <span className={`${ui.statusChip} ${ui.statusSuccess}`}>
                    📌 Pinned
                  </span>
                )}
              </div>

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-2)', margin: 0 }}>
                {idea.body}
              </p>

              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-text)', fontStyle: 'italic' }}>
                {copy.ideas.whyFits}: {idea.whyFits}
              </div>

              <div className={`${ui.row} ${ui.rowGap2} ${ui.rowWrap}`}>
                <span style={{ fontSize: 'var(--text-xs)', color: costColor(idea.relativeCost), fontWeight: 600 }}>
                  Cost: {idea.relativeCost}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-3)' }}>
                  Effort: {idea.effort}
                </span>
                {idea.tags.map(tag => (
                  <span key={tag} className={`${ui.statusChip} ${ui.statusNeutral}`}>{tag}</span>
                ))}
              </div>

              <div className={`${ui.row} ${ui.rowGap2}`} style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  className={idea.pinned ? `${ui.btnSecondary} ${ui.btnSmall}` : `${ui.btnPrimary} ${ui.btnSmall}`}
                  onClick={() => togglePin(idea.id)}
                >
                  {idea.pinned ? '✓ Pinned (click to unpin)' : `📌 ${copy.ideas.pin}`}
                </button>
                <button
                  type="button"
                  className={`${ui.btnGhost} ${ui.btnSmall}`}
                  onClick={() => dismissIdea(idea.id)}
                  title="Dismiss this idea"
                >
                  {copy.ideas.dismiss}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
