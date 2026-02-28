import { useEffect, useState } from "react";
import type { DocumentState } from "@ecm/shared";
import { useExplorerStore } from "../../stores/explorerStore";

type DetailTab = "preview" | "details" | "versions" | "workflow" | "comments" | "audit";

export const DetailPanel = (): JSX.Element => {
  const document = useExplorerStore((state) => state.activeDocument);
  const patchDocument = useExplorerStore((state) => state.patchDocument);
  const checkoutDocument = useExplorerStore((state) => state.checkoutDocument);
  const checkinDocument = useExplorerStore((state) => state.checkinDocument);
  const addComment = useExplorerStore((state) => state.addComment);
  const lastAction = useExplorerStore((state) => state.lastAction);

  const [tab, setTab] = useState<DetailTab>("preview");
  const [titleDraft, setTitleDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [stateDraft, setStateDraft] = useState<DocumentState>("DRAFT");
  const [commentDraft, setCommentDraft] = useState("");
  const [checkinComment, setCheckinComment] = useState("Revisione completata.");

  useEffect(() => {
    if (!document) {
      return;
    }
    setTitleDraft(document.name);
    setDescriptionDraft(document.description);
    setStateDraft(document.state);
  }, [document]);

  if (!document) {
    return (
      <aside className="detail-panel" aria-label="Document details">
        <h2>Preview / Details</h2>
        <p>No document selected.</p>
      </aside>
    );
  }

  return (
    <aside className="detail-panel" aria-label="Document details">
      <div className="detail-header">
        <h2>{document.name}</h2>
        <div className="detail-header-actions">
          <button type="button" onClick={() => void checkoutDocument()}>
            Check-out
          </button>
          <button type="button" onClick={() => void checkinDocument(checkinComment)}>
            Check-in
          </button>
        </div>
      </div>

      <div className="detail-tabs">
        <button type="button" className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}>
          Preview
        </button>
        <button type="button" className={tab === "details" ? "active" : ""} onClick={() => setTab("details")}>
          Details
        </button>
        <button type="button" className={tab === "versions" ? "active" : ""} onClick={() => setTab("versions")}>
          Versions
        </button>
        <button type="button" className={tab === "workflow" ? "active" : ""} onClick={() => setTab("workflow")}>
          Workflow
        </button>
        <button type="button" className={tab === "comments" ? "active" : ""} onClick={() => setTab("comments")}>
          Comments
        </button>
        <button type="button" className={tab === "audit" ? "active" : ""} onClick={() => setTab("audit")}>
          Audit
        </button>
      </div>

      <div className="detail-body">
        {tab === "preview" ? (
          <div className="preview-box">
            <div>
              <strong>{document.mimeType}</strong>
              <p>Anteprima inline placeholder pronta per PDF.js/Office converter.</p>
            </div>
          </div>
        ) : null}

        {tab === "details" ? (
          <section className="detail-section">
            <label>
              Titolo
              <input type="text" value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} />
            </label>
            <label>
              Descrizione
              <textarea value={descriptionDraft} onChange={(event) => setDescriptionDraft(event.target.value)} />
            </label>
            <label>
              Stato
              <select value={stateDraft} onChange={(event) => setStateDraft(event.target.value as DocumentState)}>
                <option value="DRAFT">DRAFT</option>
                <option value="IN_REVIEW">IN_REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="ARCHIVED">ARCHIVED</option>
                <option value="DELETED">DELETED</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() =>
                void patchDocument({
                  name: titleDraft,
                  description: descriptionDraft,
                  state: stateDraft
                })
              }
            >
              Salva modifiche
            </button>
            <dl className="detail-grid">
              <dt>Classe</dt>
              <dd>{document.className}</dd>
              <dt>Versione</dt>
              <dd>{document.version}</dd>
              <dt>Path</dt>
              <dd>{document.repositoryPath.join(" > ")}</dd>
              <dt>Owner</dt>
              <dd>{document.author}</dd>
            </dl>
          </section>
        ) : null}

        {tab === "versions" ? (
          <section className="detail-section">
            <label>
              Commento check-in
              <input type="text" value={checkinComment} onChange={(event) => setCheckinComment(event.target.value)} />
            </label>
            <ul className="detail-list">
              {document.versions.map((version) => (
                <li key={version.id}>
                  <strong>{version.version}</strong>
                  <span>
                    {version.author} | {new Date(version.createdAt).toLocaleString()} | {version.sizeLabel}
                    {version.isCurrent ? " | corrente" : ""}
                  </span>
                  <span>{version.comment}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tab === "workflow" ? (
          <section className="detail-section">
            {document.workflow.currentTask ? (
              <div className="workflow-card">
                <strong>{document.workflow.activeProcessName}</strong>
                <span>Task: {document.workflow.currentTask.taskName}</span>
                <span>Assegnato a: {document.workflow.currentTask.assignedTo}</span>
                <span>Scadenza: {document.workflow.currentTask.dueAt ?? "N/A"}</span>
              </div>
            ) : (
              <p>Nessun workflow attivo.</p>
            )}
          </section>
        ) : null}

        {tab === "comments" ? (
          <section className="detail-section">
            <label>
              Nuovo commento
              <textarea value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} />
            </label>
            <button
              type="button"
              onClick={() => {
                void addComment(commentDraft);
                setCommentDraft("");
              }}
            >
              Invia commento
            </button>
            <ul className="detail-list">
              {document.comments.map((comment) => (
                <li key={comment.id}>
                  <strong>{comment.author}</strong>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                  <span>{comment.message}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {tab === "audit" ? (
          <section className="detail-section">
            <ul className="detail-list">
              {document.audit.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.event}</strong>
                  <span>
                    {entry.user} | {new Date(entry.createdAt).toLocaleString()}
                  </span>
                  <span>{entry.details}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {lastAction ? <p className="detail-last-action">{lastAction}</p> : null}
    </aside>
  );
};
