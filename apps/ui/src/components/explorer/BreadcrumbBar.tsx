export const BreadcrumbBar = (): JSX.Element => {
  return (
    <section className="breadcrumb-bar" aria-label="Current path">
      <button type="button">ECM</button>
      <span>&gt;</span>
      <button type="button">Suppliers</button>
      <span>&gt;</span>
      <button type="button">Contracts</button>
      <span>&gt;</span>
      <button type="button" className="current">
        2025
      </button>
    </section>
  );
};

