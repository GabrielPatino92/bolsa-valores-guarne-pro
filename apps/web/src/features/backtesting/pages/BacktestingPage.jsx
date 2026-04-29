import PlaceholderCard from '@/shared/ui/PlaceholderCard.jsx';
import BacktestingControls from '../components/BacktestingControls.jsx';
import BacktestingStatus from '../components/BacktestingStatus.jsx';
import CandlestickChart from '../components/CandlestickChart.jsx';
import CandlesTable from '../components/CandlesTable.jsx';
import { useBacktestingMarketData } from '../hooks/useBacktestingMarketData.js';

export default function BacktestingPage() {
  const {
    provider,
    symbols,
    selectedSymbol,
    selectedTimeframe,
    timeframeOptions,
    candles,
    isLoading,
    error,
    streamError,
    streamStatus,
    lastUpdatedAt,
    hasEmptyState,
    setSelectedSymbol,
    setSelectedTimeframe,
    refreshHistory
  } = useBacktestingMarketData();

  return (
    <div className="page-stack">
      <section className="page-hero">
        <span className="kicker">Issue #30 · gráfico candlestick en backtesting</span>
        <h1>Backtesting conectado al backend real</h1>
        <p>
          Esta pantalla ya consume histórico REST y stream realtime desde el backend provider-aware, sin hablar directo con Binance.
        </p>
      </section>

      <BacktestingControls
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        selectedTimeframe={selectedTimeframe}
        timeframeOptions={timeframeOptions}
        onSymbolChange={setSelectedSymbol}
        onTimeframeChange={setSelectedTimeframe}
        onRefresh={refreshHistory}
        disabled={isLoading && symbols.length === 0}
      />

      <BacktestingStatus
        provider={provider}
        streamStatus={streamStatus}
        candlesCount={candles.length}
        lastUpdatedAt={lastUpdatedAt}
        streamError={streamError}
      />

      {error ? (
        <PlaceholderCard title="No se pudo cargar el market data" footer="El backend sigue siendo la única fuente de verdad para esta pantalla.">
          <p>{error}</p>
          <button type="button" onClick={refreshHistory}>
            Reintentar
          </button>
        </PlaceholderCard>
      ) : null}

      {!error && isLoading ? (
        <PlaceholderCard title="Cargando market data" footer="Primero histórico, luego stream realtime.">
          <p>Consultando símbolos y velas desde el backend...</p>
        </PlaceholderCard>
      ) : null}

      {!error && !isLoading && hasEmptyState ? (
        <PlaceholderCard title="Sin velas disponibles" footer="Ajusta símbolo o timeframe y vuelve a intentar.">
          <p>El backend no devolvió velas para la selección actual.</p>
        </PlaceholderCard>
      ) : null}

      {!error && !hasEmptyState && candles.length > 0 ? (
        <>
          <CandlestickChart
            candles={candles}
            symbol={selectedSymbol}
            timeframe={selectedTimeframe}
            streamStatus={streamStatus}
          />
          <CandlesTable candles={candles} />
        </>
      ) : null}
    </div>
  );
}
