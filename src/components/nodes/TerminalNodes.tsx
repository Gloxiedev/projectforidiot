import React from 'react';
import { NodeProps } from 'reactflow';
import NodeShell from './NodeShell';
import type { StartNodeData, EndNodeData } from '../../types';

// ── Play icon
const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

// ── Flag icon
const FlagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

export function StartNode({ data, selected }: NodeProps<StartNodeData>) {
  return (
    <NodeShell
      kind="start"
      title={data.label || 'Start'}
      icon={<PlayIcon />}
      color="var(--node-start)"
      selected={selected}
      hasInput={false}
      hasOutput={true}
    />
  );
}

export function EndNode({ data, selected }: NodeProps<EndNodeData>) {
  return (
    <NodeShell
      kind="end"
      title={data.label || 'End'}
      icon={<FlagIcon />}
      color="var(--node-end)"
      selected={selected}
      hasInput={true}
      hasOutput={false}
    >
      {data.triggerAction && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          background: 'rgba(248,81,73,0.08)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(248,81,73,0.2)',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {data.triggerAction}
          </span>
        </div>
      )}
    </NodeShell>
  );
}
