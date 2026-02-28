const NODES = [
  "Favorites",
  "Recent",
  "Activity",
  "Repository",
  "Saved Searches",
  "Trash",
  "Administration"
];

export const TreePanel = (): JSX.Element => {
  return (
    <aside className="tree-panel" aria-label="Repository tree">
      <h2>Navigation</h2>
      <ul>
        {NODES.map((node) => (
          <li key={node}>
            <button type="button">{node}</button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

