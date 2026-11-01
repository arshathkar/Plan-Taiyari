'use client';

import { usePlanStore } from '@/store/plan-store';
import { copy } from '@/copy/en-IN';
import ui from '@/components/ui.module.css';
import { useRef } from 'react';

export default function SettingsPage() {
  const settings = usePlanStore(s => s.settings);
  const setSettings = usePlanStore(s => s.setSettings);
  const exportPlan = usePlanStore(s => s.exportPlan);
  const importPlan = usePlanStore(s => s.importPlan);
  const clearPlan = usePlanStore(s => s.clearPlan);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportPlan();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-taiyari-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const success = importPlan(reader.result as string);
      if (!success) alert('Invalid plan file. Please check the format.');
    };
    reader.readAsText(file);
  };

  const handleDelete = () => {
    if (confirm(copy.settings.deleteConfirm)) {
      clearPlan();
    }
  };

  return (
    <div className={`${ui.stack} ${ui.stackGap5}`}>
      <h1>Settings</h1>

      {/* Theme */}
      <div className={ui.card}>
        <h3 style={{ marginBottom: 'var(--space-3)' }}>{copy.settings.theme}</h3>
        <div className={`${ui.row} ${ui.rowGap2}`}>
          {(['auto', 'light', 'dark'] as const).map(t => (
            <button key={t}
              className={settings.theme === t ? ui.chipSelected : ui.chip}
              onClick={() => setSettings({ theme: t })}>
              {copy.settings.themeOptions[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility */}
      <div className={ui.card}>
        <h3 style={{ marginBottom: 'var(--space-3)' }}>Accessibility</h3>
        <div className={`${ui.stack} ${ui.stackGap3}`}>
          <label className={`${ui.row} ${ui.rowBetween}`} style={{ cursor: 'pointer' }}>
            <span>{copy.settings.reduceTransparency}</span>
            <input type="checkbox" checked={settings.reduceTransparency}
              onChange={e => setSettings({ reduceTransparency: e.target.checked })}
              style={{ width: 20, height: 20, accentColor: 'var(--primary)' }} />
          </label>
          <label className={`${ui.row} ${ui.rowBetween}`} style={{ cursor: 'pointer' }}>
            <span>{copy.settings.reduceMotion}</span>
            <input type="checkbox" checked={settings.reduceMotion}
              onChange={e => setSettings({ reduceMotion: e.target.checked })}
              style={{ width: 20, height: 20, accentColor: 'var(--primary)' }} />
          </label>
          <div>
            <span style={{ marginRight: 'var(--space-3)' }}>{copy.settings.textSize}</span>
            <div className={`${ui.row} ${ui.rowGap2}`} style={{ marginTop: 'var(--space-2)' }}>
              {([100, 115, 130] as const).map(s => (
                <button key={s}
                  className={settings.textSize === s ? ui.chipSelected : ui.chip}
                  onClick={() => setSettings({ textSize: s })}>
                  {s}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className={ui.card}>
        <h3 style={{ marginBottom: 'var(--space-3)' }}>Data</h3>
        <div className={`${ui.stack} ${ui.stackGap3}`}>
          <button className={ui.btnSecondary} onClick={handleExport}>
            📤 {copy.settings.exportData}
          </button>
          <button className={ui.btnSecondary} onClick={() => fileRef.current?.click()}>
            📥 {copy.settings.importData}
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport}
            style={{ display: 'none' }} aria-label="Import plan file" />
          <button className={ui.btnDanger} onClick={handleDelete}>
            🗑️ {copy.settings.deleteAll}
          </button>
        </div>
      </div>
    </div>
  );
}
