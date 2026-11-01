'use client';

import { useState, useRef, useEffect } from 'react';
import { usePlanStore } from '@/store/plan-store';
import { rebalance } from '@/engines/rebalance';
import type { RebalanceCategory } from '@/engines/rebalance';
import { formatInr } from '@/engines/inr';
import styles from './AssistantPanel.module.css';

/* ── Predefined responses ───────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTED_PROMPTS = [
  'Cut 20% from the budget',
  'We now expect 15 more guests',
  'What should I do next?',
  'Show me the budget summary',
  'How is my timeline looking?',
  'Make it more relaxed',
];

function generateResponse(input: string, plan: ReturnType<typeof usePlanStore.getState>['plan']): {
  reply: string;
  action?: () => void;
} {
  if (!plan) {
    return { reply: 'No plan yet! Start by creating your event from the home page or try a sample event.' };
  }

  const lower = input.toLowerCase().trim();

  // Budget cut
  if (lower.includes('cut') && lower.includes('budget')) {
    const match = lower.match(/(\d+)\s*%/);
    const pct = match ? parseInt(match[1]) : 20;
    const newBudget = Math.round(plan.budget.totalInr * (1 - pct / 100));

    const cats: RebalanceCategory[] = plan.budget.categories.map(c => ({
      id: c.id, label: c.label, amountInr: c.amountInr,
      weight: c.weight, minPct: c.minPct, maxPct: c.maxPct,
      elasticity: c.elasticity, maxCut: c.maxCut,
      locked: c.locked, protected: c.protected,
    }));

    const guests = plan.intake.guests?.expected ?? 50;
    const result = rebalance({
      categories: cats,
      oldBudget: plan.budget.totalInr,
      newBudget,
      oldGuests: guests,
      newGuests: guests,
    });

    const changes = result.categories
      .filter(c => c.change !== 0)
      .map(c => `• ${c.label}: ${c.change > 0 ? '+' : ''}${formatInr(c.change)}`)
      .join('\n');

    return {
      reply: `If you cut ${pct}% from the budget (${formatInr(plan.budget.totalInr)} → ${formatInr(newBudget)}), here's what would change:\n\n${changes}\n\nOutcome: ${result.outcome}. Go to Budget → What-If tab to apply this scenario.`,
    };
  }

  // More guests
  if (lower.includes('more guests') || lower.includes('expect') && lower.includes('guest')) {
    const match = lower.match(/(\d+)\s*more/);
    const extra = match ? parseInt(match[1]) : 15;
    const currentGuests = plan.intake.guests?.expected ?? 50;
    const newGuests = currentGuests + extra;

    return {
      reply: `Adding ${extra} more guests (${currentGuests} → ${newGuests}) will mainly affect:\n\n• **Catering** — scales directly with guest count (elasticity 1.0)\n• **Invitations & favours** — also scales up\n• **Venue** — check if it still fits ${newGuests} guests\n\nGo to Budget → What-If tab, set new guest count to ${newGuests} to see the exact numbers.`,
    };
  }

  // What to do next
  if (lower.includes('what should') || lower.includes('what next') || lower.includes('do next')) {
    const incompleteTasks = plan.tasks.filter(t => !t.done);
    const readyTasks = incompleteTasks.filter(t =>
      t.dependsOn.every(dep => plan.tasks.find(d => d.id === dep)?.done)
    );

    if (readyTasks.length === 0) {
      return { reply: 'All tasks are either done or blocked. Check the Timeline tab for any blocked tasks that need attention.' };
    }

    const top3 = readyTasks.slice(0, 3);
    const taskList = top3.map((t, i) => `${i + 1}. **${t.title}** (${t.categoryId})`).join('\n');

    return {
      reply: `Here are the top tasks ready for action:\n\n${taskList}\n\nYou have ${incompleteTasks.length} tasks remaining, ${readyTasks.length} ready to start. Head to the Timeline tab to manage them.`,
    };
  }

  // Budget summary
  if (lower.includes('budget') && (lower.includes('summary') || lower.includes('show'))) {
    const cats = plan.budget.categories
      .map(c => `• ${c.label}: ${formatInr(c.amountInr)}${c.locked ? ' 🔒' : ''}${c.protected ? ' 🛡️' : ''}`)
      .join('\n');

    const totalCommitted = plan.budget.categories.reduce((s, c) => s + c.committedInr, 0);
    const totalPaid = plan.budget.categories.reduce((s, c) => s + c.paidInr, 0);

    return {
      reply: `**Budget: ${formatInr(plan.budget.totalInr)}**\n\n${cats}\n\nCommitted: ${formatInr(totalCommitted)} | Paid: ${formatInr(totalPaid)} | Remaining: ${formatInr(plan.budget.totalInr - totalCommitted)}`,
    };
  }

  // Timeline status
  if (lower.includes('timeline') || lower.includes('schedule')) {
    const done = plan.tasks.filter(t => t.done).length;
    const total = plan.tasks.length;
    const remaining = total - done;

    return {
      reply: `**Timeline progress: ${done}/${total} tasks done** (${remaining} remaining)\n\nHead to the Timeline tab to see dependencies, flags, and which tasks are ready to start.`,
    };
  }

  // Relaxed / vibe
  if (lower.includes('relaxed') || lower.includes('vibe') || lower.includes('casual')) {
    return {
      reply: `For a more relaxed feel, consider:\n\n• **Minimal formal programme** — skip rigid scheduling, let things flow\n• **Comfortable seating** — mix of chairs and cushion areas\n• **Acoustic / unplugged music** instead of loud DJ\n• **Buffet over served dinner** — guests mingle freely\n• **Photo booth** instead of formal photo sessions\n\nCheck the Ideas tab for more personalised suggestions!`,
    };
  }

  // Vendor help
  if (lower.includes('vendor') || lower.includes('caterer') || lower.includes('photographer')) {
    const vendorCount = plan.vendors.length;
    const booked = plan.vendors.filter(v => v.status === 'booked').length;

    return {
      reply: `You have ${vendorCount} vendor${vendorCount !== 1 ? 's' : ''} tracked (${booked} booked).\n\nFor each vendor category, use the Vendors tab to:\n1. Review the requirement checklist\n2. Use call questions when speaking to vendors\n3. Add quotes and compare them side-by-side\n\nThe comparison engine scores vendors on coverage, cost, and terms.`,
    };
  }

  // Default fallback
  return {
    reply: `I can help with:\n\n• **Budget scenarios** — "Cut 20% from the budget"\n• **Guest changes** — "We now expect 15 more guests"\n• **Next steps** — "What should I do next?"\n• **Budget overview** — "Show me the budget summary"\n• **Timeline status** — "How is my timeline looking?"\n• **Mood & style** — "Make it more relaxed"\n\nTry one of the suggested prompts below, or ask about your budget, timeline, or vendors!`,
  };
}

/* ── Component ──────────────────────────────────────────────── */

