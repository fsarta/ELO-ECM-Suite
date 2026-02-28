import { useEffect } from "react";
import { ExplorerPage } from "./pages/ExplorerPage";
import { useExplorerStore } from "./stores/explorerStore";

const App = (): JSX.Element => {
  const toggleTree = useExplorerStore((state) => state.toggleTree);
  const toggleDetail = useExplorerStore((state) => state.toggleDetail);
  const toggleDualPane = useExplorerStore((state) => state.toggleDualPane);

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
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleDetail, toggleDualPane, toggleTree]);

  return <ExplorerPage />;
};

export default App;

