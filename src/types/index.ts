// ─── Node Types ────────────────────────────────────────────────────────────

export type NodeKind =
  | 'start'
  | 'end'
  | 'question_selection'
  | 'question_button'
  | 'question_information'
  | 'question_modal';

export type NodeColor =
  | 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

// ─── History (Undo/Redo) ────────────────────────────────────────────────────

export interface HistoryEntry {
  label: string;
  timestamp: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// ─── Recent Projects ────────────────────────────────────────────────────────

export interface RecentProject {
  id: string;
  name: string;
  savedAt: string;
  nodeCount: number;
  localeCount: number;
}

// ─── Localization ──────────────────────────────────────────────────────────

export interface LocaleFile {
  code: string;   // e.g. "en", "fr"
  name: string;   // e.g. "English", "French"
  entries: Record<string, string>;  // id → translated text
}

// ─── Option / Answer Items ─────────────────────────────────────────────────

export interface SelectionOption {
  id: string;
  labelKey: string;   // localization key
  value: string;      // raw value stored in flow
}

export interface ButtonOption {
  id: string;
  labelKey: string;
  action: 'next' | 'url';
  url?: string;
}

export interface ModalField {
  id: string;
  labelKey: string;
  placeholder?: string;
  required: boolean;
  validation: 'none' | 'email' | 'url' | 'number' | 'regex';
  validationPattern?: string;
  validationMessage?: string;
}

// ─── Node Data Variants ────────────────────────────────────────────────────

export interface NodeMeta {
  comment?: string;          // inline note/comment
  color?: NodeColor;         // tag color
  collapsed?: boolean;       // collapsed display
  locked?: boolean;          // prevent drag
  tags?: string[];           // freeform tags
}

export interface StartNodeData {
  kind: 'start';
  label: string;
  meta?: NodeMeta;
}

export interface EndNodeData {
  kind: 'end';
  label: string;
  triggerAction: string;
  meta?: NodeMeta;
}

export interface SelectionNodeData {
  kind: 'question_selection';
  questionKey: string;
  descriptionKey?: string;
  options: SelectionOption[];
  dynamic?: boolean;
  dynamicSource?: string;
  dynamicCondition?: string;
  meta?: NodeMeta;
}

export interface ButtonNodeData {
  kind: 'question_button';
  questionKey: string;
  descriptionKey?: string;
  buttons: ButtonOption[];
  meta?: NodeMeta;
}

export interface InformationNodeData {
  kind: 'question_information';
  titleKey: string;
  contentKey: string;
  continueButtonKey?: string;
  meta?: NodeMeta;
}

export interface ModalNodeData {
  kind: 'question_modal';
  questionKey: string;
  descriptionKey?: string;
  fields: ModalField[];
  submitButtonKey?: string;
  meta?: NodeMeta;
}

export type FlowNodeData =
  | StartNodeData
  | EndNodeData
  | SelectionNodeData
  | ButtonNodeData
  | InformationNodeData
  | ModalNodeData;

// ─── Flow Node (ReactFlow compatible) ─────────────────────────────────────

export interface FlowNode {
  id: string;
  type: NodeKind;
  position: { x: number; y: number };
  data: FlowNodeData;
  selected?: boolean;
}

// ─── Flow Edge ─────────────────────────────────────────────────────────────

export interface FlowEdge {
  id: string;
  source: string;
  sourceHandle: string;   // optionId or 'output'
  target: string;
  targetHandle: string;   // 'input'
  label?: string;
  animated?: boolean;
}

// ─── Validation ────────────────────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  nodeId?: string;
  edgeId?: string;
  severity: ValidationSeverity;
  message: string;
  localeCode?: string;
}

// ─── Project ───────────────────────────────────────────────────────────────

export interface ProjectMeta {
  name: string;
  description?: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  meta: ProjectMeta;
  nodes: FlowNode[];
  edges: FlowEdge[];
  locales: LocaleFile[];
}

// ─── UI State ──────────────────────────────────────────────────────────────

export type PanelTab = 'properties' | 'stats' | 'simulate' | 'changelog';
export type BackgroundStyle = 'dots' | 'lines' | 'cross' | 'none';
export type ThemeAccent = 'blue' | 'purple' | 'green' | 'orange' | 'pink';

