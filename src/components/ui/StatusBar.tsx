import React from 'react';
import { useStore } from '../../store';

export default function StatusBar() {
  const project = useStore(s => s.project);
  const zoomLevel = useStore(s => s.zoomLevel);
  const isDirty = useStore(s => s.isDirty);
  const validationIssues = useStore(s => s.validationIssues);
  const snapToGrid = useStore(s => s.snapToGrid);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const selectedNode = project.nodes.find(n => n.id === selectedNodeId);

  const errors = validationIssues.filter(i => i.severity === 'error').length;
  const warnings = validationIssues.filter(i => i.severity === 'warning').length;

  return (
    <div style={{
      height: 24, background: 'var(--bg-surface)', borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', paddingInline: 12, gap: 16,
      fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, userSelect: 'none',
    }}>
      {/* Left */}
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDirty ? 'var(--accent-yellow)' : 'var(--accent-green)', display: 'inline-block' }} />
        {isDirty ? 'Unsaved changes' : 'Saved'}
      </span>
      <span>Nodes: <strong style={{ color: 'var(--text-secondary)' }}>{project.nodes.length}</strong></span>
      <span>Edges: <strong style={{ color: 'var(--text-secondary)' }}>{project.edges.length}</strong></span>
      <span>Locales: <strong style={{ color: 'var(--text-secondary)' }}>{project.locales.length}</strong></span>

      {/* Validation summary */}
      {errors > 0 && (
        <span style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/></svg>
          {errors} error{errors !== 1 ? 's' : ''}
        </span>
      )}
      {warnings > 0 && (
        <span style={{ color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: 3 }}>
          ⚠ {warnings} warning{warnings !== 1 ? 's' : ''}
        </span>
      )}
      {errors === 0 && warnings === 0 && (
        <span style={{ color: 'var(--accent-green)' }}>✓ Valid</span>
      )}

      {/* Selected node info */}
      {selectedNode && (
        <span style={{ color: 'var(--accent-blue)' }}>
          Selected: <strong>{selectedNode.type}</strong>
          {(selectedNode.data as any).meta?.locked && ' 🔒'}
        </span>
      )}

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
        {snapToGrid && <span>Grid: 8px</span>}
        <span>Zoom: <strong style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{Math.round(zoomLevel * 100)}%</strong></span>
        <span style={{ color: 'var(--text-muted)' }}>FlowForge v2.0</span>
      </div>
    </div>
  );
}
