export type DocumentState =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "ARCHIVED"
  | "DELETED";

export interface ExplorerDocument {
  id: string;
  name: string;
  className: string;
  version: string;
  state: DocumentState;
  modifiedAt: string;
  author: string;
  sizeLabel: string;
}

export interface RepositoryNode {
  id: string;
  name: string;
  parentId: string | null;
  type: "repository" | "folder";
}

