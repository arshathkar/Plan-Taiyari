'use client';

import { useState } from 'react';
import { usePlanStore } from '@/store/plan-store';
import { copy } from '@/copy/en-IN';
import { formatInr } from '@/engines';
import ui from '@/components/ui.module.css';

export default function VendorsPage() {
  const plan = usePlanStore(s => s.plan);
  const updatePlan = usePlanStore(s => s.updatePlan);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [tab, setTab] = useState<'requirements' | 'callQuestions' | 'vendors' | 'compare'>('requirements');
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');

  if (!plan) return null;

  const vendorCategories = plan.vendorCategories;
  const activeCat = vendorCategories.find(c => c.id === selectedCat) ?? vendorCategories[0];
  const categoryVendors = plan.vendors.filter(v => v.categoryId === activeCat?.id);

  const addVendor = () => {
    if (!newVendorName.trim() || !activeCat) return;
    updatePlan(p => ({
      ...p,
      vendors: [...p.vendors, {
        id: `v_${Date.now()}`,
        categoryId: activeCat.id,
        name: newVendorName.trim(),
        status: 'shortlisted' as const,
        contactNote: '',
        quote: null,
        payments: [],
      }],
    }));
    setNewVendorName('');
    setShowAddVendor(false);
  };

  const updateVendorStatus = (vendorId: string, status: 'shortlisted' | 'called' | 'quoted' | 'booked' | 'rejected') => {
    updatePlan(p => ({
      ...p,
      vendors: p.vendors.map(v => v.id === vendorId ? { ...v, status } : v),
    }));
  };

  return (
    <div className={`${ui.stack} ${ui.stackGap5}`}>
      <h1>Vendors</h1>

      {/* Disclosure */}
      <div className={`${ui.banner} ${ui.bannerInfo}`} role="note">
        ℹ️ {copy.vendor.disclosure}
      </div>

      {vendorCategories.length === 0 ? (
        <div className={ui.emptyState}>
          <h3>No vendor categories yet</h3>
          <p>Generate a plan first to see vendor categories.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          {/* Category list */}
          <div className={`${ui.stack} ${ui.stackGap1}`} style={{ minWidth: 180 }}>
            {vendorCategories.map(cat => (
              <button key={cat.id}
                className={activeCat?.id === cat.id ? ui.chipSelected : ui.chip}
                onClick={() => { setSelectedCat(cat.id); setTab('requirements'); }}
                style={{ width: '100%', justifyContent: 'flex-start' }}>
                {cat.label}
                <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)' }}>
                  {plan.vendors.filter(v => v.categoryId === cat.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Category detail */}
          {activeCat && (
            <div className={`${ui.stack} ${ui.stackGap4}`} style={{ flex: 1 }}>
              <h2>{activeCat.label}</h2>

              <div className={ui.tabList} role="tablist">
                {(['requirements', 'callQuestions', 'vendors', 'compare'] as const).map(t => (
                  <button key={t} role="tab" aria-selected={tab === t}
                    className={tab === t ? ui.tabActive : ui.tab}
                    onClick={() => setTab(t)}>
                    {copy.vendor.tabs[t]}
                  </button>
                ))}
              </div>

              {/* Requirements */}
              {tab === 'requirements' && (
                <div className={`${ui.stack} ${ui.stackGap2}`}>
                  {activeCat.requirements.map(req => (
                    <div key={req.id} className={`${ui.row} ${ui.rowGap3}`} style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--glass-border)' }}>
                      <span style={{ fontWeight: 600, minWidth: 24 }}>{'★'.repeat(req.weight)}</span>
                      <span style={{ flex: 1 }}>{req.label}</span>
                      {req.must && <span className={`${ui.statusChip} ${ui.statusDanger}`}>Must-have</span>}
                    </div>
                  ))}
                  {activeCat.requirements.length === 0 && <p className="text-muted">No requirements set.</p>}
                </div>
              )}

              {/* Call questions */}
              {tab === 'callQuestions' && (
                <div className={`${ui.stack} ${ui.stackGap2}`}>
                  {activeCat.questions.map(q => (
                    <div key={q.id} className={`${ui.row} ${ui.rowGap3}`} style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--glass-border)' }}>
                      <span style={{ flex: 1 }}>{q.text}</span>
                      <span className={`${ui.statusChip} ${q.asked ? ui.statusSuccess : ui.statusNeutral}`}>
                        {q.asked ? '✓ Asked' : 'To ask'}
                      </span>
                    </div>
                  ))}
                  {activeCat.questions.length === 0 && <p className="text-muted">No questions yet.</p>}
                </div>
              )}

              {/* Vendors & quotes */}
              {tab === 'vendors' && (
                <div className={`${ui.stack} ${ui.stackGap3}`}>
                  {categoryVendors.map(vendor => (
                    <div key={vendor.id} className={ui.card} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div className={`${ui.row} ${ui.rowBetween}`}>
                        <div>
                          <strong>{vendor.name}</strong>
                          <div className={`${ui.row} ${ui.rowGap2}`} style={{ marginTop: 'var(--space-1)' }}>
                            {(['shortlisted', 'called', 'quoted', 'booked', 'rejected'] as const).map(s => (
                              <button key={s} onClick={() => updateVendorStatus(vendor.id, s)}
                                className={vendor.status === s ? ui.chipSelected : ui.chip}
                                style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', minHeight: 24 }}>
                                {copy.vendor.statuses[s]}
                              </button>
                            ))}
                          </div>
                        </div>
                        {vendor.quote && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700 }}>{formatInr(vendor.quote.totalInr)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {showAddVendor ? (
                    <div className={`${ui.row} ${ui.rowGap2}`}>
                      <input className={ui.input} placeholder="Vendor name" value={newVendorName}
                        onChange={e => setNewVendorName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addVendor()} style={{ flex: 1 }} />
                      <button className={ui.btnPrimary} onClick={addVendor}>Add</button>
                      <button className={ui.btnGhost} onClick={() => setShowAddVendor(false)}>Cancel</button>
                    </div>
                  ) : (
                    <button className={ui.btnSecondary} onClick={() => setShowAddVendor(true)}>
                      + {copy.vendor.addVendor}
                    </button>
                  )}
                </div>
              )}

              {/* Compare */}
              {tab === 'compare' && (
                <div>
                  {categoryVendors.filter(v => v.quote).length < 2 ? (
                    <p className="text-muted">Add at least 2 quotes to compare.</p>
                  ) : (
                    <div>
                      <p className="text-muted" style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                        {copy.vendor.fitNote}
                      </p>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border-ui)' }}>
                            <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Vendor</th>
                            <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Quoted</th>
                            <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Extras</th>
                            <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>All-in</th>
                            <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryVendors.filter(v => v.quote).map(v => (
                            <tr key={v.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                              <td style={{ padding: 'var(--space-2)', fontWeight: 500 }}>{v.name}</td>
                              <td style={{ textAlign: 'right', padding: 'var(--space-2)' }}>{formatInr(v.quote!.totalInr)}</td>
                              <td style={{ textAlign: 'right', padding: 'var(--space-2)' }}>
                                {formatInr(v.quote!.extras.reduce((s, e) => s + (e.amountInr ?? 0), 0))}
                              </td>
                              <td style={{ textAlign: 'right', padding: 'var(--space-2)', fontWeight: 600 }}>
                                {formatInr(v.quote!.totalInr + v.quote!.extras.reduce((s, e) => s + (e.amountInr ?? 0), 0))}
                              </td>
                              <td style={{ padding: 'var(--space-2)' }}>
                                <span className={`${ui.statusChip} ${v.status === 'booked' ? ui.statusSuccess : ui.statusNeutral}`}>
                                  {copy.vendor.statuses[v.status]}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
