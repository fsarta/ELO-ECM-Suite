import type {
  AuditEntry,
  DashboardSummaryResponse,
  DocumentComment,
  DocumentDetail,
  DocumentState,
  DocumentVersion,
  ExplorerDocument,
  GlobalSearchResponse,
  RepositoryContentResponse,
  RepositoryNode,
  RepositoryTreeNode,
  WorkflowSummary,
  WorkflowTask
} from "@ecm/shared";

interface DocumentEntity extends DocumentDetail {
  deleted: boolean;
}

interface RepositoryFilters {
  query?: string;
  state?: DocumentState;
  onlyMine?: boolean;
  onlyDueSoon?: boolean;
  user?: string;
}

const DEFAULT_USER = "Mario Rossi";

const formatSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const nowIso = (): string => new Date().toISOString();

const createVersion = (
  id: string,
  version: string,
  author: string,
  comment: string,
  sizeBytes: number,
  createdAt: string,
  isCurrent = false
): DocumentVersion => ({
  id,
  version,
  author,
  comment,
  sizeBytes,
  sizeLabel: formatSize(sizeBytes),
  createdAt,
  isCurrent
});

const createAudit = (user: string, event: string, details: string, createdAt = nowIso()): AuditEntry => ({
  id: `audit-${Math.random().toString(36).slice(2, 10)}`,
  createdAt,
  user,
  event,
  details
});

const createComment = (author: string, message: string, createdAt = nowIso()): DocumentComment => ({
  id: `comment-${Math.random().toString(36).slice(2, 10)}`,
  author,
  createdAt,
  message
});

const buildInitialNodes = (): RepositoryNode[] => [
  { id: "favorites", name: "Preferiti", parentId: null, type: "virtual", icon: "star" },
  { id: "recent", name: "Recenti", parentId: null, type: "virtual", icon: "clock" },
  { id: "tasks", name: "Attivita'", parentId: null, type: "virtual", icon: "check-square" },
  { id: "searches", name: "Ricerche Salvate", parentId: null, type: "virtual", icon: "search" },
  { id: "trash", name: "Cestino", parentId: null, type: "virtual", icon: "trash" },
  { id: "repo-root", name: "Repository", parentId: null, type: "repository", icon: "folder-root" },
  { id: "repo-suppliers", name: "Fornitori", parentId: "repo-root", type: "folder", icon: "folder" },
  { id: "repo-contracts-2025", name: "Contratti 2025", parentId: "repo-suppliers", type: "folder", icon: "folder" },
  { id: "repo-invoices-2026", name: "Fatture 2026", parentId: "repo-suppliers", type: "folder", icon: "folder" },
  { id: "repo-clients", name: "Clienti", parentId: "repo-root", type: "folder", icon: "folder" },
  { id: "repo-hr", name: "HR", parentId: "repo-root", type: "folder", icon: "folder" },
  { id: "repo-archive", name: "Archivio", parentId: "repo-root", type: "folder", icon: "archive" }
];

const workflowFor = (processName: string, assignedTo: string, dueAt: string | null): WorkflowSummary => ({
  activeInstanceId: `wf-${Math.random().toString(36).slice(2, 9)}`,
  activeProcessName: processName,
  currentTask: {
    id: `task-${Math.random().toString(36).slice(2, 9)}`,
    processName,
    taskName: "REVISIONE",
    assignedTo,
    dueAt,
    status: dueAt && new Date(dueAt).getTime() < Date.now() ? "OVERDUE" : "PENDING"
  },
  history: []
});

const noWorkflow = (): WorkflowSummary => ({
  activeInstanceId: null,
  activeProcessName: null,
  currentTask: null,
  history: []
});

