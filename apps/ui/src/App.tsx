import { useEffect } from "react";
import { ExplorerPage } from "./pages/ExplorerPage";
import { useExplorerStore } from "./stores/explorerStore";

const App = (): JSX.Element => {
  const loadInitial = useExplorerStore((state) => state.loadInitial);
  const toggleTree = useExplorerStore((state) => state.toggleTree);
  const toggleDetail = useExplorerStore((state) => state.toggleDetail);
  const toggleDualPane = useExplorerStore((state) => state.toggleDualPane);
  const openGlobalSearch = useExplorerStore((state) => state.openGlobalSearch);
  const closeGlobalSearch = useExplorerStore((state) => state.closeGlobalSearch);
  const globalSearchOpen = useExplorerStore((state) => state.globalSearchOpen);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "F4") {
        event.preventDefault();
        toggleTree();
      }
      if (event.key === "F6") {
        event.preventDefault();
        toggleDetail();
      }
      if (event.key === "F8") {
        event.preventDefault();
        toggleDualPane();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openGlobalSearch();
      }
      if (event.key === "Escape" && globalSearchOpen) {
        event.preventDefault();
        closeGlobalSearch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeGlobalSearch, globalSearchOpen, openGlobalSearch, toggleDetail, toggleDualPane, toggleTree]);

  return <ExplorerPage />;
};

export default App;
