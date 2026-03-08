import type { Project, ValidationIssue, FlowNode, SelectionNodeData, ButtonNodeData, ModalNodeData } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function validateFlow(project: Project): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { nodes, edges, locales } = project;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const edgesBySource = new Map<string, typeof edges>();
  edges.forEach((e) => {
    const arr = edgesBySource.get(e.source) || [];
    arr.push(e);
    edgesBySource.set(e.source, arr);
  });

  // ── 1. Must have exactly one start node
  const starts = nodes.filter((n) => n.type === 'start');
  if (starts.length === 0) {
    issues.push({ id: uuidv4(), severity: 'error', message: 'Flow has no Start node.' });
  } else if (starts.length > 1) {
    issues.push({ id: uuidv4(), severity: 'error', message: `Flow has ${starts.length} Start nodes. Only one is allowed.` });
  }

  // ── 2. Must have at least one end node
  const ends = nodes.filter((n) => n.type === 'end');
  if (ends.length === 0) {
    issues.push({ id: uuidv4(), severity: 'warning', message: 'Flow has no End node.' });
  }

  // ── 3. Per-node checks
  for (const node of nodes) {
    const outEdges = edgesBySource.get(node.id) || [];
    const inEdges = edges.filter((e) => e.target === node.id);

    // Non-start nodes should have at least one incoming edge
    if (node.type !== 'start' && inEdges.length === 0) {
      issues.push({
        id: uuidv4(),
        nodeId: node.id,
        severity: 'warning',
        message: `Node "${getNodeLabel(node)}" is unreachable (no incoming connections).`,
      });
    }

    // Non-end nodes should have outgoing edges
    if (node.type !== 'end') {
      if (node.type === 'question_selection') {
        const data = node.data as SelectionNodeData;
        for (const opt of data.options) {
          const hasEdge = outEdges.some((e) => e.sourceHandle === opt.id);
          if (!hasEdge) {
            issues.push({
              id: uuidv4(),
              nodeId: node.id,
              severity: 'error',
              message: `Option "${opt.value || opt.id}" in node "${getNodeLabel(node)}" has no outgoing connection.`,
            });
          }
        }
        if (data.options.length === 0) {
          issues.push({
            id: uuidv4(),
            nodeId: node.id,
            severity: 'error',
            message: `Selection node "${getNodeLabel(node)}" has no options defined.`,
          });
        }
      } else if (node.type === 'question_button') {
        const data = node.data as ButtonNodeData;
        for (const btn of data.buttons) {
          if (btn.action === 'next') {
            const hasEdge = outEdges.some((e) => e.sourceHandle === btn.id);
            if (!hasEdge) {
              issues.push({
                id: uuidv4(),
                nodeId: node.id,
                severity: 'error',
                message: `Button "${btn.id}" in node "${getNodeLabel(node)}" has no outgoing connection.`,
              });
            }
          }
        }
        if (data.buttons.length === 0) {
          issues.push({
            id: uuidv4(),
            nodeId: node.id,
            severity: 'error',
            message: `Button node "${getNodeLabel(node)}" has no buttons defined.`,
          });
        }
      } else {
        // start, information, modal nodes: need one output
        if (outEdges.length === 0) {
          issues.push({
            id: uuidv4(),
            nodeId: node.id,
            severity: node.type === 'start' ? 'error' : 'warning',
            message: `Node "${getNodeLabel(node)}" has no outgoing connection.`,
          });
        }
      }
    }

    // ── 4. Localization checks
    checkNodeLocalization(node, locales, issues);
  }

  // ── 5. Missing modal validation patterns
  for (const node of nodes.filter((n) => n.type === 'question_modal')) {
    const data = node.data as ModalNodeData;
    for (const field of data.fields) {
      if (field.validation === 'regex' && !field.validationPattern) {
        issues.push({
          id: uuidv4(),
          nodeId: node.id,
          severity: 'error',
          message: `Modal field "${field.id}" uses regex validation but has no pattern.`,
        });
      }
    }
  }

  return issues;
}

function getNodeLabel(node: FlowNode): string {
  const d = node.data as any;
  return d.label || d.questionKey || d.titleKey || node.type;
}

function checkNodeLocalization(
  node: FlowNode,
  locales: Project['locales'],
  issues: ValidationIssue[]
) {
  const keys: string[] = [];
  const d = node.data as any;

  if (d.questionKey) keys.push(d.questionKey);
  if (d.descriptionKey) keys.push(d.descriptionKey);
  if (d.titleKey) keys.push(d.titleKey);
  if (d.contentKey) keys.push(d.contentKey);
  if (d.continueButtonKey) keys.push(d.continueButtonKey);
  if (d.submitButtonKey) keys.push(d.submitButtonKey);

  if (d.options) {
    for (const opt of d.options) {
      if (opt.labelKey) keys.push(opt.labelKey);
    }
  }
  if (d.buttons) {
    for (const btn of d.buttons) {
      if (btn.labelKey) keys.push(btn.labelKey);
    }
  }
  if (d.fields) {
    for (const field of d.fields) {
      if (field.labelKey) keys.push(field.labelKey);
    }
  }

  for (const key of keys) {
    if (!key) continue;
    for (const locale of locales) {
      if (!locale.entries[key] && locale.entries[key] !== '') {
        // key doesn't exist at all
        issues.push({
          id: uuidv4(),
          nodeId: node.id,
          severity: 'warning',
          message: `Key "${key}" missing from locale "${locale.code}" (${locale.name}).`,
          localeCode: locale.code,
        });
      } else if (locale.entries[key] === '') {
        issues.push({
          id: uuidv4(),
          nodeId: node.id,
          severity: 'info',
          message: `Key "${key}" is empty in locale "${locale.code}" (${locale.name}).`,
          localeCode: locale.code,
        });
      }
    }
  }
}

export function getAllLocalizationKeys(project: Project): string[] {
  const keys = new Set<string>();
  for (const node of project.nodes) {
    const d = node.data as any;
    const candidates = [
      d.questionKey, d.descriptionKey, d.titleKey, d.contentKey,
      d.continueButtonKey, d.submitButtonKey,
    ];
    candidates.forEach((k) => k && keys.add(k));
    (d.options || []).forEach((o: any) => o.labelKey && keys.add(o.labelKey));
    (d.buttons || []).forEach((b: any) => b.labelKey && keys.add(b.labelKey));
    (d.fields || []).forEach((f: any) => f.labelKey && keys.add(f.labelKey));
  }
  return Array.from(keys);
}