const createDoc = (input: {
  id: string;
  nodeId: string;
  name: string;
  mimeType: string;
  className: string;
  description: string;
  version: string;
  state: DocumentState;
  modifiedAt: string;
  author: string;
  sizeBytes: number;
  tags: string[];
  workflow: WorkflowSummary;
  metadata: Record<string, string>;
  createdAt: string;
  createdBy: string;
  isFavorite?: boolean;
  inCheckoutBy?: string | null;
  comments?: DocumentComment[];
}): DocumentEntity => {
  const versionHistory: DocumentVersion[] = [
    createVersion(`${input.id}-v1`, "1.0", input.createdBy, "Prima versione", Math.floor(input.sizeBytes * 0.8), input.createdAt),
    createVersion(`${input.id}-v2`, input.version, input.author, "Ultima revisione", input.sizeBytes, input.modifiedAt, true)
  ];

  return {
    id: input.id,
    nodeId: input.nodeId,
    name: input.name,
    mimeType: input.mimeType,
    className: input.className,
    description: input.description,
    version: input.version,
    state: input.state,
    modifiedAt: input.modifiedAt,
    author: input.author,
    sizeBytes: input.sizeBytes,
    sizeLabel: formatSize(input.sizeBytes),
    tags: input.tags,
    isFavorite: input.isFavorite ?? false,
    hasWorkflow: input.workflow.currentTask !== null,
    inCheckoutBy: input.inCheckoutBy ?? null,
    repositoryPath: [],
    createdAt: input.createdAt,
    createdBy: input.createdBy,
    metadata: input.metadata,
    versions: versionHistory,
    workflow: input.workflow,
    comments: input.comments ?? [createComment(input.author, "Documento importato e classificato.")],
    audit: [
      createAudit(input.createdBy, "DOC_CREATE", "Documento creato", input.createdAt),
      createAudit(input.author, "DOC_UPDATE", "Aggiornati metadati", input.modifiedAt)
    ],
    deleted: input.state === "DELETED"
  };
};

const buildInitialDocuments = (): DocumentEntity[] => [
  createDoc({
    id: "doc-contract-abc",
    nodeId: "repo-contracts-2025",
    name: "Contratto_ABC_v2_1.pdf",
    mimeType: "application/pdf",
    className: "CONTRATTO",
    description: "Contratto quadro con fornitore ABC.",
    version: "2.1",
    state: "APPROVED",
    modifiedAt: "2026-02-20T09:40:00.000Z",
    author: "Laura Bianchi",
    sizeBytes: 2_450_000,
    tags: ["legale", "fornitori", "2026"],
    workflow: noWorkflow(),
    metadata: {
      Fornitore: "ABC Srl",
      Importo: "50000",
      Scadenza: "2026-12-31"
    },
    createdAt: "2026-02-10T08:15:00.000Z",
    createdBy: "Mario Rossi",
    isFavorite: true
  }),
  createDoc({
    id: "doc-contract-xyz",
    nodeId: "repo-contracts-2025",
    name: "Contratto_XYZ_revisione.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    className: "CONTRATTO",
    description: "Bozza contratto fornitore XYZ.",
    version: "1.4",
    state: "IN_REVIEW",
    modifiedAt: "2026-02-27T16:20:00.000Z",
    author: "Mario Rossi",
    sizeBytes: 1_240_000,
    tags: ["bozza", "urgente"],
    workflow: workflowFor("Approvazione Contratto", "Laura Bianchi", "2026-03-03T16:00:00.000Z"),
    metadata: {
      Fornitore: "XYZ Spa",
      Importo: "82000",
      Scadenza: "2027-01-31"
    },
    createdAt: "2026-02-12T10:00:00.000Z",
    createdBy: "Mario Rossi"
  }),
  createDoc({
    id: "doc-invoice-0234",
    nodeId: "repo-invoices-2026",
    name: "Fattura_0234.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    className: "FATTURA",
    description: "Fattura servizi Q1.",
    version: "1.1",
    state: "DRAFT",
    modifiedAt: "2026-02-26T13:10:00.000Z",
    author: "Giulia Verdi",
    sizeBytes: 884_000,
    tags: ["contabilita", "q1"],
    workflow: noWorkflow(),
    metadata: {
      Fornitore: "ABC Srl",
      Numero: "0234",
      Data: "2026-02-25"
    },
    createdAt: "2026-02-25T13:10:00.000Z",
    createdBy: "Giulia Verdi"
  }),
  createDoc({
    id: "doc-client-onboarding",
    nodeId: "repo-clients",
    name: "Onboarding_Cliente_Rossi.pdf",
    mimeType: "application/pdf",
    className: "VERBALE",
    description: "Checklist onboarding cliente Rossi.",
    version: "1.0",
    state: "APPROVED",
    modifiedAt: "2026-02-18T11:00:00.000Z",
    author: "Luca Verdi",
    sizeBytes: 640_000,
    tags: ["clienti"],
    workflow: noWorkflow(),
    metadata: {
      Cliente: "Rossi Srl",
      Area: "Commerciale"
    },
    createdAt: "2026-02-18T11:00:00.000Z",
    createdBy: "Luca Verdi"
  }),
  createDoc({
    id: "doc-hr-policy",
    nodeId: "repo-hr",
    name: "Policy_Ferie_2026.pdf",
    mimeType: "application/pdf",
    className: "POLICY",
    description: "Policy ferie e permessi 2026.",
    version: "3.0",
    state: "ARCHIVED",
    modifiedAt: "2026-01-30T08:00:00.000Z",
    author: "Sara Neri",
    sizeBytes: 1_030_000,
    tags: ["hr", "policy"],
    workflow: noWorkflow(),
    metadata: {
      Dipartimento: "HR",
      Validita: "2026"
    },
    createdAt: "2026-01-10T08:00:00.000Z",
    createdBy: "Sara Neri"
  }),
  createDoc({
    id: "doc-trash-old",
    nodeId: "trash",
    name: "Vecchio_Contratto_2019.pdf",
    mimeType: "application/pdf",
    className: "CONTRATTO",
    description: "Documento obsoleto in cestino.",
    version: "1.0",
    state: "DELETED",
    modifiedAt: "2026-02-15T09:00:00.000Z",
    author: "Mario Rossi",
    sizeBytes: 720_000,
    tags: ["legacy"],
    workflow: noWorkflow(),
    metadata: {
      Fornitore: "Old Co",
      MotivoEliminazione: "Obsoleto"
    },
    createdAt: "2019-03-20T09:00:00.000Z",
    createdBy: "Mario Rossi"
  })
];