export default function AssistantPanel() {
  const plan = usePlanStore(s => s.plan);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi! I\'m your planning assistant. Ask me about your budget, timeline, vendors, or try one of the suggested prompts below.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
    };

    const { reply } = generateResponse(text, plan);
    const assistantMsg: ChatMessage = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      text: reply,
    };

    setMessages(prev => [...prev.slice(-18), userMsg, assistantMsg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  if (!isOpen) {
    return (
      <button
        className={styles.fab}
        onClick={() => setIsOpen(true)}
        aria-label="Open planning assistant"
        title="Planning Assistant"
      >
        💬
      </button>
    );
  }

  return (
    <>
      {/* Blurred backdrop behind assistant */}
      <div
        className={styles.backdrop}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside className={styles.panel} role="complementary" aria-label="Planning assistant">
        <header className={styles.header}>
          <h3 className={styles.headerTitle}>Planning Assistant</h3>
          <span className={styles.badge}>Template Mode</span>
          <button
            className={styles.closeBtn}
            onClick={() => setIsOpen(false)}
            aria-label="Close assistant"
          >
            ✕
          </button>
        </header>

        <div className={styles.messages}>
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.role === 'user' ? styles.userMsg : styles.assistantMsg}`}
            >
              <div className={styles.msgContent}>
                {msg.text.split('\n').map((line, i) => (
                  <p key={i}>{line.replace(/\*\*(.*?)\*\*/g, '«$1»')}</p>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.suggestions}>
          {SUGGESTED_PROMPTS.map(prompt => (
            <button
              key={prompt}
              className={styles.promptChip}
              onClick={() => handleSend(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className={styles.inputArea}>
          <input
            type="text"
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your plan..."
            aria-label="Message to assistant"
          />
          <button
            className={styles.sendBtn}
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            →
          </button>
        </div>
      </aside>
    </>
  );
}
