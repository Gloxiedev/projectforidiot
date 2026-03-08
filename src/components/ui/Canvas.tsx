import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background, BackgroundVariant, Controls, MiniMap, Connection, Edge, Node,
  NodeChange, EdgeChange, useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useStore } from '../../store';
import { StartNode, EndNode } from '../nodes/TerminalNodes';
import { SelectionNode, ButtonNode, InformationNode, ModalNode } from '../nodes/QuestionNodes';
import ContextMenu from './ContextMenu';
import type { FlowEdge, FlowNodeData, NodeKind } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = {
  start: StartNode, end: EndNode,
  question_selection: SelectionNode, question_button: ButtonNode,
  question_information: InformationNode, question_modal: ModalNode,
};

const DEFAULT_NODE_DATA: Record<string, { type: NodeKind; data: FlowNodeData }> = {
  '1': { type: 'question_selection', data: { kind: 'question_selection', questionKey: '', options: [] } },
  '2': { type: 'question_button', data: { kind: 'question_button', questionKey: '', buttons: [] } },
  '3': { type: 'question_information', data: { kind: 'question_information', titleKey: '', contentKey: '' } },
  '4': { type: 'question_modal', data: { kind: 'question_modal', questionKey: '', fields: [] } },
  '5': { type: 'end', data: { kind: 'end', label: 'End', triggerAction: 'open_ticket' } },
};

