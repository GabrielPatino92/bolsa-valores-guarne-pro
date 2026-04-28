import PlaceholderCard from '@/shared/ui/PlaceholderCard.jsx';

export default function BacktestingPage() {
  return (
    <div className="page-stack">
      <section className="page-hero">
        <span className="kicker">Backtesting placeholder</span>
        <h1>Backtesting desacoplado del frontend legacy</h1>
        <p>
          Esta ruta marca el destino funcional, pero no arrastra widgets heredados hasta que los contratos del dominio est?n claros.
        </p>
      </section>

      <PlaceholderCard title="Principio de migraci?n" footer="Primero estructura sana, luego features reales.">
        <ul className="meta-list">
          <li>No portar componentes de charting por reflejo.</li>
          <li>No asumir stores globales antes de validar casos de uso.</li>
          <li>Entrar a datos reales solo despu?s del contrato OpenAPI.</li>
        </ul>
      </PlaceholderCard>
    </div>
  );
}
