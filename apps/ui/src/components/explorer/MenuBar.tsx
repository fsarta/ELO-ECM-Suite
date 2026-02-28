import { useExplorerStore } from "../../stores/explorerStore";

export const MenuBar = (): JSX.Element => {
  const toggleTree = useExplorerStore((state) => state.toggleTree);
  const toggleDetail = useExplorerStore((state) => state.toggleDetail);
  const openGlobalSearch = useExplorerStore((state) => state.openGlobalSearch);
  const openNode = useExplorerStore((state) => state.openNode);

  return (
    <header className="menu-bar" role="menubar" aria-label="Main menu">
      <button className="menu-item" type="button" onClick={() => void openNode("repo-root", { addTab: true })}>
        File
      </button>
      <button className="menu-item" type="button" onClick={() => void openNode("repo-contracts-2025", { addTab: true })}>
        Edit
      </button>
      <button className="menu-item" type="button" onClick={toggleDetail}>
        View
      </button>
      <button className="menu-item" type="button" onClick={toggleTree}>
        Go
      </button>
      <button className="menu-item" type="button" onClick={openGlobalSearch}>
        Tools
      </button>
      <button className="menu-item" type="button" onClick={() => void openNode("tasks", { addTab: true })}>
        Workflow
      </button>
      <button className="menu-item" type="button" onClick={() => void openNode("recent", { addTab: true })}>
        Help
      </button>
    </header>
  );
};
