import type { ExplorerDocument } from "@ecm/shared";
import { useExplorerStore } from "../../stores/explorerStore";

const SAMPLE_DOCUMENTS: ExplorerDocument[] = [
  {
    id: "doc-1",
    name: "Contract_ABC_v2_1.pdf",
    className: "CONTRACT",
    version: "2.1",
    state: "APPROVED",
    modifiedAt: "2026-02-18T08:30:00Z",
    author: "Laura Bianchi",
    sizeLabel: "2.4 MB"
  },
  {
    id: "doc-2",
    name: "Meeting_Minutes_March.docx",
    className: "MINUTES",
    version: "1.0",
    state: "IN_REVIEW",
    modifiedAt: "2026-02-22T10:15:00Z",
    author: "Mario Rossi",
    sizeLabel: "1.1 MB"
  },
  {
    id: "doc-3",
    name: "Invoice_0234.xlsx",
    className: "INVOICE",
    version: "1.3",
    state: "DRAFT",
    modifiedAt: "2026-02-27T15:45:00Z",
    author: "Giulia Verdi",
    sizeLabel: "860 KB"
  }
];

export const ContentPanel = (): JSX.Element => {
  const selectedDocumentId = useExplorerStore((state) => state.selectedDocumentId);
  const setSelectedDocument = useExplorerStore((state) => state.setSelectedDocument);
  const viewMode = useExplorerStore((state) => state.viewMode);

  if (viewMode !== "details") {
    return (
      <section className="content-panel">
        <header className="panel-header">
          <h2>Content</h2>
          <span>3 items</span>
        </header>
        <div className="placeholder-view">
          <p>Current view: {viewMode}</p>
          <p>Detailed table is implemented as default baseline.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="content-panel">
      <header className="panel-header">
        <h2>Content</h2>
        <span>3 items</span>
      </header>
      <table className="document-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Version</th>
            <th>Status</th>
            <th>Modified</th>
            <th>Author</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {SAMPLE_DOCUMENTS.map((document) => {
            const isSelected = document.id === selectedDocumentId;
            return (
              <tr
                key={document.id}
                className={isSelected ? "selected" : ""}
                onClick={() => setSelectedDocument(document.id)}
              >
                <td>{document.name}</td>
                <td>{document.className}</td>
                <td>{document.version}</td>
                <td>
                  <span className={`status ${document.state.toLowerCase()}`}>{document.state}</span>
                </td>
                <td>{new Date(document.modifiedAt).toLocaleDateString()}</td>
                <td>{document.author}</td>
                <td>{document.sizeLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};

