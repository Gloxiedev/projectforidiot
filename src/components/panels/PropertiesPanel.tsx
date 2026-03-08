import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store';
import type { FlowNode, StartNodeData, EndNodeData, SelectionNodeData, ButtonNodeData, InformationNodeData, ModalNodeData, SelectionOption, ButtonOption, ModalField, NodeColor } from '../../types';

const PlusIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const XIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CopyIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const LockIcon = ({ locked }: { locked: boolean }) => locked
  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="field-group"><label>{label}</label>{children}</div>;
}
function TInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%' }} />;
}
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }} onClick={() => onChange(!checked)}>
      <div style={{ width: 32, height: 18, borderRadius: 9, background: checked ? 'var(--accent-blue)' : 'var(--bg-hover)', border: '1px solid var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 16 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

const COLOR_PALETTE: { value: NodeColor; hex: string }[] = [
  { value: 'default', hex: '#484f58' }, { value: 'red', hex: '#f85149' },
  { value: 'orange', hex: '#f0883e' }, { value: 'yellow', hex: '#d29922' },
  { value: 'green', hex: '#3fb950' }, { value: 'blue', hex: '#4493f8' },
  { value: 'purple', hex: '#8957e5' }, { value: 'pink', hex: '#e58a8a' },
];

function NodeMetaSection({ nodeId }: { nodeId: string }) {
  const project = useStore(s => s.project);
  const updateNodeMeta = useStore(s => s.updateNodeMeta);
  const setNodeColor = useStore(s => s.setNodeColor);
  const lockNode = useStore(s => s.lockNode);
  const toggleNodeCollapsed = useStore(s => s.toggleNodeCollapsed);
  const duplicateNode = useStore(s => s.duplicateNode);
  const copyNodes = useStore(s => s.copyNodes);
  const getNodePath = useStore(s => s.getNodePath);
  const pushHistory = useStore(s => s.pushHistory);

  const node = project.nodes.find(n => n.id === nodeId)!;
  const meta = (node?.data as any)?.meta || {};
  const path = getNodePath(nodeId);
  const [comment, setComment] = useState(meta.comment || '');
  const [showPath, setShowPath] = useState(false);

  const pathNodes = path.map(id => project.nodes.find(n => n.id === id)).filter(Boolean) as FlowNode[];

  return (
    <div>
      <div className="divider" />
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Node Meta</div>

      {/* Color tag */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginBottom: 6 }}>Color Tag</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {COLOR_PALETTE.map(c => (
            <div key={c.value} onClick={() => setNodeColor(nodeId, c.value)} title={c.value}
              style={{ width: 20, height: 20, borderRadius: '50%', background: c.hex, cursor: 'pointer', border: `2px solid ${meta.color === c.value ? '#fff' : 'transparent'}`, boxShadow: meta.color === c.value ? `0 0 0 2px ${c.hex}` : 'none', transition: 'all 0.15s' }} />
          ))}
        </div>
      </div>

      {/* Comment */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginBottom: 4 }}>Comment / Note</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          onBlur={() => updateNodeMeta(nodeId, { comment })}
          placeholder="Add a note about this node…" rows={2}
          style={{ width: '100%', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: 12 }} />
      </div>

      {/* Actions row */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn" style={{ fontSize: 11, padding: '3px 8px', flex: 1 }}
          onClick={() => { lockNode(nodeId, !meta.locked); }}>
          <LockIcon locked={!!meta.locked} />
          {meta.locked ? 'Unlock' : 'Lock'}
        </button>
        <button className="btn btn-secondary btn" style={{ fontSize: 11, padding: '3px 8px', flex: 1 }}
          onClick={() => { pushHistory('Duplicate'); duplicateNode(nodeId); }}>
          <CopyIcon /> Duplicate
        </button>
        <button className="btn btn-secondary btn" style={{ fontSize: 11, padding: '3px 8px', flex: 1 }}
          onClick={() => copyNodes([nodeId])}>
          Copy
        </button>
      </div>

      {/* Breadcrumb path */}
      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'space-between', fontSize: 11, padding: '4px 6px' }}
        onClick={() => setShowPath(!showPath)}>
        <span>Path from Start ({path.length} steps)</span>
        <span>{showPath ? '▲' : '▼'}</span>
      </button>
      {showPath && (
        <div style={{ marginTop: 6, padding: 8, background: 'var(--bg-overlay)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          {pathNodes.map((n, i) => {
            const d = n.data as any;
            return (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: i < pathNodes.length - 1 ? 4 : 0 }}>
                {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 10, marginLeft: 8 }}>↳</span>}
                <span style={{ fontSize: 10, color: i === pathNodes.length - 1 ? 'var(--accent-blue)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {d.questionKey || d.titleKey || d.label || n.type}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Node-specific editors ────────────────────────────────────────────────────

function StartEditor({ node }: { node: FlowNode }) {
  const update = useStore(s => s.updateNodeData);
  const d = node.data as StartNodeData;
  return <Field label="Label"><TInput value={d.label} onChange={v => update(node.id, { label: v } as any)} placeholder="Start" /></Field>;
}

function EndEditor({ node }: { node: FlowNode }) {
  const update = useStore(s => s.updateNodeData);
  const d = node.data as EndNodeData;
  return <>
    <Field label="Label"><TInput value={d.label} onChange={v => update(node.id, { label: v } as any)} placeholder="End" /></Field>
    <Field label="Trigger Action"><TInput value={d.triggerAction} onChange={v => update(node.id, { triggerAction: v } as any)} placeholder="open_ticket" /></Field>
  </>;
}

function SelectionEditor({ node }: { node: FlowNode }) {
  const update = useStore(s => s.updateNodeData);
  const d = node.data as SelectionNodeData;
  const set = (options: SelectionOption[]) => update(node.id, { options } as any);
  return <>
    <Field label="Question Key"><TInput value={d.questionKey} onChange={v => update(node.id, { questionKey: v } as any)} placeholder="question.key" /></Field>
    <Field label="Description Key"><TInput value={d.descriptionKey || ''} onChange={v => update(node.id, { descriptionKey: v } as any)} placeholder="question.description.key" /></Field>
    <div className="divider" />
    <Toggle checked={!!d.dynamic} onChange={v => update(node.id, { dynamic: v } as any)} label="Dynamic options" />
    {d.dynamic && <>
      <Field label="Dynamic Source"><TInput value={d.dynamicSource || ''} onChange={v => update(node.id, { dynamicSource: v } as any)} placeholder="user.servers" /></Field>
      <Field label="Show Condition"><TInput value={d.dynamicCondition || ''} onChange={v => update(node.id, { dynamicCondition: v } as any)} placeholder="count > 1" /></Field>
    </>}
    <div className="divider" />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <label style={{ margin: 0 }}>Options ({d.options.length})</label>
      <button className="btn btn-secondary btn" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => set([...d.options, { id: uuidv4(), labelKey: '', value: '' }])}><PlusIcon /> Add</button>
    </div>
    {d.options.map((opt, i) => (
      <div key={opt.id} style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>opt {i + 1}</span>
          <button className="btn-icon" onClick={() => set(d.options.filter(o => o.id !== opt.id))}><TrashIcon /></button>
        </div>
        <Field label="Label Key"><TInput value={opt.labelKey} onChange={v => set(d.options.map(o => o.id === opt.id ? { ...o, labelKey: v } : o))} placeholder="option.label.key" /></Field>
        <Field label="Value"><TInput value={opt.value} onChange={v => set(d.options.map(o => o.id === opt.id ? { ...o, value: v } : o))} placeholder="option_value" /></Field>
      </div>
    ))}
    {!d.options.length && <div style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>No options — click Add</div>}
  </>;
}

function ButtonEditor({ node }: { node: FlowNode }) {
  const update = useStore(s => s.updateNodeData);
  const d = node.data as ButtonNodeData;
  const set = (buttons: ButtonOption[]) => update(node.id, { buttons } as any);
  return <>
    <Field label="Question Key"><TInput value={d.questionKey} onChange={v => update(node.id, { questionKey: v } as any)} placeholder="button.question.key" /></Field>
    <Field label="Description Key"><TInput value={d.descriptionKey || ''} onChange={v => update(node.id, { descriptionKey: v } as any)} placeholder="button.desc.key" /></Field>
    <div className="divider" />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <label style={{ margin: 0 }}>Buttons ({d.buttons.length})</label>
      <button className="btn btn-secondary btn" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => set([...d.buttons, { id: uuidv4(), labelKey: '', action: 'next' }])}><PlusIcon /> Add</button>
    </div>
    {d.buttons.map((btn, i) => (
      <div key={btn.id} style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>btn {i + 1}</span>
          <button className="btn-icon" onClick={() => set(d.buttons.filter(b => b.id !== btn.id))}><TrashIcon /></button>
        </div>
        <Field label="Label Key"><TInput value={btn.labelKey} onChange={v => set(d.buttons.map(b => b.id === btn.id ? { ...b, labelKey: v } : b))} placeholder="button.label.key" /></Field>
        <Field label="Action">
          <select value={btn.action} onChange={e => set(d.buttons.map(b => b.id === btn.id ? { ...b, action: e.target.value as any } : b))} style={{ width: '100%' }}>
            <option value="next">→ Next node</option>
            <option value="url">↗ Open URL</option>
          </select>
        </Field>
        {btn.action === 'url' && <Field label="URL"><TInput value={btn.url || ''} onChange={v => set(d.buttons.map(b => b.id === btn.id ? { ...b, url: v } : b))} placeholder="https://..." /></Field>}
      </div>
    ))}
  </>;
}

function InfoEditor({ node }: { node: FlowNode }) {
  const update = useStore(s => s.updateNodeData);
  const d = node.data as InformationNodeData;
  return <>
    <Field label="Title Key"><TInput value={d.titleKey} onChange={v => update(node.id, { titleKey: v } as any)} placeholder="info.title.key" /></Field>
    <Field label="Content Key"><TInput value={d.contentKey} onChange={v => update(node.id, { contentKey: v } as any)} placeholder="info.content.key" /></Field>
    <Field label="Continue Button Key"><TInput value={d.continueButtonKey || ''} onChange={v => update(node.id, { continueButtonKey: v } as any)} placeholder="common.continue" /></Field>
  </>;
}

function ModalEditor({ node }: { node: FlowNode }) {
  const update = useStore(s => s.updateNodeData);
  const d = node.data as ModalNodeData;
  const set = (fields: ModalField[]) => update(node.id, { fields } as any);
  const [regexTest, setRegexTest] = useState<{ fieldId: string; input: string } | null>(null);

  return <>
    <Field label="Question Key"><TInput value={d.questionKey} onChange={v => update(node.id, { questionKey: v } as any)} placeholder="modal.question.key" /></Field>
    <Field label="Description Key"><TInput value={d.descriptionKey || ''} onChange={v => update(node.id, { descriptionKey: v } as any)} placeholder="modal.desc.key" /></Field>
    <Field label="Submit Button Key"><TInput value={d.submitButtonKey || ''} onChange={v => update(node.id, { submitButtonKey: v } as any)} placeholder="common.submit" /></Field>
    <div className="divider" />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <label style={{ margin: 0 }}>Fields ({d.fields.length})</label>
      <button className="btn btn-secondary btn" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => set([...d.fields, { id: uuidv4(), labelKey: '', required: false, validation: 'none' }])}><PlusIcon /> Add</button>
    </div>
    {d.fields.map((field, i) => (
      <div key={field.id} style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>field {i + 1}</span>
          <button className="btn-icon" onClick={() => set(d.fields.filter(f => f.id !== field.id))}><TrashIcon /></button>
        </div>
        <Field label="Label Key"><TInput value={field.labelKey} onChange={v => set(d.fields.map(f => f.id === field.id ? { ...f, labelKey: v } : f))} placeholder="field.label.key" /></Field>
        <Field label="Placeholder"><TInput value={field.placeholder || ''} onChange={v => set(d.fields.map(f => f.id === field.id ? { ...f, placeholder: v } : f))} placeholder="Enter value..." /></Field>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Validation</label>
            <select value={field.validation} onChange={e => set(d.fields.map(f => f.id === field.id ? { ...f, validation: e.target.value as any } : f))} style={{ width: '100%' }}>
              <option value="none">None</option>
              <option value="email">Email</option>
              <option value="url">URL</option>
              <option value="number">Number</option>
              <option value="regex">Regex</option>
            </select>
          </div>
          <div style={{ paddingBottom: 2 }}>
            <Toggle checked={field.required} onChange={v => set(d.fields.map(f => f.id === field.id ? { ...f, required: v } : f))} label="Req" />
          </div>
        </div>
        {field.validation === 'regex' && <>
          <Field label="Pattern">
            <div style={{ display: 'flex', gap: 4 }}>
              <TInput value={field.validationPattern || ''} onChange={v => set(d.fields.map(f => f.id === field.id ? { ...f, validationPattern: v } : f))} placeholder="^[A-Z].*" />
              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 10, flexShrink: 0 }} onClick={() => setRegexTest(t => t?.fieldId === field.id ? null : { fieldId: field.id, input: '' })}>Test</button>
            </div>
          </Field>
          {regexTest?.fieldId === field.id && (
            <div style={{ marginBottom: 8 }}>
              <TInput value={regexTest.input} onChange={v => setRegexTest({ fieldId: field.id, input: v })} placeholder="Test string…" />
              {regexTest.input && (
                <div style={{ marginTop: 4, fontSize: 11, color: (() => { try { return new RegExp(field.validationPattern || '').test(regexTest.input) ? 'var(--accent-green)' : 'var(--accent-red)'; } catch { return 'var(--accent-red)'; } })() }}>
                  {(() => { try { return new RegExp(field.validationPattern || '').test(regexTest.input) ? '✓ Match' : '✗ No match'; } catch { return '✗ Invalid regex'; } })()}
                </div>
              )}
            </div>
          )}
          <Field label="Error Message Key"><TInput value={field.validationMessage || ''} onChange={v => set(d.fields.map(f => f.id === field.id ? { ...f, validationMessage: v } : f))} placeholder="validation.error.key" /></Field>
        </>}
      </div>
    ))}
  </>;
}

