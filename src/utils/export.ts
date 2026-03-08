import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Project, FlowNode, FlowEdge, SelectionNodeData, ButtonNodeData, InformationNodeData, ModalNodeData, EndNodeData } from '../types';

// ─── Build the bot-ready JSON structure ───────────────────────────────────

function buildNodeExport(node: FlowNode, edges: FlowEdge[]) {
  const outEdges = edges.filter((e) => e.source === node.id);
  const baseId = node.id;

  switch (node.type) {
    case 'start': {
      const nextEdge = outEdges[0];
      return {
        id: baseId,
        type: 'start',
        next: nextEdge?.target ?? null,
      };
    }
    case 'end': {
      const data = node.data as EndNodeData;
      return {
        id: baseId,
        type: 'end',
        triggerAction: data.triggerAction,
      };
    }
    case 'question_selection': {
      const data = node.data as SelectionNodeData;
      return {
        id: baseId,
        type: 'selection',
        questionKey: data.questionKey,
        descriptionKey: data.descriptionKey ?? null,
        dynamic: data.dynamic ?? false,
        dynamicSource: data.dynamicSource ?? null,
        dynamicCondition: data.dynamicCondition ?? null,
        options: data.options.map((opt) => {
          const edge = outEdges.find((e) => e.sourceHandle === opt.id);
          return {
            id: opt.id,
            labelKey: opt.labelKey,
            value: opt.value,
            next: edge?.target ?? null,
          };
        }),
      };
    }
    case 'question_button': {
      const data = node.data as ButtonNodeData;
      return {
        id: baseId,
        type: 'button',
        questionKey: data.questionKey,
        descriptionKey: data.descriptionKey ?? null,
        buttons: data.buttons.map((btn) => {
          const edge = outEdges.find((e) => e.sourceHandle === btn.id);
          return {
            id: btn.id,
            labelKey: btn.labelKey,
            action: btn.action,
            url: btn.url ?? null,
            next: btn.action === 'next' ? (edge?.target ?? null) : null,
          };
        }),
      };
    }
    case 'question_information': {
      const data = node.data as InformationNodeData;
      const nextEdge = outEdges[0];
      return {
        id: baseId,
        type: 'information',
        titleKey: data.titleKey,
        contentKey: data.contentKey,
        continueButtonKey: data.continueButtonKey ?? 'common.continue',
        next: nextEdge?.target ?? null,
      };
    }
    case 'question_modal': {
      const data = node.data as ModalNodeData;
      const nextEdge = outEdges[0];
      return {
        id: baseId,
        type: 'modal',
        questionKey: data.questionKey,
        descriptionKey: data.descriptionKey ?? null,
        submitButtonKey: data.submitButtonKey ?? 'common.submit',
        next: nextEdge?.target ?? null,
        fields: data.fields.map((f) => ({
          id: f.id,
          labelKey: f.labelKey,
          placeholder: f.placeholder ?? null,
          required: f.required,
          validation: f.validation,
          validationPattern: f.validationPattern ?? null,
          validationMessage: f.validationMessage ?? null,
        })),
      };
    }
    default:
      return null;
  }
}

export function buildFlowJSON(project: Project) {
  const nodesExport = project.nodes
    .map((n) => buildNodeExport(n, project.edges))
    .filter(Boolean);

  return {
    meta: {
      name: project.meta.name,
      version: project.meta.version,
      exportedAt: new Date().toISOString(),
    },
    flow: nodesExport,
    supportedLocales: project.locales.map((l) => ({ code: l.code, name: l.name })),
  };
}

export async function exportAsZip(project: Project) {
  const zip = new JSZip();

  // Main flow JSON
  const flowJSON = buildFlowJSON(project);
  zip.file('flow.json', JSON.stringify(flowJSON, null, 2));

  // Locale files
  const localesFolder = zip.folder('locales')!;
  for (const locale of project.locales) {
    localesFolder.file(`${locale.code}.json`, JSON.stringify(locale.entries, null, 2));
  }

  // Project save file (includes positions, full editor state)
  zip.file('project.ticketflow.json', JSON.stringify(project, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const safeName = project.meta.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  saveAs(blob, `${safeName}_export.zip`);
}

export function saveProjectFile(project: Project) {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json',
  });
  const safeName = project.meta.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  saveAs(blob, `${safeName}.ticketflow.json`);
}

export function loadProjectFromFile(): Promise<Project> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.ticketflow.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const project = JSON.parse(ev.target?.result as string) as Project;
          resolve(project);
        } catch {
          reject(new Error('Invalid project file'));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}
