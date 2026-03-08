import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { loadProjectFromFile, saveProjectFile } from '../../utils/export';

const accentVarMap: Record<string, string> = {
  blue: '#4493f8', purple: '#8957e5', green: '#3fb950', orange: '#f0883e', pink: '#e58a8a',
};

export default function Toolbar({ onOpenSettings, onOpenSearch }: { onOpenSettings: () => void; onOpenSearch: () => void }) {
  const project = useStore(s => s.project);
  const isDirty = useStore(s => s.isDirty);
  const validationIssues = useStore(s => s.validationIssues);
  const canUndo = useStore(s => s.canUndo);
  const canRedo = useStore(s => s.canRedo);
  const themeAccent = useStore(s => s.themeAccent);

  const setShowLocalePanel = useStore(s => s.setShowLocalePanel);
  const setShowValidationPanel = useStore(s => s.setShowValidationPanel);
  const setShowExportModal = useStore(s => s.setShowExportModal);
  const setShowShortcutsModal = useStore(s => s.setShowShortcutsModal);
  const setShowStatsPanel = useStore(s => s.setShowStatsPanel);
  const setShowChangelogPanel = useStore(s => s.setShowChangelogPanel);
  const newProject = useStore(s => s.newProject);
  const loadProject = useStore(s => s.loadProject);
  const setProjectMeta = useStore(s => s.setProjectMeta);
  const runValidation = useStore(s => s.runValidation);
  const undo = useStore(s => s.undo);
  const redo = useStore(s => s.redo);
  const autoLayout = useStore(s => s.autoLayout);
  const startSimulator = useStore(s => s.startSimulator);
  const saveToLocalStorage = useStore(s => s.saveToLocalStorage);
  const pushHistory = useStore(s => s.pushHistory);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(project.meta.name);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const errors = validationIssues.filter(i => i.severity === 'error').length;
  const warnings = validationIssues.filter(i => i.severity === 'warning').length;

  // Apply theme accent CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-blue', accentVarMap[themeAccent] || '#4493f8');
    document.documentElement.style.setProperty('--border-focus', accentVarMap[themeAccent] || '#4493f8');
  }, [themeAccent]);

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) {
        saveToLocalStorage();
        setLastSaved(new Date().toLocaleTimeString());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (ctrl && e.key === 's') { e.preventDefault(); saveProjectFile(project); saveToLocalStorage(); setLastSaved(new Date().toLocaleTimeString()); }
      if (ctrl && e.key === 'z') { e.preventDefault(); undo(); }
      if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
      if (ctrl && e.shiftKey && e.key === 'E') { e.preventDefault(); setShowExportModal(true); }
      if (ctrl && e.shiftKey && e.key === 'L') { e.preventDefault(); setShowLocalePanel(true); }
      if (ctrl && e.shiftKey && e.key === 'V') { e.preventDefault(); setShowValidationPanel(!useStore.getState().showValidationPanel); }
      if (ctrl && e.shiftKey && e.key === 'S') { e.preventDefault(); setShowStatsPanel(true); }
      if (ctrl && e.shiftKey && e.key === 'P') { e.preventDefault(); startSimulator(); }
      if (ctrl && e.key === 'f') { e.preventDefault(); onOpenSearch(); }
      if (ctrl && e.key === 'l') { e.preventDefault(); pushHistory('Auto Layout'); autoLayout(); }
      if (e.key === '?') { setShowShortcutsModal(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [project, undo, redo]);

  const handleLoad = async () => {
    try { loadProject(await loadProjectFromFile()); } catch (e) { alert('Failed to load: ' + (e as Error).message); }
  };
  const handleNameCommit = () => { setProjectMeta({ name: nameValue }); setEditingName(false); };

  const accentColor = accentVarMap[themeAccent] || '#4493f8';

  return (
    <div style={{ height: 44, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', flexShrink: 0, userSelect: 'none' }}>
      {/* Logo */}
      <div style={{ width: 200, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid var(--border)', height: '100%', flexShrink: 0 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: `linear-gradient(135deg, ${accentColor}, var(--accent-purple))`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/>
            <line x1="7" y1="12" x2="17" y2="6"/><line x1="7" y1="12" x2="17" y2="18"/>
          </svg>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>FlowForge</span>
        <span style={{ fontSize: 9, background: accentColor + '22', color: accentColor, border: `1px solid ${accentColor}44`, borderRadius: 4, padding: '1px 5px', fontWeight: 700, letterSpacing: '0.5px' }}>v2</span>
      </div>

      {/* File group */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 6px', gap: 1 }}>
        <TBtn onClick={newProject} label="New" title="New project" icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>} />
        <TBtn onClick={handleLoad} label="Open" title="Open project (Ctrl+O)" icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>} />
        <TBtn onClick={() => { saveProjectFile(project); saveToLocalStorage(); setLastSaved(new Date().toLocaleTimeString()); }} label="Save" title="Save project (Ctrl+S)" accent={isDirty} icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>} />
      </div>
      <Divider />

      {/* Edit group */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 6px', gap: 1 }}>
        <TBtn onClick={undo} label="Undo" title="Undo (Ctrl+Z)" disabled={!canUndo()} icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>} />
        <TBtn onClick={redo} label="Redo" title="Redo (Ctrl+Y)" disabled={!canRedo()} icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>} />
      </div>
      <Divider />

      {/* Tools group */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 6px', gap: 1 }}>
        <TBtn onClick={() => { pushHistory('Auto Layout'); autoLayout(); }} label="Layout" title="Auto-layout nodes (Ctrl+L)" icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>} />
        <TBtn onClick={onOpenSearch} label="Search" title="Search nodes (Ctrl+F)" icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>} />
        <TBtn onClick={startSimulator} label="Simulate" title="Simulate flow (Ctrl+Shift+P)" icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>} />
      </div>
      <Divider />

      {/* Project name */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
        {editingName ? (
          <input autoFocus type="text" value={nameValue} onChange={e => setNameValue(e.target.value)}
            onBlur={handleNameCommit} onKeyDown={e => e.key === 'Enter' && handleNameCommit()}
            style={{ fontSize: 12, fontWeight: 600, background: 'var(--bg-overlay)', border: '1px solid var(--accent-blue)', borderRadius: 4, padding: '3px 8px', color: 'var(--text-primary)', width: 200 }} />
        ) : (
          <button onClick={() => { setNameValue(project.meta.name); setEditingName(true); }}
            style={{ background: 'transparent', border: 'none', cursor: 'text', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', padding: '3px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {project.meta.name}
            {isDirty && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-yellow)', flexShrink: 0 }} title="Unsaved changes" />}
          </button>
        )}
        {lastSaved && <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>Saved {lastSaved}</span>}
      </div>

      {/* Right actions */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', height: '100%', padding: '0 10px', gap: 5 }}>
        {/* Validation badge */}
        <button onClick={() => { runValidation(); setShowValidationPanel(!useStore.getState().showValidationPanel); }} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px',
          background: errors > 0 ? 'rgba(248,81,73,0.1)' : warnings > 0 ? 'rgba(210,153,34,0.1)' : 'rgba(63,185,80,0.1)',
          border: `1px solid ${errors > 0 ? 'rgba(248,81,73,0.3)' : warnings > 0 ? 'rgba(210,153,34,0.3)' : 'rgba(63,185,80,0.3)'}`,
          borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600,
          color: errors > 0 ? 'var(--accent-red)' : warnings > 0 ? 'var(--accent-yellow)' : 'var(--accent-green)',
        }}>
          {errors > 0 ? `⛔ ${errors}` : warnings > 0 ? `⚠ ${warnings}` : '✓ Valid'}
        </button>

        <IconBtn onClick={() => setShowStatsPanel(true)} title="Flow Statistics" icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        } />
        <IconBtn onClick={() => setShowChangelogPanel(true)} title="Project notes & history" icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        } />
        <IconBtn onClick={onOpenSettings} title="Settings" icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        } />
        <IconBtn onClick={() => setShowShortcutsModal(true)} title="Keyboard shortcuts (?)" icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>
        } />

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 3px' }} />

        {/* Locale */}
        <button onClick={() => setShowLocalePanel(true)} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px',
          background: 'transparent', border: '1px solid var(--border)', borderRadius: 6,
          cursor: 'pointer', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          {project.locales.length} lang{project.locales.length !== 1 ? 's' : ''}
        </button>

        {/* Export */}
        <button onClick={() => setShowExportModal(true)} className="btn btn-primary" style={{ fontSize: 12 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>
    </div>
  );
}

function TBtn({ onClick, label, title, icon, accent, disabled }: { onClick: () => void; label: string; title?: string; icon: React.ReactNode; accent?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} title={title || label} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 7px',
      background: 'transparent', border: '1px solid transparent', borderRadius: 4,
      cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 11, opacity: disabled ? 0.4 : 1,
      color: accent ? 'var(--accent-yellow)' : 'var(--text-secondary)', transition: 'all 0.15s',
    }}
      onMouseEnter={e => !disabled && ((e.currentTarget as any).style.background = 'var(--bg-hover)', (e.currentTarget as any).style.borderColor = 'var(--border)', (e.currentTarget as any).style.color = 'var(--text-primary)')}
      onMouseLeave={e => ((e.currentTarget as any).style.background = 'transparent', (e.currentTarget as any).style.borderColor = 'transparent', (e.currentTarget as any).style.color = accent ? 'var(--accent-yellow)' : 'var(--text-secondary)')}>
      {icon}<span>{label}</span>
    </button>
  );
}

function IconBtn({ onClick, title, icon }: { onClick: () => void; title: string; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: 5, borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
      {icon}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />;
}