const matchesQuery = (doc: DocumentEntity, query: string): boolean => {
  if (!query.trim()) {
    return true;
  }
  const q = query.toLowerCase();
  const metadataValues = Object.values(doc.metadata).join(" ").toLowerCase();
  return (
    doc.name.toLowerCase().includes(q) ||
    doc.className.toLowerCase().includes(q) ||
    doc.description.toLowerCase().includes(q) ||
    doc.tags.some((tag) => tag.toLowerCase().includes(q)) ||
    metadataValues.includes(q)
  );
};

export class EcmStore {
  private readonly nodes: RepositoryNode[];
  private readonly documents: DocumentEntity[];

  public constructor() {
    this.nodes = buildInitialNodes();
    this.documents = buildInitialDocuments();
    this.hydrateRepositoryPaths();
  }

  private hydrateRepositoryPaths(): void {
    for (const doc of this.documents) {
      const path = this.getPathLabels(doc.nodeId);
      doc.repositoryPath = path;
      doc.sizeLabel = formatSize(doc.sizeBytes);
      doc.hasWorkflow = doc.workflow.currentTask !== null;
    }
  }

  private findNode(id: string): RepositoryNode | undefined {
    return this.nodes.find((node) => node.id === id);
  }

  private getPathNodes(nodeId: string): RepositoryNode[] {
    const path: RepositoryNode[] = [];
    let current: RepositoryNode | undefined = this.findNode(nodeId);
    while (current) {
      path.unshift(current);
      current = current.parentId ? this.findNode(current.parentId) : undefined;
    }
    return path;
  }

  private getPathLabels(nodeId: string): string[] {
    return this.getPathNodes(nodeId).map((node) => node.name);
  }

  private toExplorerDocument(entity: DocumentEntity): ExplorerDocument {
    return {
      id: entity.id,
      nodeId: entity.nodeId,
      name: entity.name,
      mimeType: entity.mimeType,
      className: entity.className,
      description: entity.description,
      version: entity.version,
      state: entity.state,
      modifiedAt: entity.modifiedAt,
      author: entity.author,
      sizeBytes: entity.sizeBytes,
      sizeLabel: formatSize(entity.sizeBytes),
      tags: [...entity.tags],
      isFavorite: entity.isFavorite,
      hasWorkflow: entity.workflow.currentTask !== null,
      inCheckoutBy: entity.inCheckoutBy
    };
  }

  private toTreeNode(node: RepositoryNode): RepositoryTreeNode {
    const children = this.nodes.filter((candidate) => candidate.parentId === node.id).map((candidate) => this.toTreeNode(candidate));
    return {
      ...node,
      path: this.getPathLabels(node.id),
      unreadCount: node.id === "tasks" ? this.getMyTasks(DEFAULT_USER).filter((task) => task.status !== "DONE").length : node.unreadCount,
      children
    };
  }

  private currentVersion(doc: DocumentEntity): DocumentVersion {
    const current = doc.versions.find((version) => version.isCurrent);
    if (!current) {
      const fallback = doc.versions.at(-1);
      if (!fallback) {
        throw new Error(`Document ${doc.id} has no versions`);
      }
      return fallback;
    }
    return current;
  }

  public getTree(): RepositoryTreeNode[] {
    return this.nodes.filter((node) => node.parentId === null).map((node) => this.toTreeNode(node));
  }

