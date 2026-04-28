import PlaceholderCard from '@/shared/ui/PlaceholderCard.jsx';

export default function LoginPage() {
  return (
    <div className="page-stack">
      <section className="page-hero">
        <span className="kicker">Auth placeholder</span>
        <h1>Login pendiente de la estrategia JWT</h1>
        <p>
          Esta pantalla marca el boundary de autenticaci?n, pero el flujo real se desbloquea cuando cerremos el issue #15.
        </p>
      </section>

      <PlaceholderCard title="Pr?ximos pasos de auth" footer="No inventamos formularios complejos antes de cerrar el contrato del backend.">
        <ul className="meta-list">
          <li>Definir endpoints OpenAPI para login y refresh.</li>
          <li>Elegir almacenamiento y expiraci?n segura de tokens.</li>
          <li>Conectar guards/rutas protegidas desde la API real.</li>
        </ul>
      </PlaceholderCard>
    </div>
  );
}
