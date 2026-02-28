import { useExplorerStore } from "../../stores/explorerStore";

export const TabBar = (): JSX.Element => {
  const tabs = useExplorerStore((state) => state.tabs);
  const activeTabId = useExplorerStore((state) => state.activeTabId);
  const activateTab = useExplorerStore((state) => state.activateTab);
  const closeTab = useExplorerStore((state) => state.closeTab);

  return (
    <section className="tab-bar" aria-label="Explorer tabs">
      {tabs.map((tab) => (
        <div key={tab.id} className={`tab-item ${tab.id === activeTabId ? "active" : ""}`}>
          <button type="button" onClick={() => void activateTab(tab.id)}>
            {tab.title}
          </button>
          {tab.closable ? (
            <button
              type="button"
              className="tab-close"
              onClick={() => void closeTab(tab.id)}
              aria-label={`Close ${tab.title}`}
            >
              x
            </button>
          ) : null}
        </div>
      ))}
    </section>
  );
};

