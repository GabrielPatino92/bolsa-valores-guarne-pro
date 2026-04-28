import PlaceholderCard from '@/shared/ui/PlaceholderCard.jsx';

export default function DashboardPage() {
  return (
    <div className="page-stack">
      <section className="page-hero">
        <span className="kicker">Dashboard placeholder</span>
        <h1>Dashboard en espera del backend modular</h1>
        <p>
          Aqu? vivir? la vista consolidada del usuario cuando el backend Node.js, PostgreSQL y JWT est?n estables.
        </p>
      </section>

      <div className="card-grid">
        <PlaceholderCard title="M?dulos previstos">
          <ul className="meta-list">
            <li>Resumen de cuenta y salud operativa.</li>
            <li>Estado de integraciones con brokers.</li>
            <li>Eventos y alertas de trading.</li>
          </ul>
        </PlaceholderCard>

        <PlaceholderCard title="Dependencias arquitect?nicas">
          <ul className="meta-list">
            <li>Issue #14 para el backend base.</li>
            <li>Issue #15 para auth y modelo de datos.</li>
            <li>Issue #17 para adapters de proveedores.</li>
          </ul>
        </PlaceholderCard>
      </div>
    </div>
  );
}
