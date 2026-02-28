const ITEMS = ["File", "Edit", "View", "Go", "Tools", "Workflow", "Help"];

export const MenuBar = (): JSX.Element => {
  return (
    <header className="menu-bar" role="menubar" aria-label="Main menu">
      {ITEMS.map((item) => (
        <button key={item} className="menu-item" type="button">
          {item}
        </button>
      ))}
    </header>
  );
};