export interface SimulatorState {
  active: boolean;
  currentNodeId: string | null;
  history: string[];          // node ids visited
  answers: Record<string, string>; // nodeId → chosen option value
}

export interface FlowStats {
  nodeCount: number;
  edgeCount: number;
  nodesByType: Record<string, number>;
  localeCompletion: Record<string, number>; // locale code → % complete
  totalKeys: number;
  longestPath: number;
  branchCount: number;
  orphanCount: number;
  unusedLocaleKeys: string[];
}

// ─── Store ─────────────────────────────────────────────────────────────────

export interface EditorStore {
  project: Project;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedNodeIds: string[];      // multi-select
  validationIssues: ValidationIssue[];
  showLocalePanel: boolean;
  showValidationPanel: boolean;
  showExportModal: boolean;
  showShortcutsModal: boolean;
  showStatsPanel: boolean;
  showHelpPanel: boolean;
  showSimulator: boolean;
  showChangelogPanel: boolean;
  isDirty: boolean;
  snapToGrid: boolean;
  showMinimap: boolean;
  backgroundStyle: BackgroundStyle;
  themeAccent: ThemeAccent;
  zoomLevel: number;
  searchQuery: string;
  highlightedNodeIds: string[];
  simulator: SimulatorState;
  history: HistoryEntry[];
  historyIndex: number;
  recentProjects: RecentProject[];
  clipboard: FlowNode[];

  // ── Project ──
  setProjectMeta: (meta: Partial<ProjectMeta>) => void;
  newProject: () => void;
  loadProject: (project: Project) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;

  // ── History ──
  pushHistory: (label: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // ── Nodes ──
  addNode: (node: FlowNode) => void;
  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
  updateNodeMeta: (nodeId: string, meta: Partial<NodeMeta>) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  deleteSelectedNodes: () => void;
  selectNode: (nodeId: string | null) => void;
  selectNodes: (nodeIds: string[]) => void;
  duplicateNode: (nodeId: string) => void;
  copyNodes: (nodeIds: string[]) => void;
  pasteNodes: () => void;
  lockNode: (nodeId: string, locked: boolean) => void;
  setNodeColor: (nodeId: string, color: NodeColor) => void;
  setNodeComment: (nodeId: string, comment: string) => void;
  toggleNodeCollapsed: (nodeId: string) => void;
  autoLayout: () => void;
  deleteOrphanNodes: () => void;
  getNodePath: (nodeId: string) => string[];

  // ── Edges ──
  addEdge: (edge: FlowEdge) => void;
  updateEdge: (edgeId: string, updates: Partial<FlowEdge>) => void;
  deleteEdge: (edgeId: string) => void;
  selectEdge: (edgeId: string | null) => void;

  // ── Locales ──
  addLocale: (locale: LocaleFile) => void;
  updateLocale: (code: string, updates: Partial<LocaleFile>) => void;
  deleteLocale: (code: string) => void;
  setLocaleEntry: (code: string, key: string, value: string) => void;
  renameLocaleKey: (oldKey: string, newKey: string) => void;
  bulkImportLocale: (code: string, entries: Record<string, string>) => void;
  deleteUnusedKeys: () => void;
  importLocaleFromCSV: (code: string, csv: string) => void;

  // ── Simulator ──
  startSimulator: () => void;
  stopSimulator: () => void;
  simulatorChoose: (optionId: string, value: string) => void;
  simulatorBack: () => void;

  // ── Stats ──
  computeStats: () => FlowStats;

  // ── UI ──
  setShowLocalePanel: (v: boolean) => void;
  setShowValidationPanel: (v: boolean) => void;
  setShowExportModal: (v: boolean) => void;
  setShowShortcutsModal: (v: boolean) => void;
  setShowStatsPanel: (v: boolean) => void;
  setShowHelpPanel: (v: boolean) => void;
  setShowSimulator: (v: boolean) => void;
  setShowChangelogPanel: (v: boolean) => void;
  setSnapToGrid: (v: boolean) => void;
  setShowMinimap: (v: boolean) => void;
  setBackgroundStyle: (v: BackgroundStyle) => void;
  setThemeAccent: (v: ThemeAccent) => void;
  setZoomLevel: (v: number) => void;
  setSearchQuery: (v: string) => void;
  setHighlightedNodeIds: (ids: string[]) => void;

  // ── Validation ──
  runValidation: () => void;
}
