import React from 'react';
import { useStore } from '../../store';
import type { SelectionNodeData, ButtonNodeData, InformationNodeData, ModalNodeData, EndNodeData } from '../../types';

const XIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const BackIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>;
const PlayIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>;
const StopIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>;

export default function SimulatorPanel() {
  const project = useStore(s => s.project);
  const simulator = useStore(s => s.simulator);
  const stopSimulator = useStore(s => s.stopSimulator);
  const startSimulator = useStore(s => s.startSimulator);
  const simulatorChoose = useStore(s => s.simulatorChoose);
  const simulatorBack = useStore(s => s.simulatorBack);
  const setShowSimulator = useStore(s => s.setShowSimulator);

  const currentNode = project.nodes.find(n => n.id === simulator.currentNodeId);
  const getLocaleText = (key: string) => {
    const en = project.locales.find(l => l.code === 'en');
    return (en?.entries[key] || key) || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{key}</span>;
  };

  const stepNumber = simulator.history.length;
  const isEnd = currentNode?.type === 'end';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 120,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && setShowSimulator(false)}>
      <div className="fade-in" style={{
        width: 480, maxHeight: '80vh', background: 'var(--bg-surface)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse 2s infinite' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Flow Simulator</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Step {stepNumber} of your flow</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary btn" style={{ fontSize: 11, padding: '3px 10px' }} onClick={startSimulator}>
              <PlayIcon /> Restart
            </button>
            <button className="btn-icon" onClick={() => setShowSimulator(false)}><XIcon /></button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '8px 20px',
          borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto', flexShrink: 0,
        }}>
          {simulator.history.map((id, i) => {
            const n = project.nodes.find(nn => nn.id === id);
            const isActive = i === simulator.history.length - 1;
            return (
              <React.Fragment key={id}>
                {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>›</span>}
                <span style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                }}>
                  {(n?.data as any)?.questionKey || (n?.data as any)?.titleKey || (n?.data as any)?.label || n?.type}
                </span>
              </React.Fragment>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px 16px' }}>
          {!simulator.active ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              <PlayIcon />
              <div style={{ marginTop: 12, fontSize: 13 }}>Click Start to simulate the flow</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={startSimulator}>
                <PlayIcon /> Start Simulation
              </button>
            </div>
          ) : !currentNode ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              <div style={{ fontSize: 13 }}>No node found. The flow may be disconnected.</div>
            </div>
          ) : isEnd ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'rgba(63,185,80,0.15)',
                border: '2px solid var(--accent-green)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent-green)', marginBottom: 6 }}>Flow Complete!</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Trigger: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-base)', padding: '1px 6px', borderRadius: 3 }}>
                  {(currentNode.data as EndNodeData).triggerAction}
                </code>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Traversed {stepNumber} node{stepNumber !== 1 ? 's' : ''}
              </div>
              {Object.keys(simulator.answers).length > 0 && (
                <div style={{ marginTop: 16, textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Collected Answers</div>
                  {Object.entries(simulator.answers).map(([nodeId, val]) => {
                    const n = project.nodes.find(nn => nn.id === nodeId);
                    return (
                      <div key={nodeId} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 12 }}>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{(n?.data as any)?.questionKey || nodeId.substring(0, 12)}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{val}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <button className="btn btn-secondary btn" style={{ marginTop: 16 }} onClick={startSimulator}>
                <PlayIcon /> Restart
              </button>
            </div>
          ) : currentNode.type === 'question_information' ? (
            <InfoStep node={currentNode} getLocaleText={getLocaleText} onContinue={() => {
              const edge = project.edges.find(e => e.source === currentNode.id);
              if (edge) simulatorChoose('output', 'continue');
            }} />
          ) : currentNode.type === 'question_selection' ? (
            <SelectionStep node={currentNode} getLocaleText={getLocaleText} onChoose={simulatorChoose} />
          ) : currentNode.type === 'question_button' ? (
            <ButtonStep node={currentNode} getLocaleText={getLocaleText} onChoose={simulatorChoose} edges={project.edges} />
          ) : currentNode.type === 'question_modal' ? (
            <ModalStep node={currentNode} getLocaleText={getLocaleText} onSubmit={() => {
              simulatorChoose('output', 'submitted');
            }} />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unknown node type: {currentNode.type}</div>
          )}
        </div>

        {/* Footer */}
        {simulator.active && simulator.history.length > 1 && !isEnd && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <button className="btn btn-ghost" onClick={simulatorBack} style={{ fontSize: 11 }}>
              <BackIcon /> Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoStep({ node, getLocaleText, onContinue }: any) {
  const data = node.data as InformationNodeData;
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 12 }}>
        {getLocaleText(data.titleKey)}
      </div>
      <div style={{
        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
        background: 'var(--bg-overlay)', padding: 14, borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)', marginBottom: 20,
      }}>
        {getLocaleText(data.contentKey)}
      </div>
      <button className="btn btn-primary" onClick={onContinue} style={{ width: '100%', justifyContent: 'center' }}>
        {getLocaleText(data.continueButtonKey || 'common.continue')}
      </button>
    </div>
  );
}

function SelectionStep({ node, getLocaleText, onChoose }: any) {
  const data = node.data as SelectionNodeData;
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{getLocaleText(data.questionKey)}</div>
      {data.descriptionKey && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>{getLocaleText(data.descriptionKey)}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.options.map((opt: any) => (
          <button key={opt.id} onClick={() => onChoose(opt.id, opt.value)} style={{
            padding: '10px 14px', background: 'var(--bg-overlay)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left', fontSize: 13,
            color: 'var(--text-primary)', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-overlay)'; }}
          >
            {getLocaleText(opt.labelKey) || opt.value}
          </button>
        ))}
        {data.options.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>No options defined</div>}
      </div>
    </div>
  );
}

function ButtonStep({ node, getLocaleText, onChoose, edges }: any) {
  const data = node.data as ButtonNodeData;
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{getLocaleText(data.questionKey)}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {data.buttons.map((btn: any) => (
          <button key={btn.id}
            onClick={() => btn.action === 'url' ? window.open(btn.url, '_blank') : onChoose(btn.id, btn.labelKey)}
            style={{
              padding: '8px 16px', background: 'var(--bg-overlay)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13,
              color: btn.action === 'url' ? 'var(--accent-yellow)' : 'var(--text-primary)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-overlay)'; }}
          >
            {btn.action === 'url' && '↗ '}{getLocaleText(btn.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ModalStep({ node, getLocaleText, onSubmit }: any) {
  const data = node.data as ModalNodeData;
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{getLocaleText(data.questionKey)}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {data.fields.map((field: any) => (
          <div key={field.id} className="field-group" style={{ margin: 0 }}>
            <label style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12, fontWeight: 600 }}>
              {getLocaleText(field.labelKey)}
              {field.required && <span style={{ color: 'var(--accent-red)', marginLeft: 3 }}>*</span>}
            </label>
            <input type="text" placeholder={field.placeholder || ''} style={{ width: '100%' }} />
            {field.validation !== 'none' && (
              <div style={{ fontSize: 10, color: 'var(--accent-teal)' }}>Validates as: {field.validation}</div>
            )}
          </div>
        ))}
        {data.fields.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>No fields defined</div>}
      </div>
      <button className="btn btn-primary" onClick={onSubmit} style={{ width: '100%', justifyContent: 'center' }}>
        {getLocaleText(data.submitButtonKey || 'common.submit')}
      </button>
    </div>
  );
}
