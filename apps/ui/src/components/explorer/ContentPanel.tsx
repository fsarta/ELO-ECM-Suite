import type { ExplorerDocument, RepositoryNode } from "@ecm/shared";
import { useMemo, useState } from "react";
import { useExplorerStore } from "../../stores/explorerStore";
import { formatRelativeDate } from "../../utils/formatters";

type SortKey = "name" | "className" | "version" | "state" | "modifiedAt" | "author" | "sizeBytes";
type SortDirection = "asc" | "desc";

interface ContextMenuState {
  x: number;
  y: number;
  targetId: string;
}

const compare = (left: ExplorerDocument, right: ExplorerDocument, key: SortKey, dir: SortDirection): number => {
  const factor = dir === "asc" ? 1 : -1;
  if (key === "sizeBytes") {
    return (left.sizeBytes - right.sizeBytes) * factor;
  }
  if (key === "modifiedAt") {
    return (new Date(left.modifiedAt).getTime() - new Date(right.modifiedAt).getTime()) * factor;
  }
  return String(left[key]).localeCompare(String(right[key])) * factor;
};

const FolderRows = ({
  folders,
  onOpen
}: {
  folders: RepositoryNode[];
  onOpen: (nodeId: string, addTab: boolean) => void;
}): JSX.Element => (
  <>
    {folders.map((folder) => (
      <tr key={folder.id} className="folder-row">
        <td onDoubleClick={() => onOpen(folder.id, true)}>[{folder.type}] {folder.name}</td>
        <td>FOLDER</td>
        <td>--</td>
        <td>--</td>
        <td>--</td>
        <td>--</td>
        <td>--</td>
      </tr>
    ))}
  </>
);

export const ContentPanel = (): JSX.Element => {
  const documents = useExplorerStore((state) => state.documents);
  const childFolders = useExplorerStore((state) => state.childFolders);
  const selectedDocumentId = useExplorerStore((state) => state.selectedDocumentId);
  const selectDocument = useExplorerStore((state) => state.selectDocument);
  const openNode = useExplorerStore((state) => state.openNode);
  const viewMode = useExplorerStore((state) => state.viewMode);
  const checkoutDocument = useExplorerStore((state) => state.checkoutDocument);
  const checkinDocument = useExplorerStore((state) => state.checkinDocument);
  const deleteDocument = useExplorerStore((state) => state.deleteDocument);
  const restoreDocument = useExplorerStore((state) => state.restoreDocument);
  const isLoadingContent = useExplorerStore((state) => state.isLoadingContent);

  const [sortKey, setSortKey] = useState<SortKey>("modifiedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => compare(a, b, sortKey, sortDirection));
  }, [documents, sortDirection, sortKey]);

  const handleSort = (key: SortKey): void => {
    if (sortKey === key) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const onOpenFolder = (nodeId: string, addTab: boolean): void => {
    void openNode(nodeId, { addTab });
  };

  const onContextAction = async (action: "checkout" | "checkin" | "delete" | "restore"): Promise<void> => {
    setContextMenu(null);
    if (!selectedDocumentId) {
      return;
    }
    if (action === "checkout") {
      await checkoutDocument();
    }
    if (action === "checkin") {
      await checkinDocument("Check-in eseguito dal menu contestuale.");
    }
    if (action === "delete") {
      await deleteDocument();
    }
    if (action === "restore") {
      await restoreDocument();
    }
  };

  if (viewMode !== "details") {
    return (
      <section className="content-panel">
        <header className="panel-header">
          <h2>Content</h2>
          <span>
            {childFolders.length + documents.length} elementi | vista {viewMode}
          </span>
        </header>
        <div className="placeholder-view">
          <p>La vista {viewMode} e' attiva.</p>
          <div className="mini-grid">
            {sortedDocuments.map((document) => (
              <button
                key={document.id}
                type="button"
                className={`mini-card ${document.id === selectedDocumentId ? "selected" : ""}`}
                onClick={() => void selectDocument(document.id)}
              >
                <strong>{document.name}</strong>
                <span>
                  {document.className} | {document.state}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="content-panel" onClick={() => setContextMenu(null)}>
      <header className="panel-header">
        <h2>Content</h2>
        <span>
          {childFolders.length + documents.length} elementi
          {isLoadingContent ? " | caricamento..." : ""}
        </span>
      </header>
      <table className="document-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("name")}>Name</th>
            <th onClick={() => handleSort("className")}>Class</th>
            <th onClick={() => handleSort("version")}>Version</th>
            <th onClick={() => handleSort("state")}>Status</th>
            <th onClick={() => handleSort("modifiedAt")}>Modified</th>
            <th onClick={() => handleSort("author")}>Author</th>
            <th onClick={() => handleSort("sizeBytes")}>Size</th>
          </tr>
        </thead>
        <tbody>
          <FolderRows folders={childFolders} onOpen={onOpenFolder} />
          {sortedDocuments.map((document) => {
            const isSelected = document.id === selectedDocumentId;
            return (
              <tr
                key={document.id}
                className={isSelected ? "selected" : ""}
                onClick={() => void selectDocument(document.id)}
                onDoubleClick={() => void selectDocument(document.id)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  void selectDocument(document.id);
                  setContextMenu({
                    x: event.clientX,
                    y: event.clientY,
                    targetId: document.id
                  });
                }}
              >
                <td>{document.name}</td>
                <td>{document.className}</td>
                <td>{document.version}</td>
                <td>
                  <span className={`status ${document.state.toLowerCase()}`}>{document.state}</span>
                </td>
                <td>{formatRelativeDate(document.modifiedAt)}</td>
                <td>{document.author}</td>
                <td>{document.sizeLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {contextMenu ? (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button type="button" onClick={() => void selectDocument(contextMenu.targetId)}>
            Apri
          </button>
          <button type="button" onClick={() => void onContextAction("checkout")}>
            Check-out
          </button>
          <button type="button" onClick={() => void onContextAction("checkin")}>
            Check-in
          </button>
          <button type="button" onClick={() => void onContextAction("delete")}>
            Elimina
          </button>
          <button type="button" onClick={() => void onContextAction("restore")}>
            Ripristina
          </button>
        </div>
      ) : null}
    </section>
  );
};
