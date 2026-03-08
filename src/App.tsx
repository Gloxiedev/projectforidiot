import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useStore } from './store';
import Toolbar from './components/ui/Toolbar';
import Canvas from './components/ui/Canvas';
import NodePalette from './components/panels/NodePalette';
import PropertiesPanel from './components/panels/PropertiesPanel';
import LocalePanel from './components/panels/LocalePanel';
import ValidationPanel from './components/panels/ValidationPanel';
import StatsPanel from './components/panels/StatsPanel';
import ExportModal from './components/modals/ExportModal';
import SimulatorPanel from './components/modals/SimulatorPanel';
import ShortcutsModal from './components/modals/ShortcutsModal';
import SettingsPanel from './components/modals/SettingsPanel';
import ChangelogPanel from './components/modals/ChangelogPanel';
import SearchBar from './components/ui/SearchBar';
import StatusBar from './components/ui/StatusBar';

export default function App() {
  const showLocalePanel = useStore(s => s.showLocalePanel);
  const showValidationPanel = useStore(s => s.showValidationPanel);
  const showExportModal = useStore(s => s.showExportModal);
  const showShortcutsModal = useStore(s => s.showShortcutsModal);
  const showStatsPanel = useStore(s => s.showStatsPanel);
  const showSimulator = useStore(s => s.showSimulator);
  const showChangelogPanel = useStore(s => s.showChangelogPanel);
  const runValidation = useStore(s => s.runValidation);
  const loadFromLocalStorage = useStore(s => s.loadFromLocalStorage);
  const saveToLocalStorage = useStore(s => s.saveToLocalStorage);

  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    runValidation();
    const handler = () => saveToLocalStorage();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Toolbar onOpenSettings={() => setShowSettings(true)} onOpenSearch={() => setShowSearch(true)} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <NodePalette />
        <ReactFlowProvider>
          <Canvas />
        </ReactFlowProvider>
        <PropertiesPanel />
      </div>
      {showValidationPanel && <ValidationPanel />}
      <StatusBar />
      {showLocalePanel && <LocalePanel />}
      {showExportModal && <ExportModal />}
      {showShortcutsModal && <ShortcutsModal />}
      {showStatsPanel && <StatsPanel />}
      {showSimulator && <SimulatorPanel />}
      {showChangelogPanel && <ChangelogPanel />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showSearch && <SearchBar onClose={() => { setShowSearch(false); useStore.getState().setSearchQuery(''); }} />}
    </div>
  );
}
