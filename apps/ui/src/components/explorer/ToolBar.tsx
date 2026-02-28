import { useExplorerStore } from "../../stores/explorerStore";
import { tauriCommands } from "../../ipc/tauriCommands";

export const ToolBar = (): JSX.Element => {
  const setViewMode = useExplorerStore((state) => state.setViewMode);
  const viewMode = useExplorerStore((state) => state.viewMode);
  const refreshContent = useExplorerStore((state) => state.refreshContent);
  const setQuickQuery = useExplorerStore((state) => state.setQuickQuery);
  const quickQuery = useExplorerStore((state) => state.quickQuery);
  const filterState = useExplorerStore((state) => state.filterState);
  const setFilterState = useExplorerStore((state) => state.setFilterState);
  const toggleOnlyMine = useExplorerStore((state) => state.toggleOnlyMine);
  const onlyMine = useExplorerStore((state) => state.onlyMine);
  const toggleOnlyDueSoon = useExplorerStore((state) => state.toggleOnlyDueSoon);
  const onlyDueSoon = useExplorerStore((state) => state.onlyDueSoon);
  const openGlobalSearch = useExplorerStore((state) => state.openGlobalSearch);
  const openNode = useExplorerStore((state) => state.openNode);
  const setLastAction = useExplorerStore((state) => state.setLastAction);

  return (
    <section className="tool-bar" aria-label="Primary toolbar">
      <div className="tool-group">
        <button type="button" onClick={() => void openNode("recent", { addTab: true })}>
          Back
        </button>
        <button type="button" onClick={() => void openNode("repo-root", { addTab: true })}>
          Forward
        </button>
        <button type="button" onClick={() => void openNode("repo-root")}>
          Up
        </button>
        <button type="button" onClick={() => void refreshContent()}>
          Refresh
        </button>
      </div>
      <div className="tool-group">
        <button type="button" onClick={() => void openNode("repo-contracts-2025", { addTab: true })}>
          New
        </button>
        <button
          type="button"
          onClick={() => {
            void (async () => {
              const file = await tauriCommands.openFileDialog();
              if (file) {
                setLastAction(`Selezionato file locale: ${file.name}`);
                await tauriCommands.notify("ECM Upload", `File selezionato: ${file.name}`);
              } else {
                setLastAction("Nessun file selezionato o dialog nativo non disponibile.");
              }
              await openNode("repo-invoices-2026", { addTab: true });
            })();
          }}
        >
          Upload
        </button>
        <button type="button" onClick={() => void openNode("repo-suppliers", { addTab: true })}>
          Folder
        </button>
      </div>
      <div className="tool-group">
        <button
          type="button"
          className={viewMode === "details" ? "active" : ""}
          onClick={() => setViewMode("details")}
        >
          Details
        </button>
        <button
          type="button"
          className={viewMode === "list" ? "active" : ""}
          onClick={() => setViewMode("list")}
        >
          List
        </button>
        <button
          type="button"
          className={viewMode === "icons" ? "active" : ""}
          onClick={() => setViewMode("icons")}
        >
          Icons
        </button>
        <button
          type="button"
          className={viewMode === "cards" ? "active" : ""}
          onClick={() => setViewMode("cards")}
        >
          Cards
        </button>
        <button
          type="button"
          className={viewMode === "columns" ? "active" : ""}
          onClick={() => setViewMode("columns")}
        >
          Columns
        </button>
      </div>
      <div className="tool-group">
        <select
          value={filterState}
          onChange={(event) => {
            setFilterState(event.target.value as typeof filterState);
            void refreshContent();
          }}
        >
          <option value="ALL">All status</option>
          <option value="DRAFT">Draft</option>
          <option value="IN_REVIEW">In review</option>
          <option value="APPROVED">Approved</option>
          <option value="ARCHIVED">Archived</option>
          <option value="DELETED">Deleted</option>
        </select>
        <button
          type="button"
          className={onlyMine ? "active" : ""}
          onClick={() => {
            toggleOnlyMine();
            void refreshContent();
          }}
        >
          Only mine
        </button>
        <button
          type="button"
          className={onlyDueSoon ? "active" : ""}
          onClick={() => {
            toggleOnlyDueSoon();
            void refreshContent();
          }}
        >
          Due soon
        </button>
      </div>
      <div className="tool-group tool-group-search">
        <input
          type="search"
          placeholder="Search documents..."
          aria-label="Search documents"
          value={quickQuery}
          onChange={(event) => setQuickQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void refreshContent();
            }
          }}
        />
        <button type="button" onClick={() => void refreshContent()}>
          Apply
        </button>
        <button type="button" onClick={openGlobalSearch}>
          Global
        </button>
      </div>
    </section>
  );
};