function CanvasInner() {
  const project = useStore(s => s.project);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const highlightedNodeIds = useStore(s => s.highlightedNodeIds);
  const snapToGrid = useStore(s => s.snapToGrid);
  const showMinimap = useStore(s => s.showMinimap);
  const backgroundStyle = useStore(s => s.backgroundStyle);
  const validationIssues = useStore(s => s.validationIssues);

  const selectNode = useStore(s => s.selectNode);
  const selectEdge = useStore(s => s.selectEdge);
  const addEdgeToStore = useStore(s => s.addEdge);
  const deleteNode = useStore(s => s.deleteNode);
  const deleteEdge = useStore(s => s.deleteEdge);
  const updateNodePosition = useStore(s => s.updateNodePosition);
  const runValidation = useStore(s => s.runValidation);
  const setZoomLevel = useStore(s => s.setZoomLevel);
  const duplicateNode = useStore(s => s.duplicateNode);
  const copyNodes = useStore(s => s.copyNodes);
  const pasteNodes = useStore(s => s.pasteNodes);
  const addNode = useStore(s => s.addNode);
  const pushHistory = useStore(s => s.pushHistory);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string; canvasPos?: { x: number; y: number } } | null>(null);

  const { screenToFlowPosition, fitView } = useReactFlow();

  const nodeErrors = new Set(validationIssues.filter(i => i.nodeId && i.severity === 'error').map(i => i.nodeId!));
  const nodeWarnings = new Set(validationIssues.filter(i => i.nodeId && i.severity === 'warning').map(i => i.nodeId!));

  const rfNodes: Node[] = project.nodes.map(n => ({
    id: n.id, type: n.type, position: n.position,
    data: n.data, selected: n.id === selectedNodeId,
    style: {
      opacity: highlightedNodeIds.length > 0 && !highlightedNodeIds.includes(n.id) ? 0.3 : 1,
      outline: nodeErrors.has(n.id) ? '2px solid var(--accent-red)' : nodeWarnings.has(n.id) ? '2px solid var(--accent-yellow)' : undefined,
      outlineOffset: nodeErrors.has(n.id) || nodeWarnings.has(n.id) ? '3px' : undefined,
      borderRadius: 8,
    },
  }));

  const rfEdges: Edge[] = project.edges.map(e => ({
    id: e.id, source: e.source, sourceHandle: e.sourceHandle, target: e.target, targetHandle: e.targetHandle,
    label: e.label, animated: e.animated,
    style: { stroke: 'var(--border)', strokeWidth: 2 },
    labelStyle: { fill: 'var(--text-secondary)', fontSize: 11 },
    labelBgStyle: { fill: 'var(--bg-elevated)', fillOpacity: 0.9 },
    type: 'smoothstep',
  }));

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    for (const change of changes) {
      if (change.type === 'position' && change.position && !change.dragging) updateNodePosition(change.id, change.position);
      if (change.type === 'remove') deleteNode(change.id);
      if (change.type === 'select' && change.selected) selectNode(change.id);
    }
  }, [updateNodePosition, deleteNode, selectNode]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    for (const change of changes) {
      if (change.type === 'remove') deleteEdge(change.id);
      if (change.type === 'select' && change.selected) selectEdge(change.id);
    }
  }, [deleteEdge, selectEdge]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target || !connection.sourceHandle) return;
    addEdgeToStore({ id: uuidv4(), source: connection.source, sourceHandle: connection.sourceHandle, target: connection.target, targetHandle: connection.targetHandle || 'input' });
    setTimeout(runValidation, 50);
  }, [addEdgeToStore, runValidation]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => { selectNode(node.id); }, [selectNode]);
  const onPaneClick = useCallback(() => { selectNode(null); selectEdge(null); setContextMenu(null); }, [selectNode, selectEdge]);
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => { selectEdge(edge.id); }, [selectEdge]);

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
  }, []);

  const onPaneContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const canvasPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setContextMenu({ x: e.clientX, y: e.clientY, canvasPos });
  }, [screenToFlowPosition]);

  const onMoveEnd = useCallback((_: any, viewport: any) => { setZoomLevel(viewport.zoom); }, [setZoomLevel]);

  // Keyboard shortcuts on canvas
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      const ctrl = e.ctrlKey || e.metaKey;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) deleteNode(selectedNodeId);
      if (ctrl && e.key === 'd' && selectedNodeId) { e.preventDefault(); pushHistory('Duplicate Node'); duplicateNode(selectedNodeId); }
      if (ctrl && e.key === 'c' && selectedNodeId) { e.preventDefault(); copyNodes([selectedNodeId]); }
      if (ctrl && e.key === 'v') { e.preventDefault(); pasteNodes(); }
      if (ctrl && e.shiftKey && e.key === 'F') { e.preventDefault(); fitView({ padding: 0.2 }); }
      if (e.key === 'Escape') { selectNode(null); selectEdge(null); setContextMenu(null); }

      // Quick-add nodes via number keys
      if (!ctrl && DEFAULT_NODE_DATA[e.key]) {
        const def = DEFAULT_NODE_DATA[e.key];
        const id = `${def.type}-${uuidv4().substring(0, 8)}`;
        addNode({ id, type: def.type, position: { x: 200 + Math.random() * 300, y: 200 + Math.random() * 200 }, data: def.data });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, deleteNode, duplicateNode, copyNodes, pasteNodes, selectNode, selectEdge, addNode, fitView, pushHistory]);

  const bgVariant = backgroundStyle === 'dots' ? BackgroundVariant.Dots
    : backgroundStyle === 'lines' ? BackgroundVariant.Lines
    : backgroundStyle === 'cross' ? BackgroundVariant.Cross
    : undefined;

  return (
    <div style={{ flex: 1, position: 'relative' }} onContextMenu={e => e.preventDefault()}>
      <ReactFlow
        nodes={rfNodes} edges={rfEdges} nodeTypes={nodeTypes}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onNodeClick={onNodeClick}
        onPaneClick={onPaneClick} onEdgeClick={onEdgeClick}
        onNodeContextMenu={onNodeContextMenu} onPaneContextMenu={onPaneContextMenu}
        onMoveEnd={onMoveEnd}
        fitView fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ style: { stroke: '#30363d', strokeWidth: 2 }, type: 'smoothstep' }}
        connectionLineStyle={{ stroke: 'var(--accent-blue)', strokeWidth: 2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1} maxZoom={2.5}
        snapToGrid={snapToGrid} snapGrid={[8, 8]}
        deleteKeyCode={null}
      >
        {backgroundStyle !== 'none' && bgVariant && (
          <Background variant={bgVariant} gap={20} size={backgroundStyle === 'dots' ? 1 : 1} color="#21262d" />
        )}
        <Controls style={{ bottom: 28, left: 16 }} />
        {showMinimap && (
          <MiniMap style={{ bottom: 28, right: 16 }}
            nodeColor={n => ({ start: '#3fb950', end: '#f85149', question_selection: '#4493f8', question_button: '#8957e5', question_information: '#d29922', question_modal: '#39c5cf' })[n.type as string] || '#484f58'}
            maskColor="rgba(0,0,0,0.5)" />
        )}
      </ReactFlow>

      {project.nodes.length <= 1 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 5 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" style={{ margin: '0 auto 12px', display: 'block' }}>
            <circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/>
            <line x1="7" y1="12" x2="17" y2="6"/><line x1="7" y1="12" x2="17" y2="18"/>
          </svg>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>Canvas is empty</div>
          <div style={{ fontSize: 11, lineHeight: 1.7 }}>
            Click nodes in the Library panel to add them<br />
            Press 1–5 for quick-add · Right-click for menu
          </div>
        </div>
      )}

      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} nodeId={contextMenu.nodeId} canvasPos={contextMenu.canvasPos} onClose={() => setContextMenu(null)} />
      )}
    </div>
  );
}

export default function Canvas() {
  return <CanvasInner />;
}
