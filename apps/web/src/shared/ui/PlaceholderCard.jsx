export default function PlaceholderCard({ title, children, footer }) {
  return (
    <section className="placeholder-card">
      <h2>{title}</h2>
      <div>{children}</div>
      {footer ? <p className="app-subtitle">{footer}</p> : null}
    </section>
  );
}
