import React, { useState } from 'react';
import { useStore } from '../../store';

const XIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function ChangelogPanel() {
  const setShowChangelogPanel = useStore(s => s.setShowChangelogPanel);
  const project = useStore(s => s.project);
  const setProjectMeta = useStore(s => s.setProjectMeta);
  const history = useStore(s => s.history);
  const [desc, setDesc] = useState(project.meta.description || '');
  const [activeTab, setActiveTab] = useState<'notes' | 'history'>('notes');

  const handleSaveDesc = () => { setProjectMeta({ description: desc }); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && setShowChangelogPanel(false)}>
      <div className="fade-in" style={{ width: 520, maxHeight: '75vh', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>📝 Project Notes & History</div>
          <button className="btn-icon" onClick={() => setShowChangelogPanel(false)}><XIcon /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', padding: '0 12px', flexShrink: 0 }}>
          {(['notes', 'history'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: 'transparent', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '10px 14px', cursor: 'pointer', fontSize: 12, fontWeight: activeTab === tab ? 600 : 400, textTransform: 'capitalize',
            }}>
              {tab === 'notes' ? '📋 Notes' : `⏱ Edit History (${history.length})`}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {activeTab === 'notes' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ marginBottom: 6 }}>Project Name</label>
                <input type="text" value={project.meta.name} onChange={e => setProjectMeta({ name: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ marginBottom: 6 }}>Version</label>
                <input type="text" value={project.meta.version} onChange={e => setProjectMeta({ version: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ marginBottom: 6 }}>Description / Notes</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={8}
                  placeholder="Add notes about this flow, changes made, TODO items, etc."
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }} />
                <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={handleSaveDesc}>Save Notes</button>
              </div>
              <div style={{ padding: 12, background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  <div>Created: <span style={{ color: 'var(--text-secondary)' }}>{new Date(project.meta.createdAt).toLocaleString()}</span></div>
                  <div>Last updated: <span style={{ color: 'var(--text-secondary)' }}>{new Date(project.meta.updatedAt).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 12 }}>
                  No edit history yet. Start making changes to see them here.
                </div>
              ) : [...history].reverse().map((entry, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-overlay)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {history.length - i}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{entry.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(entry.timestamp).toLocaleTimeString()} · {entry.nodes.length} nodes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
