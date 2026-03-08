import React from 'react';
import { useStore } from '../../store';
import type { BackgroundStyle, ThemeAccent } from '../../types';

const XIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>}
      </div>
      <div onClick={() => onChange(!checked)} style={{ cursor: 'pointer', width: 36, height: 20, borderRadius: 10, background: checked ? 'var(--accent-blue)' : 'var(--bg-hover)', border: '1px solid var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: checked ? 18 : 3, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </div>
    </div>
  );
}

const BG_OPTIONS: { value: BackgroundStyle; label: string; icon: string }[] = [
  { value: 'dots', label: 'Dots', icon: '⋮⋮' },
  { value: 'lines', label: 'Lines', icon: '≡' },
  { value: 'cross', label: 'Cross', icon: '✛' },
  { value: 'none', label: 'None', icon: '□' },
];

const ACCENT_OPTIONS: { value: ThemeAccent; label: string; color: string }[] = [
  { value: 'blue', label: 'Blue', color: '#4493f8' },
  { value: 'purple', label: 'Purple', color: '#8957e5' },
  { value: 'green', label: 'Green', color: '#3fb950' },
  { value: 'orange', label: 'Orange', color: '#f0883e' },
  { value: 'pink', label: 'Pink', color: '#e58a8a' },
];

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const snapToGrid = useStore(s => s.snapToGrid);
  const showMinimap = useStore(s => s.showMinimap);
  const backgroundStyle = useStore(s => s.backgroundStyle);
  const themeAccent = useStore(s => s.themeAccent);
  const setSnapToGrid = useStore(s => s.setSnapToGrid);
  const setShowMinimap = useStore(s => s.setShowMinimap);
  const setBackgroundStyle = useStore(s => s.setBackgroundStyle);
  const setThemeAccent = useStore(s => s.setThemeAccent);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fade-in" style={{ width: 400, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>⚙ Settings</div>
          <button className="btn-icon" onClick={onClose}><XIcon /></button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <Toggle checked={snapToGrid} onChange={setSnapToGrid} label="Snap to Grid" sub="Nodes snap to 8px grid while dragging" />
          <Toggle checked={showMinimap} onChange={setShowMinimap} label="Show Minimap" sub="Overview map in bottom-right corner" />

          {/* Background style */}
          <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>Background Style</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {BG_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setBackgroundStyle(opt.value)} style={{
                  flex: 1, padding: '8px 4px', background: backgroundStyle === opt.value ? 'rgba(68,147,248,0.15)' : 'var(--bg-overlay)',
                  border: `1px solid ${backgroundStyle === opt.value ? 'var(--accent-blue)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13, color: backgroundStyle === opt.value ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 16 }}>{opt.icon}</span>
                  <span style={{ fontSize: 10 }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div style={{ padding: '12px 0' }}>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>Accent Color</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {ACCENT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setThemeAccent(opt.value)} title={opt.label} style={{
                  width: 32, height: 32, borderRadius: '50%', background: opt.color, border: `3px solid ${themeAccent === opt.value ? '#fff' : 'transparent'}`,
                  cursor: 'pointer', boxShadow: themeAccent === opt.value ? `0 0 0 2px ${opt.color}` : 'none', transition: 'all 0.15s',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
