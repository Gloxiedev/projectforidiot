import React from 'react';
import { useStore } from '../../store';
import type { ValidationIssue } from '../../types';

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

function IssueRow({ issue, onFocus }: { issue: ValidationIssue; onFocus?: () => void }) {
  const colors: Record<string, string> = {
    error: 'var(--accent-red)',
    warning: 'var(--accent-yellow)',
    info: 'var(--accent-blue)',
  };
  const icons: Record<string, React.ReactNode> = {
    error: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    warning: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    info: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8" strokeLinecap="round" strokeWidth="3"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
      </svg>
    ),
  };

  const color = colors[issue.severity] || 'var(--text-muted)';

  return (
    <div
      onClick={onFocus}
      style={{
        display: 'flex',
        gap: 10,
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: issue.nodeId ? 'pointer' : 'default',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => issue.nodeId && (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ color, flexShrink: 0, marginTop: 1 }}>{icons[issue.severity]}</div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>{issue.message}</div>
        {issue.nodeId && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            node: {issue.nodeId.substring(0, 16)}…
          </div>
        )}
        {issue.localeCode && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            locale: {issue.localeCode}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ValidationPanel() {
  const issues = useStore((s) => s.validationIssues);
  const runValidation = useStore((s) => s.runValidation);
  const selectNode = useStore((s) => s.selectNode);
  const setShowValidationPanel = useStore((s) => s.setShowValidationPanel);

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 260,
      height: 240,
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        flexShrink: 0,
        gap: 12,
      }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>Flow Validation</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {errors.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent-red)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              </svg>
              {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent-yellow)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              </svg>
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </span>
          )}
          {infos.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent-blue)' }}>
              {infos.length} info
            </span>
          )}
          {issues.length === 0 && (
            <span style={{ fontSize: 11, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              No issues
            </span>
          )}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button className="btn btn-secondary btn" style={{ padding: '3px 10px', fontSize: 11 }} onClick={runValidation}>
            <RefreshIcon /> Re-check
          </button>
          <button className="btn-icon" onClick={() => setShowValidationPanel(false)}><XIcon /></button>
        </div>
      </div>

      {/* Issues list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {issues.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            fontSize: 12,
            gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Flow looks good! No validation issues found.
          </div>
        ) : (
          [...errors, ...warnings, ...infos].map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              onFocus={issue.nodeId ? () => selectNode(issue.nodeId!) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
