import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeKind } from '../../types';

interface NodeShellProps {
  kind: NodeKind;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  selected?: boolean;
  hasInput?: boolean;
  hasOutput?: boolean;
  outputHandleId?: string;
  children?: React.ReactNode;
  validationError?: boolean;
}

const KIND_LABELS: Record<NodeKind, string> = {
  start: 'START',
  end: 'END',
  question_selection: 'SELECTION',
  question_button: 'BUTTON',
  question_information: 'INFORMATION',
  question_modal: 'MODAL',
};

export default function NodeShell({
  kind,
  title,
  subtitle,
  icon,
  color,
  selected,
  hasInput = true,
  hasOutput = false,
  outputHandleId = 'output',
  children,
  validationError,
}: NodeShellProps) {
  return (
    <div
      style={{
        minWidth: 220,
        maxWidth: 280,
        background: 'var(--bg-elevated)',
        border: `1px solid ${selected ? color : validationError ? 'var(--accent-red)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: selected
          ? `0 0 0 2px ${color}40, var(--shadow-md)`
          : 'var(--shadow-sm)',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Input handle */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Top}
          id="input"
          style={{ background: color, top: -5 }}
        />
      )}

      {/* Header */}
      <div
        style={{
          background: `${color}18`,
          borderBottom: `1px solid ${color}30`,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            background: `${color}25`,
            border: `1px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1,
              marginBottom: 2,
            }}
          >
            {KIND_LABELS[kind]}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Untitled</span>}
          </div>
        </div>
        {validationError && (
          <div
            title="Has validation errors"
            style={{
              marginLeft: 'auto',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent-red)',
              flexShrink: 0,
              animation: 'pulse 2s infinite',
            }}
          />
        )}
      </div>

      {/* Body */}
      {children && (
        <div style={{ padding: '8px 12px' }}>
          {children}
        </div>
      )}

      {/* Single output handle */}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          id={outputHandleId}
          style={{ background: color, bottom: -5 }}
        />
      )}
    </div>
  );
}
