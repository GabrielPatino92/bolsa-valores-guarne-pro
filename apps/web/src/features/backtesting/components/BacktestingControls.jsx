export default function BacktestingControls({
  symbols,
  selectedSymbol,
  selectedTimeframe,
  timeframeOptions,
  onSymbolChange,
  onTimeframeChange,
  onRefresh,
  disabled = false
}) {
  return (
    <section className="panel-card control-panel">
      <div className="control-grid">
        <label className="control-field">
          <span>S?mbolo</span>
          <select
            value={selectedSymbol}
            onChange={(event) => onSymbolChange(event.target.value)}
            disabled={disabled || symbols.length === 0}
          >
            {symbols.map((symbol) => (
              <option key={symbol.symbol} value={symbol.symbol}>
                {symbol.symbol}
              </option>
            ))}
          </select>
        </label>

        <label className="control-field">
          <span>Timeframe</span>
          <select
            value={selectedTimeframe}
            onChange={(event) => onTimeframeChange(event.target.value)}
            disabled={disabled}
          >
            {timeframeOptions.map((timeframe) => (
              <option key={timeframe.id} value={timeframe.id}>
                {timeframe.label}
              </option>
            ))}
          </select>
        </label>

        <div className="control-actions">
          <button type="button" onClick={onRefresh} disabled={disabled || !selectedSymbol}>
            Recargar hist?rico
          </button>
        </div>
      </div>
    </section>
  );
}
