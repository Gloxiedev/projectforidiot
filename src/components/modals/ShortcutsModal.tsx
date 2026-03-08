import React from 'react';
import { useStore } from '../../store';

const XIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function Key({ k }: { k: string }) {
  return (
    <kbd style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--font-mono)',
      fontSize: 11, fontWeight: 600, color: 'var(--text-primary)',
      background: 'var(--bg-hover)', border: '1px solid var(--border)',
      boxShadow: '0 1px 0 var(--border)', minWidth: 22,
    }}>
      {k}
    </kbd>
  );
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {keys.map((k, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+</span>}
            <Key k={k} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function ShortcutsModal() {
  const setShowShortcutsModal = useStore(s => s.setShowShortcutsModal);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && setShowShortcutsModal(false)}>
      <div className="fade-in" style={{ width: 480, maxHeight: '80vh', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>⌨ Keyboard Shortcuts</div>
          <button className="btn-icon" onClick={() => setShowShortcutsModal(false)}><XIcon /></button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Section title="File">
            <ShortcutRow keys={['Ctrl', 'S']} label="Save project file" />
            <ShortcutRow keys={['Ctrl', 'O']} label="Open project file" />
            <ShortcutRow keys={['Ctrl', 'Shift', 'E']} label="Open export dialog" />
            <ShortcutRow keys={['Ctrl', 'N']} label="New project" />
          </Section>
          <Section title="Edit">
            <ShortcutRow keys={['Ctrl', 'Z']} label="Undo" />
            <ShortcutRow keys={['Ctrl', 'Y']} label="Redo" />
            <ShortcutRow keys={['Ctrl', 'C']} label="Copy selected node" />
            <ShortcutRow keys={['Ctrl', 'V']} label="Paste node" />
            <ShortcutRow keys={['Ctrl', 'D']} label="Duplicate selected node" />
            <ShortcutRow keys={['Del']} label="Delete selected node/edge" />
            <ShortcutRow keys={['Esc']} label="Deselect / close panel" />
          </Section>
          <Section title="Canvas">
            <ShortcutRow keys={['Ctrl', 'Shift', 'F']} label="Fit view" />
            <ShortcutRow keys={['Ctrl', '+']} label="Zoom in" />
            <ShortcutRow keys={['Ctrl', '-']} label="Zoom out" />
            <ShortcutRow keys={['Ctrl', 'L']} label="Auto-layout nodes" />
            <ShortcutRow keys={['Space']} label="Pan canvas (hold)" />
          </Section>
          <Section title="Panels">
            <ShortcutRow keys={['Ctrl', 'Shift', 'L']} label="Toggle locale panel" />
            <ShortcutRow keys={['Ctrl', 'Shift', 'V']} label="Toggle validation panel" />
            <ShortcutRow keys={['Ctrl', 'Shift', 'S']} label="Toggle stats panel" />
            <ShortcutRow keys={['Ctrl', 'Shift', 'P']} label="Toggle simulator" />
            <ShortcutRow keys={['?']} label="Show this shortcuts panel" />
          </Section>
          <Section title="Node Quick-Add">
            <ShortcutRow keys={['1']} label="Add Selection node" />
            <ShortcutRow keys={['2']} label="Add Button node" />
            <ShortcutRow keys={['3']} label="Add Information node" />
            <ShortcutRow keys={['4']} label="Add Modal node" />
            <ShortcutRow keys={['5']} label="Add End node" />
          </Section>
        </div>
      </div>
    </div>
  );
}
