# FlowForge — Discord Ticket System Flow Editor

A visual node editor for building and exporting Discord bot ticket question flows.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:5173
```

## Build for Production

```bash
npm run build
# Output in ./dist/
```

## Features

### Node Types
| Node | Description |
|------|-------------|
| **Start** | Entry point of the flow |
| **End** | Terminal node that triggers the ticket opening |
| **Selection** | Dropdown/list of predefined options (supports dynamic sources) |
| **Button** | Clickable buttons that go to next node or open a URL |
| **Information** | Displays text with a continue button |
| **Modal** | Pop-up form with field validation (email, URL, number, regex) |

### Canvas Controls
- **Pan**: Click and drag the canvas background
- **Zoom**: Mouse scroll wheel
- **Connect nodes**: Drag from a source handle (circle on the right/bottom of a node) to a target handle (top of another node)
- **Select node**: Click any node to open Properties panel
- **Delete node**: Select then press `Delete` key, or use the Delete button in Properties
- **Delete edge**: Click the edge to select it, then press `Delete`

### Toolbar
- **New** — Start a fresh project (discards current unsaved changes)
- **Open** — Load a `.ticketflow.json` project file
- **Save** — Download the project as `.ticketflow.json`
- **Validation badge** — Shows error/warning count; click to toggle validation panel
- **Langs** — Opens the Localization Manager
- **Export** — Opens the Export dialog

### Localization Manager
- Add new languages with a code (e.g. `fr`) and name (e.g. `French`)
- All localization keys from your nodes appear as rows
- Yellow dot = missing translation
- Inline editing — click any translation cell and type
- Keys are auto-populated when new languages are added
- Safe to delete non-English languages

### Export Dialog
- **Full Export (ZIP)** — Downloads a `.zip` containing:
  - `flow.json` — Bot-ready flow definition
  - `locales/en.json`, `locales/fr.json`, etc. — Translation files
  - `project.ticketflow.json` — Full project save file
- **Save Project** — Just the editor save file (for reloading later)
- **JSON Preview** tab — See the exported `flow.json` before downloading

### Validation
The editor checks for:
- Missing Start or End nodes
- Unreachable nodes (no incoming connections)
- Loose ends (options/buttons with no outgoing connection)
- Missing localization keys across all languages
- Empty localization entries
- Modal fields with regex validation but no pattern

Click any issue in the Validation panel to jump to the affected node.

## Project File Format

The `.ticketflow.json` save file contains:

```json
{
  "meta": { "name": "...", "version": "1.0.0", "createdAt": "...", "updatedAt": "..." },
  "nodes": [...],
  "edges": [...],
  "locales": [
    { "code": "en", "name": "English", "entries": { "question.key": "What is your name?" } }
  ]
}
```

## Bot Integration

After exporting, your bot receives:

**`flow.json`:**
```json
{
  "flow": [
    { "id": "start-1", "type": "start", "next": "question_selection-abc" },
    {
      "id": "question_selection-abc",
      "type": "selection",
      "questionKey": "question.language",
      "options": [
        { "id": "opt-1", "labelKey": "lang.english", "value": "en", "next": "question_modal-xyz" },
        { "id": "opt-2", "labelKey": "lang.french", "value": "fr", "next": "info.slow-support" }
      ]
    }
  ]
}
```

**`locales/en.json`:**
```json
{
  "question.language": "Please select your language",
  "lang.english": "English",
  "lang.french": "Français"
}
```

## Tech Stack

- **React 18** + **TypeScript**
- **ReactFlow** — node graph canvas
- **Zustand** + **Immer** — state management
- **JSZip** + **file-saver** — file export
- **Vite** — build tooling
