function formatTimestamp(timestamp) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date(timestamp));
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 8
  }).format(value);
}

export default function CandlesTable({ candles }) {
  return (
    <section className="panel-card table-panel">
      <div className="table-header-row">
        <div>
          <h2>Velas recientes</h2>
          <p className="app-subtitle">Hist?rico REST + actualizaci?n realtime desde el backend.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="candles-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {candles.map((candle) => (
              <tr key={candle.timestamp}>
                <td>{formatTimestamp(candle.timestamp)}</td>
                <td>{formatNumber(candle.open)}</td>
                <td>{formatNumber(candle.high)}</td>
                <td>{formatNumber(candle.low)}</td>
                <td>{formatNumber(candle.close)}</td>
                <td>{formatNumber(candle.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
