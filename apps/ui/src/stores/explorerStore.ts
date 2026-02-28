import { create } from "zustand";

export type ViewMode = "details" | "list" | "icons" | "cards";

interface ExplorerState {
  showTree: boolean;
  showDetail: boolean;
  dualPane: boolean;
  viewMode: ViewMode;
  selectedDocumentId: string | null;
  setSelectedDocument: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleTree: () => void;
  toggleDetail: () => void;
  toggleDualPane: () => void;
}

export const useExplorerStore = create<ExplorerState>((set) => ({
  showTree: true,
  showDetail: true,
  dualPane: false,
  viewMode: "details",
  selectedDocumentId: "doc-1",
  setSelectedDocument: (id) => set({ selectedDocumentId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleTree: () => set((state) => ({ showTree: !state.showTree })),
  toggleDetail: () => set((state) => ({ showDetail: !state.showDetail })),
  toggleDualPane: () => set((state) => ({ dualPane: !state.dualPane }))
}));

