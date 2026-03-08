import React, { useEffect } from 'react';
import { useStore } from '../../store';
import { v4 as uuidv4 } from 'uuid';
import type { NodeKind, FlowNodeData } from '../../types';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId?: string;
  canvasPos?: { x: number; y: number };
  onClose: () => void;
}

const nodeDefaults: Record<string, { type: NodeKind; data: FlowNodeData }> = {
  'Selection': { type: 'question_selection', data: { kind: 'question_selection', questionKey: '', options: [] } },
  'Button': { type: 'question_button', data: { kind: 'question_button', questionKey: '', buttons: [] } },
  'Information': { type: 'question_information', data: { kind: 'question_information', titleKey: '', contentKey: '' } },
  'Modal': { type: 'question_modal', data: { kind: 'question_modal', questionKey: '', fields: [] } },
  'End': { type: 'end', data: { kind: 'end', label: 'End', triggerAction: 'open_ticket' } },
};

function MenuItem({ label, onClick, danger, shortcut, disabled }: {
  label: string; onClick: () => void; danger?: boolean; shortcut?: string; disabled?: boolean;
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--text-muted)' : danger ? 'var(--accent-red)' : 'var(--text-primary)',
        transition: 'background 0.1s', gap: 20,
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span>{label}</span>
      {shortcut && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{shortcut}</span>}
    </div>
  );
}

function Separator() {
  return <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />;
}

export default function ContextMenu({ x, y, nodeId, canvasPos, onClose }: ContextMenuProps) {
  const addNode = useStore(s => s.addNode);
  const duplicateNode = useStore(s => s.duplicateNode);
  const deleteNode = useStore(s => s.deleteNode);
  const copyNodes = useStore(s => s.copyNodes);
  const pasteNodes = useStore(s => s.pasteNodes);
  const clipboard = useStore(s => s.clipboard);
  const autoLayout = useStore(s => s.autoLayout);
  const deleteOrphanNodes = useStore(s => s.deleteOrphanNodes);
  const runValidation = useStore(s => s.runValidation);
  const lockNode = useStore(s => s.lockNode);
  const toggleNodeCollapsed = useStore(s => s.toggleNodeCollapsed);
  const project = useStore(s => s.project);

  const selectedNode = nodeId ? project.nodes.find(n => n.id === nodeId) : null;
  const isLocked = !!(selectedNode?.data as any)?.meta?.locked;
  const isCollapsed = !!(selectedNode?.data as any)?.meta?.collapsed;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleAddNode = (label: string) => {
    const def = nodeDefaults[label];
    if (!def || !canvasPos) return;
    const id = `${def.type}-${uuidv4().substring(0, 8)}`;
    addNode({ id, type: def.type, position: canvasPos, data: def.data });
    onClose();
  };

  // Clamp to viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 300);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }} onClick={onClose} onContextMenu={e => { e.preventDefault(); onClose(); }}>
      <div
        style={{
          position: 'absolute', left: adjustedX, top: adjustedY,
          width: 190, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden', padding: '4px 0',
        }}
        onClick={e => e.stopPropagation()}
      >
        {nodeId ? (
          <>
            <div style={{ padding: '4px 14px 6px', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Node Actions
            </div>
            <MenuItem label="Duplicate" shortcut="Ctrl+D" onClick={() => { duplicateNode(nodeId); onClose(); }} />
            <MenuItem label="Copy" shortcut="Ctrl+C" onClick={() => { copyNodes([nodeId]); onClose(); }} />
            <MenuItem label={isCollapsed ? 'Expand' : 'Collapse'} onClick={() => { toggleNodeCollapsed(nodeId); onClose(); }} />
            <MenuItem label={isLocked ? 'Unlock' : 'Lock Position'} onClick={() => { lockNode(nodeId, !isLocked); onClose(); }} />
            <Separator />
            <MenuItem label="Delete Node" danger onClick={() => { deleteNode(nodeId); onClose(); }} shortcut="Del" />
          </>
        ) : (
          <>
            <div style={{ padding: '4px 14px 6px', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Add Node
            </div>
            {Object.keys(nodeDefaults).map(label => (
              <MenuItem key={label} label={`+ ${label}`} onClick={() => handleAddNode(label)} />
            ))}
            <Separator />
            <MenuItem label="Paste" shortcut="Ctrl+V" onClick={() => { pasteNodes(); onClose(); }} disabled={clipboard.length === 0} />
            <MenuItem label="Auto Layout" shortcut="Ctrl+L" onClick={() => { autoLayout(); onClose(); }} />
            <MenuItem label="Remove Orphans" danger onClick={() => { deleteOrphanNodes(); runValidation(); onClose(); }} />
          </>
        )}
      </div>
    </div>
  );
}
