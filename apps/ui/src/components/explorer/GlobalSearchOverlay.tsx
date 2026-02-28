import { useEffect } from "react";
import { useExplorerStore } from "../../stores/explorerStore";

export const GlobalSearchOverlay = (): JSX.Element | null => {
  const open = useExplorerStore((state) => state.globalSearchOpen);
  const query = useExplorerStore((state) => state.globalSearchQuery);
  const results = useExplorerStore((state) => state.globalSearchResults);
  const close = useExplorerStore((state) => state.closeGlobalSearch);
  const run = useExplorerStore((state) => state.runGlobalSearch);
  const selectDocument = useExplorerStore((state) => state.selectDocument);
  const openNode = useExplorerStore((state) => state.openNode);

  useEffect(() => {
    if (!open) {
      return;
    }
    const timeout = window.setTimeout(() => {
      void run(query);
    }, 120);
    return () => window.clearTimeout(timeout);
  }, [open, query, run]);

  if (!open) {
    return null;
  }

  return (
    <div className="search-overlay-backdrop" onClick={close} role="dialog" aria-modal="true">
      <section className="search-overlay" onClick={(event) => event.stopPropagation()}>
        <header>
          <input
            type="text"
            value={query}
            placeholder="Cerca documenti, repository, workflow..."
            onChange={(event) => void run(event.target.value)}
            autoFocus
          />
          <button type="button" onClick={close}>
            Esc
          </button>
        </header>
        <div className="search-results">
          <h4>Documenti</h4>
          <ul>
            {(results?.documents ?? []).map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => {
                    void openNode(doc.nodeId, { addTab: true, keepSelection: true });
                    void selectDocument(doc.id);
                    close();
                  }}
                >
                  <strong>{doc.name}</strong>
                  <span>
                    {doc.className} | {doc.state}
                  </span>
                </button>
              </li>
            ))}
            {results?.documents.length === 0 ? <li className="search-empty">Nessun documento trovato.</li> : null}
          </ul>
          <h4>Repository</h4>
          <ul>
            {(results?.repositories ?? []).map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  onClick={() => {
                    void openNode(node.id, { addTab: true });
                    close();
                  }}
                >
                  <strong>{node.name}</strong>
                  <span>{node.type}</span>
                </button>
              </li>
            ))}
            {results?.repositories.length === 0 ? <li className="search-empty">Nessun repository trovato.</li> : null}
          </ul>
        </div>
      </section>
    </div>
  );
};

