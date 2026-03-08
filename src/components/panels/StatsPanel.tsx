import React, { useMemo } from 'react';
import { useStore } from '../../store';

const XIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const NODE_COLORS: Record<string, string> = {
  start: 'var(--node-start)', end: 'var(--node-end)',
  question_selection: 'var(--node-selection)', question_button: 'var(--node-button)',
  question_information: 'var(--node-info)', question_modal: 'var(--node-modal)',
};
const NODE_LABELS: Record<string, string> = {
  start: 'Start', end: 'End', question_selection: 'Selection',
  question_button: 'Button', question_information: 'Information', question_modal: 'Modal',
};

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      padding: '12px 16px', background: 'var(--bg-elevated)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
      borderLeft: color ? `3px solid ${color}` : undefined,
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: color || 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ pct, color = 'var(--accent-blue)', label }: { pct: number; color?: string; label: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: pct >= 90 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)' }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)', borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}

export default function StatsPanel() {
  const computeStats = useStore(s => s.computeStats);
  const setShowStatsPanel = useStore(s => s.setShowStatsPanel);
  const deleteOrphanNodes = useStore(s => s.deleteOrphanNodes);
  const deleteUnusedKeys = useStore(s => s.deleteUnusedKeys);
  const runValidation = useStore(s => s.runValidation);

  const stats = useMemo(() => computeStats(), [computeStats]);

  const handleCleanOrphans = () => { deleteOrphanNodes(); runValidation(); };
  const handleCleanKeys = () => { deleteUnusedKeys(); runValidation(); };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 120,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && setShowStatsPanel(false)}>
      <div className="fade-in" style={{
        width: 560, maxHeight: '85vh', background: 'var(--bg-surface)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>📊 Flow Statistics</div>
          <button className="btn-icon" onClick={() => setShowStatsPanel(false)}><XIcon /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Overview grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <StatCard label="Total Nodes" value={stats.nodeCount} color="var(--accent-blue)" />
            <StatCard label="Connections" value={stats.edgeCount} color="var(--accent-purple)" />
            <StatCard label="Locale Keys" value={stats.totalKeys} color="var(--accent-teal)" />
            <StatCard label="Longest Path" value={`${stats.longestPath} steps`} color="var(--accent-green)" />
            <StatCard label="Branch Points" value={stats.branchCount} sub="nodes with 2+ outputs" color="var(--accent-yellow)" />
            <StatCard label="Orphan Nodes" value={stats.orphanCount} sub="unreachable" color={stats.orphanCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)'} />
          </div>

          {/* Node breakdown */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Nodes by Type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(stats.nodesByType).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: NODE_COLORS[type] || '#888', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{NODE_LABELS[type] || type}</span>
                  <div style={{ flex: 2, height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / stats.nodeCount) * 100}%`, background: NODE_COLORS[type] || '#888', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', width: 20, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
              {Object.keys(stats.nodesByType).length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>No nodes yet</div>
              )}
            </div>
          </div>

          {/* Locale completion */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Locale Completion</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(stats.localeCompletion).map(([code, pct]) => (
                <ProgressBar key={code} label={code.toUpperCase()} pct={pct} />
              ))}
              {Object.keys(stats.localeCompletion).length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>No locales</div>
              )}
            </div>
          </div>

          {/* Cleanup tools */}
          {(stats.orphanCount > 0 || stats.unusedLocaleKeys.length > 0) && (
            <div style={{ background: 'rgba(210,153,34,0.06)', border: '1px solid rgba(210,153,34,0.2)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-yellow)', marginBottom: 10 }}>⚠ Cleanup Suggestions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.orphanCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{stats.orphanCount} orphan node{stats.orphanCount !== 1 ? 's' : ''} found</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nodes with no incoming or outgoing connections</div>
                    </div>
                    <button className="btn btn-danger btn" style={{ fontSize: 11, padding: '3px 10px', flexShrink: 0 }} onClick={handleCleanOrphans}>
                      Remove All
                    </button>
                  </div>
                )}
                {stats.unusedLocaleKeys.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{stats.unusedLocaleKeys.length} unused locale key{stats.unusedLocaleKeys.length !== 1 ? 's' : ''}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Keys in locale files not referenced by any node</div>
                    </div>
                    <button className="btn btn-danger btn" style={{ fontSize: 11, padding: '3px 10px', flexShrink: 0 }} onClick={handleCleanKeys}>
                      Clean Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
