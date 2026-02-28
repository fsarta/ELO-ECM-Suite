import { useExplorerStore } from "../../stores/explorerStore";

export const BreadcrumbBar = (): JSX.Element => {
  const breadcrumbs = useExplorerStore((state) => state.breadcrumbs);
  const openNode = useExplorerStore((state) => state.openNode);

  if (breadcrumbs.length === 0) {
    return (
      <section className="breadcrumb-bar" aria-label="Current path">
        <span>ECM</span>
      </section>
    );
  }

  return (
    <section className="breadcrumb-bar" aria-label="Current path">
      {breadcrumbs.map((node, index) => (
        <span key={node.id} className="crumb-wrap">
          <button
            type="button"
            className={index === breadcrumbs.length - 1 ? "current" : ""}
            onClick={() => void openNode(node.id, { addTab: true })}
          >
            {node.name}
          </button>
          {index < breadcrumbs.length - 1 ? <span>&gt;</span> : null}
        </span>
      ))}
    </section>
  );
};
