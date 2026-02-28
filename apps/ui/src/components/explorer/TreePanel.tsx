import type { RepositoryTreeNode } from "@ecm/shared";
import { useState } from "react";
import { useExplorerStore } from "../../stores/explorerStore";

const TreeItem = ({ node, level }: { node: RepositoryTreeNode; level: number }): JSX.Element => {
  const openNode = useExplorerStore((state) => state.openNode);
  const currentNodeId = useExplorerStore((state) => state.currentNodeId);
  const [expanded, setExpanded] = useState(true);

  const isActive = currentNodeId === node.id;

  return (
    <li>
      <div className={`tree-node ${isActive ? "active" : ""}`} style={{ paddingLeft: `${level * 14 + 8}px` }}>
        {node.children.length > 0 ? (
          <button
            type="button"
            className="tree-expand"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((value) => !value);
            }}
          >
            {expanded ? "v" : ">"}
          </button>
        ) : (
          <span className="tree-expand-placeholder" />
        )}
        <button
          type="button"
          className="tree-label"
          onClick={(event) => {
            void openNode(node.id, {
              addTab: event.ctrlKey || event.metaKey
            });
          }}
        >
          {node.name}
        </button>
        {node.unreadCount ? <span className="tree-badge">{node.unreadCount}</span> : null}
      </div>

      {expanded && node.children.length > 0 ? (
        <ul>
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

export const TreePanel = (): JSX.Element => {
  const tree = useExplorerStore((state) => state.tree);

  return (
    <aside className="tree-panel" aria-label="Repository tree">
      <h2>Navigation</h2>
      <ul className="tree-list">
        {tree.map((node) => (
          <TreeItem key={node.id} node={node} level={0} />
        ))}
      </ul>
    </aside>
  );
};

