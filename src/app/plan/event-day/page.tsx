'use client';

import { usePlanStore } from '@/store/plan-store';
import { copy } from '@/copy/en-IN';
import { formatInr, formatDateDisplay } from '@/engines';
import ui from '@/components/ui.module.css';

export default function EventDayPage() {
  const plan = usePlanStore(s => s.plan);
  if (!plan) return null;

  const bookedVendors = plan.vendors.filter(v => v.status === 'booked');
  const runSheet = plan.runSheet;

  // Day-before checklist (templated)
  const dayBeforeItems = [
    'Confirm all vendors by phone',
    'Check venue access time and keys',
    'Pack decorations, supplies and signage',
    'Charge phones and portable batteries',
    'Print the run sheet and contact list',
    'Prepare cash and payment details',
    'Check weather forecast and backup plans',
    'Brief helpers on their roles',
  ];

  // Payments due
  const paymentsDue = plan.vendors.flatMap(v =>
    v.payments.filter(p => !p.paid).map(p => ({
      vendor: v.name,
      label: p.label,
      dueOn: p.dueOn,
      amount: p.amountInr,
    }))
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`${ui.stack} ${ui.stackGap5}`}>
      <div className={`${ui.row} ${ui.rowBetween}`}>
        <h1>Event Day</h1>
        <button className={ui.btnSecondary} onClick={handlePrint}>
          🖨️ {copy.eventDay.printPlan}
        </button>
      </div>

      {/* Run sheet */}
      <div className={ui.card}>
        <h2 style={{ marginBottom: 'var(--space-3)' }}>{copy.eventDay.runSheet}</h2>
        {runSheet.length === 0 ? (
          <p className="text-muted">No run sheet entries yet. Add time blocks for your event day.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-ui)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)', width: 80 }}>Time</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Activity</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)', width: 120 }}>Owner</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {runSheet.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: 'var(--space-2)', fontWeight: 600 }}>{item.time}</td>
                  <td style={{ padding: 'var(--space-2)' }}>{item.activity}</td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--ink-3)' }}>{item.owner ?? '—'}</td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--ink-3)', fontSize: 'var(--text-xs)' }}>{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Vendor contact roster */}
      <div className={ui.card}>
        <h2 style={{ marginBottom: 'var(--space-3)' }}>{copy.eventDay.vendorRoster}</h2>
        {bookedVendors.length === 0 ? (
          <p className="text-muted">No vendors booked yet.</p>
        ) : (
          <div className={`${ui.stack} ${ui.stackGap2}`}>
            {bookedVendors.map(v => (
              <div key={v.id} className={`${ui.row} ${ui.rowBetween}`} style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <strong>{v.name}</strong>
                  <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                    {plan.vendorCategories.find(c => c.id === v.categoryId)?.label ?? v.categoryId}
                  </div>
                </div>
                <span className={`${ui.statusChip} ${ui.statusSuccess}`}>✓ Booked</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Day-before checklist */}
      <div className={ui.card}>
        <h2 style={{ marginBottom: 'var(--space-3)' }}>{copy.eventDay.dayBefore}</h2>
        <div className={`${ui.stack} ${ui.stackGap2}`}>
          {dayBeforeItems.map((item, i) => (
            <label key={i} className={`${ui.row} ${ui.rowGap3}`} style={{ padding: 'var(--space-2) 0', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: 20, height: 20, accentColor: 'var(--primary)' }} />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Payments due */}
      <div className={ui.card}>
        <h2 style={{ marginBottom: 'var(--space-3)' }}>{copy.eventDay.paymentsDue}</h2>
        {paymentsDue.length === 0 ? (
          <p className="text-muted">No pending payments.</p>
        ) : (
          <div className={`${ui.stack} ${ui.stackGap2}`}>
            {paymentsDue.map((p, i) => (
              <div key={i} className={`${ui.row} ${ui.rowBetween}`} style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <strong>{p.vendor}</strong>
                  <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>{p.label} · Due {formatDateDisplay(p.dueOn)}</div>
                </div>
                <strong>{formatInr(p.amount)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
