import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type {
  EditorStore, Project, ProjectMeta, FlowNode, FlowEdge, FlowNodeData,
  LocaleFile, ValidationIssue, NodeMeta, NodeColor, SimulatorState,
  FlowStats, HistoryEntry, RecentProject, BackgroundStyle, ThemeAccent,
} from '../types';
import { validateFlow, getAllLocalizationKeys } from '../utils/validation';

const LS_KEY = 'flowforge_autosave';
const LS_RECENT_KEY = 'flowforge_recent';
const MAX_HISTORY = 50;

const defaultProject = (): Project => ({
  meta: {
    name: 'Untitled Flow', description: '', version: '1.0.0',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  nodes: [{ id: 'start-1', type: 'start', position: { x: 300, y: 100 }, data: { kind: 'start', label: 'Start' } }],
  edges: [],
  locales: [{ code: 'en', name: 'English', entries: {} }],
});

function loadRecentProjects(): RecentProject[] {
  try { return JSON.parse(localStorage.getItem(LS_RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecentProject(project: Project) {
  try {
    const recent = loadRecentProjects().filter((r: RecentProject) => r.id !== project.meta.name);
    const entry: RecentProject = { id: project.meta.name, name: project.meta.name, savedAt: new Date().toISOString(), nodeCount: project.nodes.length, localeCount: project.locales.length };
    localStorage.setItem(LS_RECENT_KEY, JSON.stringify([entry, ...recent].slice(0, 10)));
  } catch {}
}

function computeAutoLayout(nodes: FlowNode[], edges: FlowEdge[]): Record<string, { x: number; y: number }> {
  const outMap: Record<string, string[]> = {};
  const inMap: Record<string, string[]> = {};
  nodes.forEach(n => { outMap[n.id] = []; inMap[n.id] = []; });
  edges.forEach(e => { outMap[e.source]?.push(e.target); inMap[e.target]?.push(e.source); });
  const levels: Record<string, number> = {};
  const visited = new Set<string>();
  const queue: string[] = nodes.filter(n => n.type === 'start').map(n => n.id);
  if (queue.length === 0 && nodes.length) queue.push(nodes[0].id);
  queue.forEach(id => { levels[id] = 0; });
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    (outMap[id] || []).forEach(next => {
      if (!visited.has(next)) { levels[next] = Math.max(levels[next] ?? 0, (levels[id] ?? 0) + 1); queue.push(next); }
    });
  }
  nodes.forEach(n => { if (levels[n.id] === undefined) levels[n.id] = 0; });
  const groups: Record<number, string[]> = {};
  nodes.forEach(n => { const l = levels[n.id]; if (!groups[l]) groups[l] = []; groups[l].push(n.id); });
  const positions: Record<string, { x: number; y: number }> = {};
  Object.entries(groups).forEach(([lStr, ids]) => {
    const l = parseInt(lStr);
    ids.forEach((id, i) => { positions[id] = { x: l * 320 + 80, y: i * 160 - ((ids.length - 1) * 160) / 2 + 400 }; });
  });
  return positions;
}

function findNodePath(nodeId: string, nodes: FlowNode[], edges: FlowEdge[], visited = new Set<string>()): string[] {
  if (visited.has(nodeId)) return [nodeId];
  visited.add(nodeId);
  const inEdge = edges.find(e => e.target === nodeId);
  if (!inEdge) return [nodeId];
  return [...findNodePath(inEdge.source, nodes, edges, visited), nodeId];
}

function longestPath(nodes: FlowNode[], edges: FlowEdge[]): number {
  const outMap: Record<string, string[]> = {};
  nodes.forEach(n => { outMap[n.id] = []; });
  edges.forEach(e => { outMap[e.source]?.push(e.target); });
  const memo: Record<string, number> = {};
  function dfs(id: string, stack: Set<string>): number {
    if (memo[id] !== undefined) return memo[id];
    if (stack.has(id)) return 0;
    const next = new Set(stack); next.add(id);
    const nexts = outMap[id] || [];
    memo[id] = nexts.length === 0 ? 0 : 1 + Math.max(...nexts.map(n => dfs(n, next)));
    return memo[id];
  }
  return nodes.length === 0 ? 0 : Math.max(0, ...nodes.map(n => dfs(n.id, new Set())));
}

export const useStore = create<EditorStore>()(
  immer((set, get) => ({
    project: defaultProject(),
    selectedNodeId: null,
    selectedEdgeId: null,
    selectedNodeIds: [],
    validationIssues: [],
    showLocalePanel: false,
    showValidationPanel: false,
    showExportModal: false,
    showShortcutsModal: false,
    showStatsPanel: false,
    showHelpPanel: false,
    showSimulator: false,
    showChangelogPanel: false,
    isDirty: false,
    snapToGrid: true,
    showMinimap: true,
    backgroundStyle: 'dots' as BackgroundStyle,
    themeAccent: 'blue' as ThemeAccent,
    zoomLevel: 1,
    searchQuery: '',
    highlightedNodeIds: [],
    clipboard: [],
    history: [] as HistoryEntry[],
    historyIndex: -1,
    recentProjects: loadRecentProjects(),
    simulator: { active: false, currentNodeId: null, history: [], answers: {} } as SimulatorState,

    // ── Project ──────────────────────────────────────────────────────────────
    setProjectMeta: (meta: Partial<ProjectMeta>) => set((s) => {
      Object.assign(s.project.meta, meta);
      s.project.meta.updatedAt = new Date().toISOString();
      s.isDirty = true;
    }),
    newProject: () => set((s) => {
      s.project = defaultProject(); s.selectedNodeId = null; s.selectedEdgeId = null;
      s.selectedNodeIds = []; s.validationIssues = []; s.history = []; s.historyIndex = -1;
      s.isDirty = false; s.simulator = { active: false, currentNodeId: null, history: [], answers: {} };
    }),
    loadProject: (project: Project) => set((s) => {
      s.project = project; s.selectedNodeId = null; s.selectedEdgeId = null;
      s.selectedNodeIds = []; s.isDirty = false; s.history = []; s.historyIndex = -1;
      s.validationIssues = validateFlow(project) as ValidationIssue[];
      s.simulator = { active: false, currentNodeId: null, history: [], answers: {} };
    }),
    saveToLocalStorage: () => {
      const { project } = get();
      try { localStorage.setItem(LS_KEY, JSON.stringify({ project, savedAt: new Date().toISOString() })); saveRecentProject(project); } catch {}
    },
    loadFromLocalStorage: () => {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return false;
        get().loadProject(JSON.parse(raw).project);
        return true;
      } catch { return false; }
    },

    // ── History ───────────────────────────────────────────────────────────────
    pushHistory: (label: string) => set((s) => {
      const entry: HistoryEntry = { label, timestamp: Date.now(), nodes: JSON.parse(JSON.stringify(s.project.nodes)), edges: JSON.parse(JSON.stringify(s.project.edges)) };
      s.history = s.history.slice(0, s.historyIndex + 1);
      s.history.push(entry);
      if (s.history.length > MAX_HISTORY) s.history.shift();
      s.historyIndex = s.history.length - 1;
    }),
    undo: () => set((s) => {
      if (s.historyIndex <= 0) return;
      s.historyIndex -= 1;
      const e = s.history[s.historyIndex];
      s.project.nodes = e.nodes; s.project.edges = e.edges;
      s.selectedNodeId = null; s.selectedNodeIds = []; s.isDirty = true;
    }),
    redo: () => set((s) => {
      if (s.historyIndex >= s.history.length - 1) return;
      s.historyIndex += 1;
      const e = s.history[s.historyIndex];
      s.project.nodes = e.nodes; s.project.edges = e.edges; s.isDirty = true;
    }),
    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // ── Nodes ─────────────────────────────────────────────────────────────────
    addNode: (node: FlowNode) => set((s) => { s.project.nodes.push(node); s.isDirty = true; }),
    updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => set((s) => {
      const node = s.project.nodes.find(n => n.id === nodeId);
      if (node) { Object.assign(node.data, data); s.project.meta.updatedAt = new Date().toISOString(); s.isDirty = true; }
    }),
    updateNodeMeta: (nodeId: string, meta: Partial<NodeMeta>) => set((s) => {
      const node = s.project.nodes.find(n => n.id === nodeId);
      if (node) { const existing = (node.data as any).meta || {}; (node.data as any).meta = { ...existing, ...meta }; s.isDirty = true; }
    }),
    updateNodePosition: (nodeId: string, position: { x: number; y: number }) => set((s) => {
      const node = s.project.nodes.find(n => n.id === nodeId);
      if (node && !(node.data as any).meta?.locked) { node.position = position; s.isDirty = true; }
    }),
    deleteNode: (nodeId: string) => set((s) => {
      s.project.nodes = s.project.nodes.filter(n => n.id !== nodeId);
      s.project.edges = s.project.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
      if (s.selectedNodeId === nodeId) s.selectedNodeId = null;
      s.isDirty = true;
    }),
    deleteSelectedNodes: () => set((s) => {
      const ids = new Set(s.selectedNodeIds);
      s.project.nodes = s.project.nodes.filter(n => !ids.has(n.id) || n.type === 'start');
      s.project.edges = s.project.edges.filter(e => !ids.has(e.source) && !ids.has(e.target));
      s.selectedNodeIds = []; s.selectedNodeId = null; s.isDirty = true;
    }),
    selectNode: (nodeId: string | null) => set((s) => {
      s.selectedNodeId = nodeId; s.selectedNodeIds = nodeId ? [nodeId] : [];
      if (nodeId) s.selectedEdgeId = null;
    }),
    selectNodes: (nodeIds: string[]) => set((s) => {
      s.selectedNodeIds = nodeIds; s.selectedNodeId = nodeIds[0] ?? null;
    }),
    duplicateNode: (nodeId: string) => set((s) => {
      const node = s.project.nodes.find(n => n.id === nodeId);
      if (!node) return;
      const newNode: FlowNode = { ...JSON.parse(JSON.stringify(node)), id: `${node.type}-${uuidv4().substring(0, 8)}`, position: { x: node.position.x + 40, y: node.position.y + 40 } };
      if ((newNode.data as any).meta) (newNode.data as any).meta.locked = false;
      s.project.nodes.push(newNode); s.selectedNodeId = newNode.id; s.isDirty = true;
    }),
    copyNodes: (nodeIds: string[]) => set((s) => {
      s.clipboard = s.project.nodes.filter(n => nodeIds.includes(n.id)).map(n => JSON.parse(JSON.stringify(n)));
    }),
    pasteNodes: () => set((s) => {
      if (!s.clipboard.length) return;
      const newIds: string[] = [];
      for (const node of s.clipboard) {
        const newId = `${node.type}-${uuidv4().substring(0, 8)}`;
        newIds.push(newId);
        s.project.nodes.push({ ...JSON.parse(JSON.stringify(node)), id: newId, position: { x: node.position.x + 60, y: node.position.y + 60 } });
      }
      s.selectedNodeIds = newIds; s.selectedNodeId = newIds[0] ?? null; s.isDirty = true;
    }),
    lockNode: (nodeId: string, locked: boolean) => set((s) => {
      const node = s.project.nodes.find(n => n.id === nodeId);
      if (node) { const m = (node.data as any).meta || {}; (node.data as any).meta = { ...m, locked }; s.isDirty = true; }
    }),
    setNodeColor: (nodeId: string, color: NodeColor) => set((s) => {
      const node = s.project.nodes.find(n => n.id === nodeId);
      if (node) { const m = (node.data as any).meta || {}; (node.data as any).meta = { ...m, color }; s.isDirty = true; }
    }),
    setNodeComment: (nodeId: string, comment: string) => set((s) => {
      const node = s.project.nodes.find(n => n.id === nodeId);
      if (node) { const m = (node.data as any).meta || {}; (node.data as any).meta = { ...m, comment }; s.isDirty = true; }
    }),
    toggleNodeCollapsed: (nodeId: string) => set((s) => {
      const node = s.project.nodes.find(n => n.id === nodeId);
      if (node) { const m = (node.data as any).meta || {}; (node.data as any).meta = { ...m, collapsed: !m.collapsed }; s.isDirty = true; }
    }),
    autoLayout: () => set((s) => {
      const positions = computeAutoLayout(s.project.nodes as FlowNode[], s.project.edges as FlowEdge[]);
      s.project.nodes.forEach(node => { if (positions[node.id]) node.position = positions[node.id]; });
      s.isDirty = true;
    }),
    deleteOrphanNodes: () => set((s) => {
      const connected = new Set<string>();
      s.project.edges.forEach(e => { connected.add(e.source); connected.add(e.target); });
      s.project.nodes.filter(n => n.type === 'start').forEach(n => connected.add(n.id));
      const toDelete = s.project.nodes.filter(n => !connected.has(n.id)).map(n => n.id);
      s.project.nodes = s.project.nodes.filter(n => !toDelete.includes(n.id));
      s.project.edges = s.project.edges.filter(e => !toDelete.includes(e.source) && !toDelete.includes(e.target));
      s.isDirty = true;
    }),
    getNodePath: (nodeId: string) => {
      const { project } = get();
      return findNodePath(nodeId, project.nodes, project.edges);
    },

    // ── Edges ─────────────────────────────────────────────────────────────────
    addEdge: (edge: FlowEdge) => set((s) => {
      s.project.edges = s.project.edges.filter(e => !(e.source === edge.source && e.sourceHandle === edge.sourceHandle));
      s.project.edges.push(edge); s.isDirty = true;
    }),
    updateEdge: (edgeId: string, updates: Partial<FlowEdge>) => set((s) => {
      const edge = s.project.edges.find(e => e.id === edgeId);
      if (edge) { Object.assign(edge, updates); s.isDirty = true; }
    }),
    deleteEdge: (edgeId: string) => set((s) => {
      s.project.edges = s.project.edges.filter(e => e.id !== edgeId);
      if (s.selectedEdgeId === edgeId) s.selectedEdgeId = null;
      s.isDirty = true;
    }),
    selectEdge: (edgeId: string | null) => set((s) => {
      s.selectedEdgeId = edgeId;
      if (edgeId) { s.selectedNodeId = null; s.selectedNodeIds = []; }
    }),

    // ── Locales ───────────────────────────────────────────────────────────────
    addLocale: (locale: LocaleFile) => set((s) => {
      if (s.project.locales.find(l => l.code === locale.code)) return;
      getAllLocalizationKeys(s.project as Project).forEach(k => { if (!(k in locale.entries)) locale.entries[k] = ''; });
      s.project.locales.push(locale); s.isDirty = true;
    }),
    updateLocale: (code: string, updates: Partial<LocaleFile>) => set((s) => {
      const l = s.project.locales.find(l => l.code === code);
      if (l) { Object.assign(l, updates); s.isDirty = true; }
    }),
    deleteLocale: (code: string) => set((s) => { s.project.locales = s.project.locales.filter(l => l.code !== code); s.isDirty = true; }),
    setLocaleEntry: (code: string, key: string, value: string) => set((s) => {
      const l = s.project.locales.find(l => l.code === code);
      if (l) { l.entries[key] = value; s.isDirty = true; }
    }),
    renameLocaleKey: (oldKey: string, newKey: string) => set((s) => {
      if (!oldKey || !newKey || oldKey === newKey) return;
      s.project.locales.forEach(l => { if (oldKey in l.entries) { l.entries[newKey] = l.entries[oldKey]; delete l.entries[oldKey]; } });
      function replaceKey(obj: any) {
        for (const k of Object.keys(obj)) {
          if (typeof obj[k] === 'string' && obj[k] === oldKey) obj[k] = newKey;
          else if (Array.isArray(obj[k])) obj[k].forEach((item: any) => typeof item === 'object' && item && replaceKey(item));
          else if (obj[k] && typeof obj[k] === 'object') replaceKey(obj[k]);
        }
      }
      s.project.nodes.forEach(n => replaceKey(n.data)); s.isDirty = true;
    }),
    bulkImportLocale: (code: string, entries: Record<string, string>) => set((s) => {
      const l = s.project.locales.find(l => l.code === code);
      if (l) { Object.assign(l.entries, entries); s.isDirty = true; }
    }),
    deleteUnusedKeys: () => set((s) => {
      const used = new Set(getAllLocalizationKeys(s.project as Project));
      s.project.locales.forEach(l => Object.keys(l.entries).forEach(k => { if (!used.has(k)) delete l.entries[k]; }));
      s.isDirty = true;
    }),
    importLocaleFromCSV: (code: string, csv: string) => set((s) => {
      const l = s.project.locales.find(l => l.code === code);
      if (!l) return;
      csv.split('\n').filter(x => x.trim()).forEach(line => {
        const ci = line.indexOf(','); if (ci === -1) return;
        const key = line.slice(0, ci).trim().replace(/^"|"$/g, '');
        const val = line.slice(ci + 1).trim().replace(/^"|"$/g, '');
        if (key) l.entries[key] = val;
      });
      s.isDirty = true;
    }),

    // ── Simulator ─────────────────────────────────────────────────────────────
    startSimulator: () => set((s) => {
      const startNode = s.project.nodes.find(n => n.type === 'start');
      // Follow start node's first edge to get to the first question
      const firstEdge = s.project.edges.find(e => e.source === startNode?.id);
      const firstId = firstEdge?.target ?? startNode?.id ?? null;
      s.simulator = { active: true, currentNodeId: firstId, history: firstId ? [firstId] : [], answers: {} };
      s.showSimulator = true;
    }),
    stopSimulator: () => set((s) => { s.simulator = { active: false, currentNodeId: null, history: [], answers: {} }; }),
    simulatorChoose: (optionId: string, value: string) => set((s) => {
      const edge = s.project.edges.find(e => e.source === s.simulator.currentNodeId && e.sourceHandle === optionId);
      if (!edge) return;
      if (s.simulator.currentNodeId) s.simulator.answers[s.simulator.currentNodeId] = value;
      s.simulator.history.push(edge.target);
      s.simulator.currentNodeId = edge.target;
    }),
    simulatorBack: () => set((s) => {
      if (s.simulator.history.length <= 1) return;
      s.simulator.history.pop();
      const prev = s.simulator.history[s.simulator.history.length - 1];
      if (prev) delete s.simulator.answers[prev];
      s.simulator.currentNodeId = prev ?? null;
    }),

    // ── Stats ─────────────────────────────────────────────────────────────────
    computeStats: (): FlowStats => {
      const { project } = get();
      const { nodes, edges, locales } = project;
      const allKeys = getAllLocalizationKeys(project);
      const nodesByType: Record<string, number> = {};
      nodes.forEach(n => { nodesByType[n.type] = (nodesByType[n.type] || 0) + 1; });
      const localeCompletion: Record<string, number> = {};
      locales.forEach(l => {
        if (!allKeys.length) { localeCompletion[l.code] = 100; return; }
        localeCompletion[l.code] = Math.round(allKeys.filter(k => l.entries[k]?.trim()).length / allKeys.length * 100);
      });
      const connected = new Set<string>();
      edges.forEach(e => { connected.add(e.source); connected.add(e.target); });
      nodes.filter(n => n.type === 'start').forEach(n => connected.add(n.id));
      const outCounts: Record<string, number> = {};
      edges.forEach(e => { outCounts[e.source] = (outCounts[e.source] || 0) + 1; });
      const used = new Set(allKeys);
      const unusedLocaleKeys: string[] = [];
      if (locales[0]) Object.keys(locales[0].entries).forEach(k => { if (!used.has(k)) unusedLocaleKeys.push(k); });
      return {
        nodeCount: nodes.length, edgeCount: edges.length, nodesByType, localeCompletion,
        totalKeys: allKeys.length, longestPath: longestPath(nodes, edges),
        branchCount: Object.values(outCounts).filter(c => c > 1).length,
        orphanCount: nodes.filter(n => !connected.has(n.id)).length, unusedLocaleKeys,
      };
    },

    // ── UI ────────────────────────────────────────────────────────────────────
    setShowLocalePanel: (v) => set((s) => { s.showLocalePanel = v; }),
    setShowValidationPanel: (v) => set((s) => { s.showValidationPanel = v; }),
    setShowExportModal: (v) => set((s) => { s.showExportModal = v; }),
    setShowShortcutsModal: (v) => set((s) => { s.showShortcutsModal = v; }),
    setShowStatsPanel: (v) => set((s) => { s.showStatsPanel = v; }),
    setShowHelpPanel: (v) => set((s) => { s.showHelpPanel = v; }),
    setShowSimulator: (v) => set((s) => { s.showSimulator = v; }),
    setShowChangelogPanel: (v) => set((s) => { s.showChangelogPanel = v; }),
    setSnapToGrid: (v) => set((s) => { s.snapToGrid = v; }),
    setShowMinimap: (v) => set((s) => { s.showMinimap = v; }),
    setBackgroundStyle: (v) => set((s) => { s.backgroundStyle = v; }),
    setThemeAccent: (v) => set((s) => { s.themeAccent = v; }),
    setZoomLevel: (v) => set((s) => { s.zoomLevel = v; }),
    setSearchQuery: (v) => set((s) => { s.searchQuery = v; }),
    setHighlightedNodeIds: (ids) => set((s) => { s.highlightedNodeIds = ids; }),

    // ── Validation ────────────────────────────────────────────────────────────
    runValidation: () => set((s) => { s.validationIssues = validateFlow(s.project as Project) as ValidationIssue[]; }),
  }))
);