  public getRepositoryContent(nodeId: string, filters: RepositoryFilters): RepositoryContentResponse | null {
    const node = this.findNode(nodeId);
    if (!node) {
      return null;
    }

    const childFolders = this.nodes.filter((candidate) => candidate.parentId === nodeId && candidate.type !== "virtual");
    let documents = this.documents.filter((doc) => doc.nodeId === nodeId);

    if (nodeId === "recent") {
      documents = [...this.documents]
        .filter((doc) => !doc.deleted)
        .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
        .slice(0, 20);
    }

    if (nodeId === "favorites") {
      documents = this.documents.filter((doc) => doc.isFavorite && !doc.deleted);
    }

    if (nodeId === "tasks") {
      const myTaskDocIds = this.documents
        .filter((doc) => doc.workflow.currentTask?.assignedTo === (filters.user ?? DEFAULT_USER))
        .map((doc) => doc.id);
      documents = this.documents.filter((doc) => myTaskDocIds.includes(doc.id));
    }

    if (nodeId !== "trash") {
      documents = documents.filter((doc) => !doc.deleted);
    }

    if (filters.state) {
      documents = documents.filter((doc) => doc.state === filters.state);
    }

    if (filters.onlyMine) {
      documents = documents.filter((doc) => doc.author === (filters.user ?? DEFAULT_USER));
    }

    if (filters.onlyDueSoon) {
      const soonMs = Date.now() + 1000 * 60 * 60 * 24 * 30;
      documents = documents.filter((doc) => {
        const due = doc.metadata.Scadenza;
        if (!due) {
          return false;
        }
        const dueTime = new Date(due).getTime();
        return !Number.isNaN(dueTime) && dueTime <= soonMs;
      });
    }

    if (filters.query) {
      documents = documents.filter((doc) => matchesQuery(doc, filters.query ?? ""));
    }

    return {
      node,
      breadcrumbs: this.getPathNodes(nodeId),
      childFolders,
      documents: documents
        .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
        .map((doc) => this.toExplorerDocument(doc))
    };
  }

  public getDocument(id: string): DocumentDetail | null {
    const doc = this.documents.find((candidate) => candidate.id === id);
    if (!doc) {
      return null;
    }

    return structuredClone({
      ...doc,
      sizeLabel: formatSize(doc.sizeBytes),
      repositoryPath: this.getPathLabels(doc.nodeId)
    });
  }

  public patchDocument(
    id: string,
    payload: Partial<Pick<DocumentDetail, "name" | "description" | "state" | "metadata" | "tags">>,
    actor: string
  ): DocumentDetail | null {
    const doc = this.documents.find((candidate) => candidate.id === id);
    if (!doc) {
      return null;
    }

    if (payload.name !== undefined) {
      doc.name = payload.name;
    }
    if (payload.description !== undefined) {
      doc.description = payload.description;
    }
    if (payload.state !== undefined) {
      doc.state = payload.state;
      doc.deleted = payload.state === "DELETED";
      if (doc.deleted) {
        doc.nodeId = "trash";
      }
    }
    if (payload.metadata !== undefined) {
      doc.metadata = { ...payload.metadata };
    }
    if (payload.tags !== undefined) {
      doc.tags = [...payload.tags];
    }

    doc.modifiedAt = nowIso();
    doc.author = actor;
    doc.audit.unshift(createAudit(actor, "DOC_UPDATE", "Aggiornati metadati o stato.", doc.modifiedAt));
    this.hydrateRepositoryPaths();
    return this.getDocument(id);
  }

  public addComment(id: string, actor: string, message: string): DocumentDetail | null {
    const doc = this.documents.find((candidate) => candidate.id === id);
    if (!doc) {
      return null;
    }
    const comment = createComment(actor, message);
    doc.comments.push(comment);
    doc.modifiedAt = comment.createdAt;
    doc.author = actor;
    doc.audit.unshift(createAudit(actor, "DOC_COMMENT", "Aggiunto commento.", comment.createdAt));
    return this.getDocument(id);
  }

  public checkoutDocument(id: string, actor: string): DocumentDetail | null {
    const doc = this.documents.find((candidate) => candidate.id === id);
    if (!doc) {
      return null;
    }
    doc.inCheckoutBy = actor;
    doc.state = "IN_REVIEW";
    doc.modifiedAt = nowIso();
    doc.author = actor;
    doc.audit.unshift(createAudit(actor, "DOC_CHECKOUT", "Documento preso in modifica.", doc.modifiedAt));
    return this.getDocument(id);
  }

