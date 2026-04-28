import PlaceholderCard from '@/shared/ui/PlaceholderCard.jsx';
import { env } from '@/services/env.js';

export default function HomePage() {
  return (
    <div className="page-stack">
      <section className="page-hero">
        <span className="kicker">Issue #13 ? frontend scaffold</span>
        <h1>Scaffold limpio para el frontend del monorepo</h1>
        <p>
          Esta app reemplaza la base legacy de Next.js/TypeScript por un shell controlado en React + Vite + JavaScript.
        </p>
      </section>

      <div className="status-row">
        <span className="status-chip">Package: @guarne/web</span>
        <span className="status-chip">Router: react-router-dom v6</span>
        <span className="status-chip">API URL: {env.apiUrl}</span>
      </div>

      <div className="card-grid">
        <PlaceholderCard title="Qu? qued? listo" footer="Baseline aprobado en #11 y bootstrap cognitivo en #12.">
          <ul className="meta-list">
            <li>React + Vite + JavaScript como frontend oficial.</li>
            <li>Estructura por app / features / shared / services.</li>
            <li>Smoke test inicial con Vitest.</li>
          </ul>
        </PlaceholderCard>

        <PlaceholderCard title="Qu? NO se migr? a?n" footer="La migraci?n de features reales se har? en issues posteriores.">
          <ul className="meta-list">
            <li>Flujos reales de autenticaci?n JWT.</li>
            <li>Dashboard operativo con datos del backend.</li>
            <li>UI de backtesting y adapters de brokers.</li>
          </ul>
        </PlaceholderCard>
      </div>

      <div className="note">
        Este scaffold existe para poner orden. Evita seguir profundizando el frontend legacy mientras definimos API, datos y auth.
      </div>
    </div>
  );
}
