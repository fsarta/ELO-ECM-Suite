export type DocumentState =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "ARCHIVED"
  | "DELETED";

export type NodeType = "repository" | "folder" | "virtual";

export interface ExplorerDocument {
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
  sizeLabel: string;
  tags: string[];
  isFavorite: boolean;
  hasWorkflow: boolean;
  inCheckoutBy: string | null;
}

export interface RepositoryNode {
  id: string;
  name: string;
  parentId: string | null;
  type: NodeType;
  icon?: string;
  unreadCount?: number;
}

export interface RepositoryTreeNode extends RepositoryNode {
  children: RepositoryTreeNode[];
  path: string[];
}

export interface DocumentVersion {
  id: string;
  version: string;
  createdAt: string;
  author: string;
  comment: string;
  sizeBytes: number;
  sizeLabel: string;
  isCurrent: boolean;
}

export interface WorkflowTask {
  id: string;
  processName: string;
  taskName: string;
  assignedTo: string;
  dueAt: string | null;
  status: "PENDING" | "DONE" | "OVERDUE";
}

export interface WorkflowSummary {
  activeInstanceId: string | null;
  activeProcessName: string | null;
  currentTask: WorkflowTask | null;
  history: Array<{
    id: string;
    processName: string;
    result: string;
    endedAt: string;
  }>;
}

export interface DocumentComment {
  id: string;
  author: string;
  createdAt: string;
  message: string;
}

export interface AuditEntry {
  id: string;
  createdAt: string;
  user: string;
  event: string;
  details: string;
}

export interface DocumentDetail extends ExplorerDocument {
  repositoryPath: string[];
  createdAt: string;
  createdBy: string;
  metadata: Record<string, string>;
  versions: DocumentVersion[];
  workflow: WorkflowSummary;
  comments: DocumentComment[];
  audit: AuditEntry[];
}

export interface RepositoryContentResponse {
  node: RepositoryNode;
  breadcrumbs: RepositoryNode[];
  childFolders: RepositoryNode[];
  documents: ExplorerDocument[];
}

export interface GlobalSearchResponse {
  query: string;
  documents: ExplorerDocument[];
  repositories: RepositoryNode[];
}

export interface DashboardSummaryResponse {
  tasksDueToday: number;
  activeWorkflows: number;
  documentsInReview: number;
  recentDocuments: ExplorerDocument[];
}
