import { create } from "zustand";
import type {
  DashboardSummaryResponse,
  DocumentDetail,
  DocumentState,
  ExplorerDocument,
  GlobalSearchResponse,
  RepositoryNode,
  RepositoryTreeNode,
  WorkflowTask
} from "@ecm/shared";
import { ecmApi } from "../api/ecmApi";

export type ViewMode = "details" | "list" | "icons" | "cards" | "columns";

export interface ExplorerTab {
  id: string;
  nodeId: string;
  title: string;
  closable: boolean;
}

interface OpenNodeOptions {
  addTab?: boolean;
  keepSelection?: boolean;
}

interface ExplorerState {
  userName: string;
  showTree: boolean;
  showDetail: boolean;
  dualPane: boolean;
  viewMode: ViewMode;
  tree: RepositoryTreeNode[];
  currentNodeId: string | null;
  breadcrumbs: RepositoryNode[];
  childFolders: RepositoryNode[];
  documents: ExplorerDocument[];
  selectedDocumentId: string | null;
  activeDocument: DocumentDetail | null;
  quickQuery: string;
  filterState: DocumentState | "ALL";
  onlyMine: boolean;
  onlyDueSoon: boolean;
  globalSearchOpen: boolean;
  globalSearchQuery: string;
  globalSearchResults: GlobalSearchResponse | null;
  tabs: ExplorerTab[];
  activeTabId: string | null;
  myTasks: WorkflowTask[];
  dashboard: DashboardSummaryResponse | null;
  isBootstrapping: boolean;
  isLoadingContent: boolean;
  error: string | null;
  lastAction: string | null;
  setLastAction: (message: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setQuickQuery: (value: string) => void;
  setFilterState: (value: DocumentState | "ALL") => void;
  toggleOnlyMine: () => void;
  toggleOnlyDueSoon: () => void;
  toggleTree: () => void;
  toggleDetail: () => void;
  toggleDualPane: () => void;
  loadInitial: () => Promise<void>;
  openNode: (nodeId: string, options?: OpenNodeOptions) => Promise<void>;
  refreshContent: () => Promise<void>;
  selectDocument: (documentId: string | null) => Promise<void>;
  patchDocument: (payload: Partial<Pick<DocumentDetail, "name" | "description" | "state" | "metadata" | "tags">>) => Promise<void>;
  checkoutDocument: () => Promise<void>;
  checkinDocument: (comment: string) => Promise<void>;
  addComment: (message: string) => Promise<void>;
  deleteDocument: () => Promise<void>;
  restoreDocument: () => Promise<void>;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
  runGlobalSearch: (query: string) => Promise<void>;
  activateTab: (tabId: string) => Promise<void>;
  closeTab: (tabId: string) => Promise<void>;
}

const flattenTree = (nodes: RepositoryTreeNode[]): RepositoryTreeNode[] => {
  const all: RepositoryTreeNode[] = [];
  for (const node of nodes) {
    all.push(node, ...flattenTree(node.children));
  }
  return all;
};

const findNodeById = (nodes: RepositoryTreeNode[], id: string): RepositoryTreeNode | undefined =>
  flattenTree(nodes).find((node) => node.id === id);

const defaultTabs = (): ExplorerTab[] => [
  {
    id: "tab-dashboard",
    nodeId: "repo-root",
    title: "Dashboard",
    closable: false
  },
  {
    id: "tab-tasks",
    nodeId: "tasks",
    title: "I miei task",
    closable: false
  }
];

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  userName: "Mario Rossi",
  showTree: true,
  showDetail: true,
  dualPane: false,
  viewMode: "details",
  tree: [],
  currentNodeId: null,
  breadcrumbs: [],
  childFolders: [],
  documents: [],
  selectedDocumentId: null,
  activeDocument: null,
  quickQuery: "",
  filterState: "ALL",
  onlyMine: false,
  onlyDueSoon: false,
  globalSearchOpen: false,
  globalSearchQuery: "",
  globalSearchResults: null,
  tabs: defaultTabs(),
  activeTabId: "tab-dashboard",
  myTasks: [],
  dashboard: null,
  isBootstrapping: false,
  isLoadingContent: false,
  error: null,
  lastAction: null,
  setLastAction: (message) => set({ lastAction: message }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setQuickQuery: (value) => set({ quickQuery: value }),
  setFilterState: (value) => set({ filterState: value }),
  toggleOnlyMine: () => set((state) => ({ onlyMine: !state.onlyMine })),
  toggleOnlyDueSoon: () => set((state) => ({ onlyDueSoon: !state.onlyDueSoon })),
  toggleTree: () => set((state) => ({ showTree: !state.showTree })),
  toggleDetail: () => set((state) => ({ showDetail: !state.showDetail })),
  toggleDualPane: () => set((state) => ({ dualPane: !state.dualPane })),

  loadInitial: async () => {
    set({
      isBootstrapping: true,
      error: null
    });

    try {
      const [tree, myTasks, dashboard] = await Promise.all([
        ecmApi.getTree(),
        ecmApi.myTasks(get().userName),
        ecmApi.dashboard(get().userName)
      ]);

      set({
        tree,
        myTasks,
        dashboard
      });

      const defaultNode = findNodeById(tree, "repo-contracts-2025")?.id ?? findNodeById(tree, "repo-root")?.id ?? null;
      if (defaultNode) {
        await get().openNode(defaultNode, {
          addTab: true
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Errore durante il bootstrap iniziale."
      });
    } finally {
      set({
        isBootstrapping: false
      });
    }
  },

  openNode: async (nodeId, options) => {
    const state = get();
    set({
      isLoadingContent: true,
      error: null
    });

    try {
      const content = await ecmApi.getRepositoryContent({
        nodeId,
        query: state.quickQuery,
        state: state.filterState,
        onlyMine: state.onlyMine,
        onlyDueSoon: state.onlyDueSoon,
        user: state.userName
      });

      let tabs = state.tabs;
      let activeTabId = state.activeTabId;

      if (options?.addTab) {
        const existing = tabs.find((tab) => tab.nodeId === nodeId);
        if (existing) {
          activeTabId = existing.id;
        } else {
          const nodeTitle = findNodeById(state.tree, nodeId)?.name ?? content.node.name;
          const newTab: ExplorerTab = {
            id: `tab-${nodeId}`,
            nodeId,
            title: nodeTitle,
            closable: true
          };
          tabs = [...tabs, newTab];
          activeTabId = newTab.id;
        }
      } else {
        const existing = tabs.find((tab) => tab.nodeId === nodeId);
        if (existing) {
          activeTabId = existing.id;
        }
      }

      const nextSelectedId =
        options?.keepSelection && state.selectedDocumentId && content.documents.some((doc) => doc.id === state.selectedDocumentId)
          ? state.selectedDocumentId
          : content.documents.at(0)?.id ?? null;

      set({
        currentNodeId: nodeId,
        breadcrumbs: content.breadcrumbs,
        childFolders: content.childFolders,
        documents: content.documents,
        selectedDocumentId: nextSelectedId,
        tabs,
        activeTabId
      });

      if (nextSelectedId) {
        const detail = await ecmApi.getDocument(nextSelectedId);
        set({
          activeDocument: detail
        });
      } else {
        set({
          activeDocument: null
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Errore durante il caricamento contenuti."
      });
    } finally {
      set({
        isLoadingContent: false
      });
    }
  },

  refreshContent: async () => {
    const currentNodeId = get().currentNodeId;
    if (!currentNodeId) {
      return;
    }
    await get().openNode(currentNodeId, { keepSelection: true });
  },

  selectDocument: async (documentId) => {
    set({
      selectedDocumentId: documentId,
      error: null
    });
    if (!documentId) {
      set({ activeDocument: null });
      return;
    }
    try {
      const detail = await ecmApi.getDocument(documentId);
      set({
        activeDocument: detail
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Errore durante il caricamento dettagli documento."
      });
    }
  },

  patchDocument: async (payload) => {
    const { selectedDocumentId, userName } = get();
    if (!selectedDocumentId) {
      return;
    }
    try {
      const updated = await ecmApi.patchDocument(selectedDocumentId, payload, userName);
      set({
        activeDocument: updated,
        lastAction: "Documento aggiornato."
      });
      await get().refreshContent();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Errore durante aggiornamento documento."
      });
    }
  },

  checkoutDocument: async () => {
    const { selectedDocumentId, userName } = get();
    if (!selectedDocumentId) {
      return;
    }
    try {
      const updated = await ecmApi.checkoutDocument(selectedDocumentId, userName);
      set({
        activeDocument: updated,
        lastAction: "Documento in check-out."
      });
      await get().refreshContent();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Errore durante check-out."
      });
    }
  },

  checkinDocument: async (comment) => {
    const { selectedDocumentId, userName } = get();
    if (!selectedDocumentId) {
      return;
    }
    try {
      const updated = await ecmApi.checkinDocument(selectedDocumentId, userName, comment);
      set({
        activeDocument: updated,
        lastAction: "Nuova versione caricata (check-in)."
      });
      await get().refreshContent();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Errore durante check-in."
      });
    }
  },

  addComment: async (message) => {
    const { selectedDocumentId, userName } = get();
    if (!selectedDocumentId || !message.trim()) {
      return;
    }
    try {
      const updated = await ecmApi.addComment(selectedDocumentId, userName, message.trim());
      set({
        activeDocument: updated,
        lastAction: "Commento aggiunto."
      });
      await get().refreshContent();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Errore durante inserimento commento."
      });
    }
  },

  deleteDocument: async () => {
    const { selectedDocumentId, userName } = get();
    if (!selectedDocumentId) {
      return;
    }
    try {
      const updated = await ecmApi.deleteDocument(selectedDocumentId, userName);
      set({
        activeDocument: updated,
        lastAction: "Documento spostato nel cestino."
      });
      await get().refreshContent();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Errore durante eliminazione documento."
      });
    }
  },

  restoreDocument: async () => {
    const { selectedDocumentId, userName } = get();
    if (!selectedDocumentId) {
      return;
    }
    try {
      const updated = await ecmApi.restoreDocument(selectedDocumentId, userName);
      set({
        activeDocument: updated,
        lastAction: "Documento ripristinato."
      });
      await get().refreshContent();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Errore durante ripristino documento."
      });
    }
  },

  openGlobalSearch: () => set({ globalSearchOpen: true }),
  closeGlobalSearch: () => set({ globalSearchOpen: false }),
  runGlobalSearch: async (query) => {
    set({
      globalSearchQuery: query
    });
    if (!query.trim()) {
      set({
        globalSearchResults: null
      });
      return;
    }
    try {
      const results = await ecmApi.searchGlobal(query);
      set({
        globalSearchResults: results
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Errore durante ricerca globale."
      });
    }
  },

  activateTab: async (tabId) => {
    const tab = get().tabs.find((candidate) => candidate.id === tabId);
    if (!tab) {
      return;
    }
    set({
      activeTabId: tabId
    });
    await get().openNode(tab.nodeId);
  },

  closeTab: async (tabId) => {
    const state = get();
    const tab = state.tabs.find((candidate) => candidate.id === tabId);
    if (!tab || !tab.closable) {
      return;
    }

    const nextTabs = state.tabs.filter((candidate) => candidate.id !== tabId);
    let nextActiveTabId = state.activeTabId;
    if (state.activeTabId === tabId) {
      const fallback = nextTabs.at(-1);
      nextActiveTabId = fallback?.id ?? null;
    }

    set({
      tabs: nextTabs,
      activeTabId: nextActiveTabId
    });

    if (nextActiveTabId) {
      const fallbackTab = nextTabs.find((candidate) => candidate.id === nextActiveTabId);
      if (fallbackTab) {
        await get().openNode(fallbackTab.nodeId);
      }
    }
  }
}));
