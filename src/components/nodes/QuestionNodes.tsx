import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import NodeShell from './NodeShell';
import type {
  SelectionNodeData,
  ButtonNodeData,
  InformationNodeData,
  ModalNodeData,
} from '../../types';

// ─── Icons ─────────────────────────────────────────────────────────────────

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);

const ButtonsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="2" y="7" width="20" height="10" rx="3"/>
    <line x1="12" y1="11" x2="12" y2="13"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8" strokeLinecap="round" strokeWidth="3"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
  </svg>
);

const ModalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="13" y2="17"/>
  </svg>
);

// ─── Option chip (shows a labeled source handle) ────────────────────────────

function OptionRow({ id, label, color, isLast }: {
  id: string;
  label: string;
  color: string;
  isLast: boolean;
}) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '5px 8px 5px 10px',
      background: 'var(--bg-overlay)',
      borderRadius: 'var(--radius-sm)',
      marginBottom: isLast ? 0 : 4,
      border: '1px solid var(--border-subtle)',
    }}>
      <span style={{
        fontSize: 11,
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginRight: 16,
      }}>
        {label || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>unlabeled</span>}
      </span>
      <Handle
        type="source"
        position={Position.Right}
        id={id}
        style={{
          position: 'relative',
          transform: 'none',
          right: 'auto',
          top: 'auto',
          background: color,
          width: 8,
          height: 8,
          flexShrink: 0,
        }}
      />
    </div>
  );
}

// ─── Selection Node ─────────────────────────────────────────────────────────

export function SelectionNode({ data, selected }: NodeProps<SelectionNodeData>) {
  return (
    <NodeShell
      kind="question_selection"
      title={data.questionKey || 'Selection Question'}
      icon={<ListIcon />}
      color="var(--node-selection)"
      selected={selected}
      hasInput
      hasOutput={false}
    >
      {data.dynamic && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 6,
          padding: '3px 8px',
          background: 'rgba(68,147,248,0.08)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(68,147,248,0.2)',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          <span style={{ fontSize: 10, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
            dynamic: {data.dynamicSource || 'unknown'}
          </span>
        </div>
      )}
      {data.options.length > 0 ? (
        data.options.map((opt, i) => (
          <OptionRow
            key={opt.id}
            id={opt.id}
            label={opt.labelKey || opt.value}
            color="var(--node-selection)"
            isLast={i === data.options.length - 1}
          />
        ))
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic', textAlign: 'center', padding: '4px 0' }}>
          No options — click to edit
        </div>
      )}
    </NodeShell>
  );
}

// ─── Button Node ────────────────────────────────────────────────────────────

export function ButtonNode({ data, selected }: NodeProps<ButtonNodeData>) {
  return (
    <NodeShell
      kind="question_button"
      title={data.questionKey || 'Button Question'}
      icon={<ButtonsIcon />}
      color="var(--node-button)"
      selected={selected}
      hasInput
      hasOutput={false}
    >
      {data.buttons.length > 0 ? (
        data.buttons.map((btn, i) => (
          <div
            key={btn.id}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '5px 8px 5px 10px',
              background: 'var(--bg-overlay)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: i === data.buttons.length - 1 ? 0 : 4,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', marginRight: 16 }}>
              {btn.action === 'url' ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-yellow)" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15,3 21,3 21,9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--node-button)" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12,5 19,12 12,19"/>
                </svg>
              )}
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {btn.labelKey || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>unlabeled</span>}
              </span>
            </div>
            {btn.action === 'next' && (
              <Handle
                type="source"
                position={Position.Right}
                id={btn.id}
                style={{
                  position: 'relative',
                  transform: 'none',
                  right: 'auto',
                  top: 'auto',
                  background: 'var(--node-button)',
                  width: 8,
                  height: 8,
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        ))
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic', textAlign: 'center', padding: '4px 0' }}>
          No buttons — click to edit
        </div>
      )}
    </NodeShell>
  );
}

// ─── Information Node ───────────────────────────────────────────────────────

export function InformationNode({ data, selected }: NodeProps<InformationNodeData>) {
  return (
    <NodeShell
      kind="question_information"
      title={data.titleKey || 'Information'}
      icon={<InfoIcon />}
      color="var(--node-info)"
      selected={selected}
      hasInput
      hasOutput
      outputHandleId="output"
    >
      {data.contentKey && (
        <div style={{
          fontSize: 11,
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          padding: '4px 8px',
          background: 'var(--bg-overlay)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 4,
        }}>
          <span style={{ color: 'var(--text-muted)' }}>content:</span> {data.contentKey}
        </div>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11,
        color: 'var(--text-muted)',
      }}>
        <span>→ continue button</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
          {data.continueButtonKey || 'common.continue'}
        </span>
      </div>
    </NodeShell>
  );
}

// ─── Modal Node ─────────────────────────────────────────────────────────────

export function ModalNode({ data, selected }: NodeProps<ModalNodeData>) {
  return (
    <NodeShell
      kind="question_modal"
      title={data.questionKey || 'Modal Question'}
      icon={<ModalIcon />}
      color="var(--node-modal)"
      selected={selected}
      hasInput
      hasOutput
      outputHandleId="output"
    >
      {data.fields.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {data.fields.map((field) => (
            <div
              key={field.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 8px',
                background: 'var(--bg-overlay)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--node-modal)" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {field.labelKey || field.id}
              </span>
              {field.required && (
                <span style={{ fontSize: 9, color: 'var(--accent-red)', fontWeight: 700 }}>REQ</span>
              )}
              {field.validation !== 'none' && (
                <span style={{ fontSize: 9, color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)' }}>
                  {field.validation}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic', textAlign: 'center', padding: '4px 0' }}>
          No fields — click to edit
        </div>
      )}
    </NodeShell>
  );
}
