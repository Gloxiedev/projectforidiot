import React, { useState } from 'react';
import { useStore } from '../../store';
import { exportAsZip, saveProjectFile, buildFlowJSON } from '../../utils/export';

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function ExportModal() {
  const project = useStore((s) => s.project);
  const issues = useStore((s) => s.validationIssues);
  const setShowExportModal = useStore((s) => s.setShowExportModal);
  const runValidation = useStore((s) => s.runValidation);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<'export' | 'preview'>('export');

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  const handleExportZip = async () => {
    setExporting(true);
    try {
      await exportAsZip(project);
    } finally {
      setExporting(false);
    }
  };

  const handleSaveProject = () => {
    saveProjectFile(project);
  };

  const preview = JSON.stringify(buildFlowJSON(project), null, 2);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && setShowExportModal(false)}
    >
      <div
        className="fade-in"
        style={{
          width: 560,
          maxHeight: '80vh',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Export Flow</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {project.nodes.length} nodes · {project.edges.length} connections · {project.locales.length} languages
            </div>
          </div>
          <button className="btn-icon" onClick={() => setShowExportModal(false)}><XIcon /></button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          padding: '0 12px',
          flexShrink: 0,
        }}>
          {(['export', 'preview'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: tab === t ? '2px solid var(--accent-blue)' : '2px solid transparent',
                color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: tab === t ? 600 : 400,
                textTransform: 'capitalize',
              }}
            >
              {t === 'export' ? '📦 Export' : '👁 JSON Preview'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {tab === 'export' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Validation summary */}
              {(errors.length > 0 || warnings.length > 0) && (
                <div style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: errors.length > 0 ? 'rgba(248,81,73,0.08)' : 'rgba(210,153,34,0.08)',
                  border: `1px solid ${errors.length > 0 ? 'rgba(248,81,73,0.3)' : 'rgba(210,153,34,0.3)'}`,
                }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: errors.length > 0 ? 'var(--accent-red)' : 'var(--accent-yellow)',
                    marginBottom: 8,
                  }}>
                    {errors.length > 0 ? `⛔ ${errors.length} Error${errors.length !== 1 ? 's' : ''}` : `⚠️ ${warnings.length} Warning${warnings.length !== 1 ? 's' : ''}`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {errors.length > 0
                      ? 'Fix all errors before exporting. The output may not work correctly with your bot.'
                      : 'Warnings found but you can still export. Review them for best results.'}
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ marginTop: 8, fontSize: 11, padding: '3px 10px' }}
                    onClick={() => { runValidation(); setShowExportModal(false); }}
                  >
                    View Issues
                  </button>
                </div>
              )}

              {errors.length === 0 && warnings.length === 0 && (
                <div style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(63,185,80,0.08)',
                  border: '1px solid rgba(63,185,80,0.3)',
                  fontSize: 12,
                  color: 'var(--accent-green)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Flow is valid and ready to export!
                </div>
              )}

              {/* Export options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{
                  padding: 16,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                  background: 'var(--bg-elevated)',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-blue)';
                    e.currentTarget.style.background = 'var(--bg-overlay)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                  }}
                  onClick={handleExportZip}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>📦 Full Export (ZIP)</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Exports <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-base)', padding: '1px 4px', borderRadius: 3 }}>flow.json</code>,
                        all locale files in <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-base)', padding: '1px 4px', borderRadius: 3 }}>locales/</code>,
                        and the project save file.
                      </div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                </div>

                <div style={{
                  padding: 16,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                  background: 'var(--bg-elevated)',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-green)';
                    e.currentTarget.style.background = 'var(--bg-overlay)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                  }}
                  onClick={handleSaveProject}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>💾 Save Project File</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Saves a <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-base)', padding: '1px 4px', borderRadius: 3 }}>.ticketflow.json</code> file
                        you can reload later to continue editing.
                      </div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <pre style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-secondary)',
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              overflow: 'auto',
              maxHeight: 400,
              lineHeight: 1.6,
              margin: 0,
            }}>
              {preview}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
