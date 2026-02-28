import { useExplorerStore } from "../../stores/explorerStore";

export const ToolBar = (): JSX.Element => {
  const setViewMode = useExplorerStore((state) => state.setViewMode);
  const viewMode = useExplorerStore((state) => state.viewMode);

  return (
    <section className="tool-bar" aria-label="Primary toolbar">
      <div className="tool-group">
        <button type="button">Back</button>
        <button type="button">Forward</button>
        <button type="button">Up</button>
        <button type="button">Refresh</button>
      </div>
      <div className="tool-group">
        <button type="button">New</button>
        <button type="button">Upload</button>
        <button type="button">Folder</button>
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
      </div>
      <div className="tool-group tool-group-search">
        <input type="search" placeholder="Search documents..." aria-label="Search documents" />
      </div>
    </section>
  );
};

