import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store';

export default function SearchBar({ onClose }: { onClose: () => void }) {
  const searchQuery = useStore(s => s.searchQuery);
  const setSearchQuery = useStore(s => s.setSearchQuery);
  const setHighlightedNodeIds = useStore(s => s.setHighlightedNodeIds);
  const selectNode = useStore(s => s.selectNode);
  const project = useStore(s => s.project);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = searchQuery.length >= 2 ? project.nodes.filter(n => {
    const d = n.data as any;
    const fields = [d.label, d.questionKey, d.titleKey, d.contentKey, d.triggerAction, n.type, n.id];
    return fields.some(f => f?.toLowerCase().includes(searchQuery.toLowerCase()));
  }) : [];

  useEffect(() => {
    setHighlightedNodeIds(results.map(n => n.id));
    return () => setHighlightedNodeIds([]);
  }, [results.length, searchQuery]);

  const NODE_LABELS: Record<string, string> = {
    start: '▶ Start', end: '⏹ End', question_selection: '☰ Selection',
    question_button: '⊞ Button', question_information: 'ℹ Info', question_modal: '⊡ Modal',
  };

  return (
    <div style={{
      position: 'fixed', top: 54, left: '50%', transform: 'translateX(-50%)',
      width: 480, zIndex: 200, background: 'var(--bg-elevated)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input ref={inputRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search nodes by key, type, label…" style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 13 }} />
        <button className="btn-ghost" onClick={() => { setSearchQuery(''); onClose(); }} style={{ fontSize: 11 }}>Esc</button>
      </div>
      {searchQuery.length >= 2 && (
        <div style={{ maxHeight: 320, overflow: 'auto', borderTop: '1px solid var(--border-subtle)' }}>
          {results.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No nodes match "{searchQuery}"</div>
          ) : results.map(node => {
            const d = node.data as any;
            const primaryText = d.questionKey || d.titleKey || d.label || node.type;
            return (
              <div key={node.id} onClick={() => { selectNode(node.id); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', width: 90, flexShrink: 0 }}>{NODE_LABELS[node.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{primaryText}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{node.id.substring(0, 20)}</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
              </div>
            );
          })}
        </div>
      )}
      {searchQuery.length >= 2 && results.length > 0 && (
        <div style={{ padding: '6px 14px', borderTop: '1px solid var(--border-subtle)', fontSize: 10, color: 'var(--text-muted)' }}>
          {results.length} result{results.length !== 1 ? 's' : ''} — click to select
        </div>
      )}
    </div>
  );
}