  public checkinDocument(id: string, actor: string, comment: string): DocumentDetail | null {
    const doc = this.documents.find((candidate) => candidate.id === id);
    if (!doc) {
      return null;
    }

    for (const version of doc.versions) {
      version.isCurrent = false;
    }

    const [majorRaw, minorRaw] = doc.version.split(".");
    const major = Number.parseInt(majorRaw ?? "1", 10);
    const minor = Number.parseInt(minorRaw ?? "0", 10);
    const nextVersion = `${Number.isNaN(major) ? 1 : major}.${Number.isNaN(minor) ? 0 : minor + 1}`;
    const createdAt = nowIso();

    const createdVersion = createVersion(
      `${id}-v${doc.versions.length + 1}`,
      nextVersion,
      actor,
      comment,
      doc.sizeBytes,
      createdAt,
      true
    );

    doc.versions.unshift(createdVersion);
    doc.version = nextVersion;
    doc.inCheckoutBy = null;
    doc.modifiedAt = createdAt;
    doc.author = actor;
    doc.audit.unshift(createAudit(actor, "DOC_CHECKIN", `Nuova versione ${nextVersion}.`, createdAt));
    return this.getDocument(id);
  }

  public deleteDocument(id: string, actor: string): DocumentDetail | null {
    const doc = this.documents.find((candidate) => candidate.id === id);
    if (!doc) {
      return null;
    }

    doc.deleted = true;
    doc.state = "DELETED";
    doc.nodeId = "trash";
    doc.modifiedAt = nowIso();
    doc.author = actor;
    doc.audit.unshift(createAudit(actor, "DOC_DELETE", "Documento spostato nel cestino.", doc.modifiedAt));
    this.hydrateRepositoryPaths();
    return this.getDocument(id);
  }

  public restoreDocument(id: string, actor: string): DocumentDetail | null {
    const doc = this.documents.find((candidate) => candidate.id === id);
    if (!doc) {
      return null;
    }

    doc.deleted = false;
    doc.state = "DRAFT";
    doc.nodeId = "repo-archive";
    doc.modifiedAt = nowIso();
    doc.author = actor;
    doc.audit.unshift(createAudit(actor, "DOC_RESTORE", "Documento ripristinato dal cestino.", doc.modifiedAt));
    this.hydrateRepositoryPaths();
    return this.getDocument(id);
  }

  public searchGlobal(query: string): GlobalSearchResponse {
    const trimmed = query.trim();
    const documents = this.documents
      .filter((doc) => !doc.deleted)
      .filter((doc) => matchesQuery(doc, trimmed))
      .slice(0, 20)
      .map((doc) => this.toExplorerDocument(doc));

    const repositories = this.nodes
      .filter((node) => node.type !== "virtual")
      .filter((node) => node.name.toLowerCase().includes(trimmed.toLowerCase()))
      .slice(0, 10);

    return {
      query: trimmed,
      documents,
      repositories
    };
  }

  public getMyTasks(user: string): WorkflowTask[] {
    const result: WorkflowTask[] = [];
    for (const doc of this.documents) {
      if (doc.deleted || !doc.workflow.currentTask) {
        continue;
      }
      if (doc.workflow.currentTask.assignedTo !== user) {
        continue;
      }
      result.push(structuredClone(doc.workflow.currentTask));
    }

    return result.sort((a, b) => {
      if (!a.dueAt) {
        return 1;
      }
      if (!b.dueAt) {
        return -1;
      }
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });
  }

  public dashboardSummary(user: string): DashboardSummaryResponse {
    const activeWorkflows = this.documents.filter((doc) => doc.workflow.currentTask !== null && !doc.deleted).length;
    const documentsInReview = this.documents.filter((doc) => doc.state === "IN_REVIEW" && !doc.deleted).length;
    const tasksDueToday = this.getMyTasks(user).filter((task) => {
      if (!task.dueAt) {
        return false;
      }
      const due = new Date(task.dueAt);
      const now = new Date();
      return (
        due.getUTCFullYear() === now.getUTCFullYear() &&
        due.getUTCMonth() === now.getUTCMonth() &&
        due.getUTCDate() === now.getUTCDate()
      );
    }).length;

    const recentDocuments = [...this.documents]
      .filter((doc) => !doc.deleted)
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
      .slice(0, 8)
      .map((doc) => this.toExplorerDocument(doc));

    return {
      tasksDueToday,
      activeWorkflows,
      documentsInReview,
      recentDocuments
    };
  }
}

export const createStore = (): EcmStore => new EcmStore();