// ─── Panel root ───────────────────────────────────────────────────────────────

export default function PropertiesPanel() {
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const nodes = useStore(s => s.project.nodes);
  const deleteNode = useStore(s => s.deleteNode);
  const selectNode = useStore(s => s.selectNode);
  const node = nodes.find(n => n.id === selectedNodeId);

  if (!node) {
    return (
      <div style={{ width: 260, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, color: 'var(--text-muted)', textAlign: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
          <circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
        </svg>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No Selection</div>
          <div style={{ fontSize: 11, lineHeight: 1.6 }}>Click a node to inspect and edit its properties</div>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-in" style={{ width: 260, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-mono)' }}>Properties</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{node.id.substring(0, 16)}…</div>
        </div>
        <button className="btn-icon" onClick={() => selectNode(null)}><XIcon /></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
        {node.type === 'start' && <StartEditor node={node} />}
        {node.type === 'end' && <EndEditor node={node} />}
        {node.type === 'question_selection' && <SelectionEditor node={node} />}
        {node.type === 'question_button' && <ButtonEditor node={node} />}
        {node.type === 'question_information' && <InfoEditor node={node} />}
        {node.type === 'question_modal' && <ModalEditor node={node} />}
        <NodeMetaSection nodeId={node.id} />
      </div>

      {node.type !== 'start' && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={() => deleteNode(node.id)}>
            <TrashIcon /> Delete Node
          </button>
        </div>
      )}
    </div>
  );
}
