import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { v4 as uuidv4 } from 'uuid';
import type {
  WhiteboardElement,
  WhiteboardStageState,
  RectElement,
  CircleElement,
  TextElement,
  StickyElement,
  ArrowElement,
} from '@/types/whiteboard';

interface WhiteboardStore {
  elements: WhiteboardElement[];
  selectedIds: string[];
  stage: WhiteboardStageState;
  editingTextId: string | null;
  tool: 'select' | 'rect' | 'circle' | 'text' | 'sticky' | 'arrow' | 'image';

  // Hydration
  setElements: (elements: WhiteboardElement[]) => void;

  // Element CRUD
  addElement: (element: WhiteboardElement) => void;
  updateElement: (id: string, patch: Partial<WhiteboardElement>) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;

  // Selection
  setSelected: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  clearSelection: () => void;

  // Stage
  setStage: (patch: Partial<WhiteboardStageState>) => void;
  resetStage: () => void;

  // Inline text editing
  setEditingTextId: (id: string | null) => void;

  // Tool
  setTool: (tool: WhiteboardStore['tool']) => void;

  // Z-order
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
}

// --- factory helpers ---
export function makeRect(x: number, y: number): RectElement {
  return {
    id: uuidv4(), type: 'rect', x, y, rotation: 0, opacity: 1,
    zIndex: 0, width: 200, height: 120,
    fill: '#3b82f6', stroke: 'transparent', strokeWidth: 0, cornerRadius: 8,
  };
}
export function makeCircle(x: number, y: number): CircleElement {
  return {
    id: uuidv4(), type: 'circle', x, y, rotation: 0, opacity: 1,
    zIndex: 0, radiusX: 70, radiusY: 70,
    fill: '#8b5cf6', stroke: 'transparent', strokeWidth: 0,
  };
}
export function makeText(x: number, y: number): TextElement {
  return {
    id: uuidv4(), type: 'text', x, y, rotation: 0, opacity: 1,
    zIndex: 0, text: 'Texto', fontSize: 20, fontFamily: 'Inter',
    fontStyle: 'normal', fill: '#18181b', align: 'left', width: 0,
  };
}
export function makeSticky(x: number, y: number): StickyElement {
  return {
    id: uuidv4(), type: 'sticky', x, y, rotation: 0, opacity: 1,
    zIndex: 0, text: 'Nota...', width: 200, height: 160,
    fill: '#fef08a', textColor: '#1c1917', fontSize: 15,
  };
}
export function makeArrow(x: number, y: number): ArrowElement {
  return {
    id: uuidv4(), type: 'arrow', x, y, rotation: 0, opacity: 1,
    zIndex: 0, points: [0, 0, 160, 0],
    stroke: '#71717a', strokeWidth: 2, fill: '#71717a',
  };
}

export const useWhiteboardStore = create<WhiteboardStore>((set) => ({
  elements: [],
  selectedIds: [],
  stage: { x: 0, y: 0, scale: 1 },
  editingTextId: null,
  tool: 'select',

  setElements: (elements) => set({ elements }),

  addElement: (element) =>
    set((s) => ({
      elements: [...s.elements, { ...element, zIndex: s.elements.length }],
      selectedIds: [element.id],
      tool: 'select',
    })),

  updateElement: (id, patch) =>
    set((s) => ({
      elements: s.elements.map((el) =>
        el.id === id ? ({ ...el, ...patch } as WhiteboardElement) : el
      ),
    })),

  deleteSelected: () =>
    set((s) => ({
      elements: s.elements.filter((el) => !s.selectedIds.includes(el.id)),
      selectedIds: [],
    })),

  duplicateSelected: () =>
    set((s) => {
      const copies = s.elements
        .filter((el) => s.selectedIds.includes(el.id))
        .map((el) => ({ ...el, id: uuidv4(), x: el.x + 20, y: el.y + 20 }));
      return {
        elements: [...s.elements, ...copies],
        selectedIds: copies.map((c) => c.id),
      };
    }),

  setSelected: (ids) => set({ selectedIds: ids }),
  addToSelection: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [], editingTextId: null }),

  setStage: (patch) => set((s) => ({ stage: { ...s.stage, ...patch } })),
  resetStage: () => set({ stage: { x: 0, y: 0, scale: 1 } }),

  setEditingTextId: (id) => set({ editingTextId: id }),

  setTool: (tool) => set({ tool, selectedIds: [] }),

  bringForward: (id) =>
    set((s) => {
      const idx = s.elements.findIndex((el) => el.id === id);
      if (idx < 0 || idx === s.elements.length - 1) return s;
      const arr = [...s.elements];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return { elements: arr.map((el, i) => ({ ...el, zIndex: i })) };
    }),

  sendBackward: (id) =>
    set((s) => {
      const idx = s.elements.findIndex((el) => el.id === id);
      if (idx <= 0) return s;
      const arr = [...s.elements];
      [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
      return { elements: arr.map((el, i) => ({ ...el, zIndex: i })) };
    }),
}));

// Selector helpers (stable references)
export const selectElements = (s: WhiteboardStore) => s.elements;
export const selectSelectedIds = (s: WhiteboardStore) => s.selectedIds;
export const selectStage = (s: WhiteboardStore) => s.stage;
export const selectTool = (s: WhiteboardStore) => s.tool;

// Derive selected elements — useShallow prevents infinite loop from filter() new-array refs
export function useSelectedElements() {
  return useWhiteboardStore(
    useShallow((s) => s.elements.filter((el) => s.selectedIds.includes(el.id)))
  );
}

// Derive first selected element (for style panel)
export function useFirstSelected() {
  return useWhiteboardStore(
    useShallow((s) => s.elements.find((el) => s.selectedIds[0] === el.id) ?? null)
  );
}
