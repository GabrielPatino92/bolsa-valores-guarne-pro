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
  const hasSelectedSymbolOption = symbols.some(
    (symbol) => symbol.symbol === selectedSymbol
  );

  return (
    <section className="panel-card control-panel">
      <div className="control-grid">
        <label className="control-field">
          <span>Símbolo</span>
          <select
            value={selectedSymbol}
            onChange={(event) => onSymbolChange(event.target.value)}
            disabled={disabled || symbols.length === 0}
          >
            {!hasSelectedSymbolOption && selectedSymbol ? (
              <option value={selectedSymbol}>{selectedSymbol}</option>
            ) : null}
            {symbols.map((symbol) => (
              <option key={symbol.symbol} value={symbol.symbol}>
                {symbol.symbol}
              </option>
            ))}
          </select>
        </label>

        <label className="control-field">
          <span>Marco temporal</span>
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
            Recargar histórico
          </button>
        </div>
      </div>
    </section>
  );
}
