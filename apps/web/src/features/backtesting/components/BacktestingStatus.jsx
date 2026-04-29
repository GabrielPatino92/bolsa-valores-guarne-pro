const STATUS_LABELS = {
  idle: 'Inactivo',
  connecting: 'Conectando',
  connected: 'Conectado',
  reconnecting: 'Reconectando',
  reconnected: 'Reconectado',
  disconnected: 'Desconectado',
  error: 'Error'
};

function formatLastUpdatedAt(value) {
  if (!value) {
    return 'Sin datos todavía';
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date(value));
}

export default function BacktestingStatus({
  provider,
  streamStatus,
  candlesCount,
  lastUpdatedAt,
  streamError
}) {
  return (
    <section className="panel-card status-panel">
      <div className="status-row">
        <span className="status-chip">Proveedor: {provider}</span>
        <span className={`status-chip status-chip-${streamStatus}`}>
          Tiempo real: {STATUS_LABELS[streamStatus] || streamStatus}
        </span>
        <span className="status-chip">Velas: {candlesCount}</span>
        <span className="status-chip">Última actualización: {formatLastUpdatedAt(lastUpdatedAt)}</span>
      </div>

      {streamError ? <p className="stream-error">{streamError}</p> : null}
    </section>
  );
}
