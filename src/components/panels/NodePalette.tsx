import React from 'react';
import { useStore } from '../../store';
import type { NodeKind, FlowNodeData } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface NodeTemplate {
  kind: NodeKind;
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  defaultData: FlowNodeData;
}

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
);
const FlagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);
const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);
const ButtonsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="2" y="7" width="20" height="10" rx="3"/>
    <line x1="12" y1="11" x2="12" y2="13"/><line x1="9" y1="12" x2="15" y2="12"/>
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
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>
  </svg>
);

const NODE_TEMPLATES: NodeTemplate[] = [
  {
    kind: 'start',
    label: 'Start',
    description: 'Entry point of the flow',
    color: 'var(--node-start)',
    icon: <PlayIcon />,
    defaultData: { kind: 'start', label: 'Start' },
  },
  {
    kind: 'end',
    label: 'End',
    description: 'Terminal node, opens ticket',
    color: 'var(--node-end)',
    icon: <FlagIcon />,
    defaultData: { kind: 'end', label: 'End', triggerAction: 'open_ticket' },
  },
  {
    kind: 'question_selection',
    label: 'Selection',
    description: 'Dropdown / list of options',
    color: 'var(--node-selection)',
    icon: <ListIcon />,
    defaultData: { kind: 'question_selection', questionKey: '', options: [] },
  },
  {
    kind: 'question_button',
    label: 'Button',
    description: 'Clickable button choices',
    color: 'var(--node-button)',
    icon: <ButtonsIcon />,
    defaultData: { kind: 'question_button', questionKey: '', buttons: [] },
  },
  {
    kind: 'question_information',
    label: 'Information',
    description: 'Display text, then continue',
    color: 'var(--node-info)',
    icon: <InfoIcon />,
    defaultData: { kind: 'question_information', titleKey: '', contentKey: '', continueButtonKey: 'common.continue' },
  },
  {
    kind: 'question_modal',
    label: 'Modal',
    description: 'Pop-up form with validation',
    color: 'var(--node-modal)',
    icon: <ModalIcon />,
    defaultData: { kind: 'question_modal', questionKey: '', fields: [], submitButtonKey: 'common.submit' },
  },
];

export default function NodePalette() {
  const addNode = useStore((s) => s.addNode);

  const handleAdd = (template: NodeTemplate) => {
    // Place new nodes in a sensible area of the canvas
    const id = `${template.kind}-${uuidv4().substring(0, 8)}`;
    addNode({
      id,
      type: template.kind,
      position: {
        x: 100 + Math.random() * 200,
        y: 200 + Math.random() * 200,
      },
      data: { ...template.defaultData },
    });
  };

  return (
    <div style={{
      width: 200,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-mono)' }}>
          Node Library
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
          Click to add to canvas
        </div>
      </div>

      {/* Node list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 10px' }}>
        {NODE_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.kind}
            onClick={() => handleAdd(tmpl)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              width: '100%',
              padding: '9px 10px',
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              textAlign: 'left',
              marginBottom: 3,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.borderColor = tmpl.color + '40';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 'var(--radius-sm)',
              background: tmpl.color + '18',
              border: `1px solid ${tmpl.color}35`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tmpl.color,
              flexShrink: 0,
            }}>
              {tmpl.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 2 }}>
                {tmpl.label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {tmpl.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: 9 }}>Tips</div>
          <div>• Drag canvas to pan</div>
          <div>• Scroll to zoom</div>
          <div>• Drag handle → handle to connect</div>
          <div>• Click node to edit</div>
          <div>• Del key removes selected</div>
        </div>
      </div>
    </div>
  );
}
