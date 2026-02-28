import { useExplorerStore } from "../../stores/explorerStore";

const DOCUMENT_DETAILS: Record<string, { title: string; className: string; status: string; owner: string }> = {
  "doc-1": {
    title: "Contract_ABC_v2_1.pdf",
    className: "CONTRACT",
    status: "APPROVED",
    owner: "Laura Bianchi"
  },
  "doc-2": {
    title: "Meeting_Minutes_March.docx",
    className: "MINUTES",
    status: "IN_REVIEW",
    owner: "Mario Rossi"
  },
  "doc-3": {
    title: "Invoice_0234.xlsx",
    className: "INVOICE",
    status: "DRAFT",
    owner: "Giulia Verdi"
  }
};

export const DetailPanel = (): JSX.Element => {
  const selectedDocumentId = useExplorerStore((state) => state.selectedDocumentId);
  const details = selectedDocumentId ? DOCUMENT_DETAILS[selectedDocumentId] : undefined;

  return (
    <aside className="detail-panel" aria-label="Document details">
      <h2>Preview / Details</h2>
      {!details ? (
        <p>No document selected.</p>
      ) : (
        <div className="detail-grid">
          <div className="preview-box">Preview area</div>
          <dl>
            <dt>Title</dt>
            <dd>{details.title}</dd>
            <dt>Class</dt>
            <dd>{details.className}</dd>
            <dt>Status</dt>
            <dd>{details.status}</dd>
            <dt>Owner</dt>
            <dd>{details.owner}</dd>
          </dl>
        </div>
      )}
    </aside>
  );
};

