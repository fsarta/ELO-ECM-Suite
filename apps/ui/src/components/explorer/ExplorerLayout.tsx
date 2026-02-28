import { BreadcrumbBar } from "./BreadcrumbBar";
import { ContentPanel } from "./ContentPanel";
import { DetailPanel } from "./DetailPanel";
import { GlobalSearchOverlay } from "./GlobalSearchOverlay";
import { MenuBar } from "./MenuBar";
import { StatusBar } from "./StatusBar";
import { TabBar } from "./TabBar";
import { ToolBar } from "./ToolBar";
import { TreePanel } from "./TreePanel";
import { useExplorerStore } from "../../stores/explorerStore";

export const ExplorerLayout = (): JSX.Element => {
  const showTree = useExplorerStore((state) => state.showTree);
  const showDetail = useExplorerStore((state) => state.showDetail);
  const dualPane = useExplorerStore((state) => state.dualPane);
  const isBootstrapping = useExplorerStore((state) => state.isBootstrapping);
  const error = useExplorerStore((state) => state.error);

  return (
    <div className="app-shell">
      <MenuBar />
      <ToolBar />
      <TabBar />
      <BreadcrumbBar />
      <main
        className={`main-grid ${showTree ? "" : "tree-hidden"} ${showDetail ? "" : "detail-hidden"}`}
      >
        {showTree ? <TreePanel /> : null}
        {dualPane ? (
          <section className="dual-pane">
            <div className="dual-pane-column">
              <h3>Left Pane</h3>
              <ContentPanel />
            </div>
            <div className="dual-pane-column">
              <h3>Right Pane</h3>
              <ContentPanel />
            </div>
          </section>
        ) : (
          <ContentPanel />
        )}
        {showDetail ? <DetailPanel /> : null}
      </main>
      <StatusBar />
      <GlobalSearchOverlay />
      {isBootstrapping ? (
        <div className="boot-overlay">
          <p>Avvio ECM Local Suite...</p>
        </div>
      ) : null}
      {error ? (
        <div className="error-toast" role="status">
          {error}
        </div>
      ) : null}
    </div>
  );
};
