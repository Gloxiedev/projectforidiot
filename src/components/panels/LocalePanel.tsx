import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { getAllLocalizationKeys } from '../../utils/validation';
import type { LocaleFile } from '../../types';

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
);

export default function LocalePanel() {
  const project = useStore((s) => s.project);
  const setShowLocalePanel = useStore((s) => s.setShowLocalePanel);
  const addLocale = useStore((s) => s.addLocale);
  const deleteLocale = useStore((s) => s.deleteLocale);
  const setLocaleEntry = useStore((s) => s.setLocaleEntry);

  const [activeLocale, setActiveLocale] = useState(project.locales[0]?.code || 'en');
  const [search, setSearch] = useState('');
  const [showAddLocale, setShowAddLocale] = useState(false);
  const [newLocaleCode, setNewLocaleCode] = useState('');
  const [newLocaleName, setNewLocaleName] = useState('');

  const allKeys = useMemo(() => getAllLocalizationKeys(project), [project]);
  const locale = project.locales.find((l) => l.code === activeLocale);

  const filteredKeys = allKeys.filter((k) =>
    !search || k.toLowerCase().includes(search.toLowerCase())
  );

  const missingCount = locale
    ? allKeys.filter((k) => !locale.entries[k]).length
    : 0;

  const handleAddLocale = () => {
    if (!newLocaleCode || !newLocaleName) return;
    addLocale({ code: newLocaleCode, name: newLocaleName, entries: {} });
    setActiveLocale(newLocaleCode);
    setNewLocaleCode('');
    setNewLocaleName('');
    setShowAddLocale(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'flex-end',
    }} onClick={(e) => e.target === e.currentTarget && setShowLocalePanel(false)}>
      <div
        className="slide-in"
        style={{
          width: 640,
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
              Localization Manager
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {allKeys.length} keys across {project.locales.length} languages
            </div>
          </div>
          <button className="btn-icon" onClick={() => setShowLocalePanel(false)}><XIcon /></button>
        </div>

        {/* Locale tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          padding: '0 12px',
          overflowX: 'auto',
          flexShrink: 0,
        }}>
          {project.locales.map((loc) => {
            const missing = allKeys.filter((k) => !loc.entries[k]).length;
            return (
              <button
                key={loc.code}
                onClick={() => setActiveLocale(loc.code)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeLocale === loc.code
                    ? '2px solid var(--accent-blue)'
                    : '2px solid transparent',
                  color: activeLocale === loc.code ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: activeLocale === loc.code ? 600 : 400,
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'color 0.15s',
                }}
              >
                {loc.name}
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 5px',
                  borderRadius: 20,
                  background: loc.code === 'en' ? 'var(--bg-overlay)' : 'var(--bg-overlay)',
                  color: missing > 0 ? 'var(--accent-yellow)' : 'var(--accent-green)',
                }}>
                  {loc.code}
                  {missing > 0 && ` · ${missing}⚠`}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setShowAddLocale(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '10px 12px',
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.15s',
              marginLeft: 'auto',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <PlusIcon /> Add Language
          </button>
        </div>

        {/* Add locale form */}
        {showAddLocale && (
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-overlay)',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-end',
            flexShrink: 0,
          }}>
            <div className="field-group" style={{ margin: 0, flex: '0 0 100px' }}>
              <label>Code</label>
              <input type="text" value={newLocaleCode} onChange={(e) => setNewLocaleCode(e.target.value.toLowerCase())} placeholder="fr" maxLength={5} />
            </div>
            <div className="field-group" style={{ margin: 0, flex: 1 }}>
              <label>Name</label>
              <input type="text" value={newLocaleName} onChange={(e) => setNewLocaleName(e.target.value)} placeholder="French" />
            </div>
            <button className="btn btn-primary" onClick={handleAddLocale}>Create</button>
            <button className="btn btn-secondary" onClick={() => setShowAddLocale(false)}>Cancel</button>
          </div>
        )}

        {/* Search */}
        <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter keys…"
            style={{ width: '100%' }}
          />
        </div>

        {/* Key-value list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {allKeys.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)',
              gap: 8,
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <div style={{ fontSize: 12 }}>No localization keys yet.</div>
              <div style={{ fontSize: 11 }}>Add question keys to your nodes to see them here.</div>
            </div>
          ) : filteredKeys.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No keys match "{search}"
            </div>
          ) : (
            filteredKeys.map((key) => {
              const value = locale?.entries[key] ?? '';
              const isMissing = !value;
              return (
                <div
                  key={key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.5fr',
                    gap: 0,
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-overlay)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    padding: '8px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    borderRight: '1px solid var(--border-subtle)',
                  }}>
                    {isMissing && (
                      <div
                        title="Missing translation"
                        style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-yellow)', flexShrink: 0 }}
                      />
                    )}
                    <span style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      color: isMissing ? 'var(--accent-yellow)' : 'var(--text-secondary)',
                      wordBreak: 'break-all',
                    }}>
                      {key}
                    </span>
                  </div>
                  <div style={{ padding: '5px 12px', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => locale && setLocaleEntry(locale.code, key, e.target.value)}
                      placeholder="Enter translation…"
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid transparent',
                        borderRadius: 0,
                        padding: '3px 0',
                        fontSize: 12,
                        color: isMissing ? 'var(--text-muted)' : 'var(--text-primary)',
                      }}
                      onFocus={(e) => (e.target.style.borderBottomColor = 'var(--accent-blue)')}
                      onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with locale actions */}
        {locale && locale.code !== 'en' && (
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--bg-elevated)',
            flexShrink: 0,
          }}>
            <button
              className="btn btn-danger"
              onClick={() => {
                deleteLocale(locale.code);
                setActiveLocale(project.locales[0]?.code || 'en');
              }}
            >
              <TrashIcon /> Remove "{locale.name}"
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
