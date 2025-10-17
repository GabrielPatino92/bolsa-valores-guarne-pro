/**
 * Sistema completo de temporalidades para backtesting y trading en vivo
 * Basado en TradingView - Incluye desde 1 tick hasta 5 años
 */

export enum TimeframeCategory {
  TICKS = 'TICKS',
  SECONDS = 'SECONDS',
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS',
  YEARS = 'YEARS',
  RANGES = 'RANGES',
}

export interface Timeframe {
  id: string;
  label: string;
  category: TimeframeCategory;
  seconds: number;
  binanceInterval?: string; // Para integración con Binance
  description: string;
}

/**
 * Todas las temporalidades soportadas
 * Exactamente como en TradingView
 */
export const TIMEFRAMES: Record<string, Timeframe> = {
  // ==================== TICKS ====================
  '1TICK': {
    id: '1TICK',
    label: '1 tick',
    category: TimeframeCategory.TICKS,
    seconds: 0,
    description: 'Cada cambio de precio',
  },
  '10TICKS': {
    id: '10TICKS',
    label: '10 ticks',
    category: TimeframeCategory.TICKS,
    seconds: 0,
    description: 'Cada 10 cambios de precio',
  },
  '100TICKS': {
    id: '100TICKS',
    label: '100 ticks',
    category: TimeframeCategory.TICKS,
    seconds: 0,
    description: 'Cada 100 cambios de precio',
  },
  '1000TICKS': {
    id: '1000TICKS',
    label: '1000 ticks',
    category: TimeframeCategory.TICKS,
    seconds: 0,
    description: 'Cada 1000 cambios de precio',
  },

  // ==================== SEGUNDOS ====================
  '1S': {
    id: '1S',
    label: '1 segundo',
    category: TimeframeCategory.SECONDS,
    seconds: 1,
    binanceInterval: '1s',
    description: 'Vela de 1 segundo',
  },
  '5S': {
    id: '5S',
    label: '5 segundos',
    category: TimeframeCategory.SECONDS,
    seconds: 5,
    description: 'Vela de 5 segundos',
  },
  '10S': {
    id: '10S',
    label: '10 segundos',
    category: TimeframeCategory.SECONDS,
    seconds: 10,
    description: 'Vela de 10 segundos',
  },
  '15S': {
    id: '15S',
    label: '15 segundos',
    category: TimeframeCategory.SECONDS,
    seconds: 15,
    description: 'Vela de 15 segundos',
  },
  '30S': {
    id: '30S',
    label: '30 segundos',
    category: TimeframeCategory.SECONDS,
    seconds: 30,
    description: 'Vela de 30 segundos',
  },
  '45S': {
    id: '45S',
    label: '45 segundos',
    category: TimeframeCategory.SECONDS,
    seconds: 45,
    description: 'Vela de 45 segundos',
  },

  // ==================== MINUTOS ====================
  '1m': {
    id: '1m',
    label: '1 minuto',
    category: TimeframeCategory.MINUTES,
    seconds: 60,
    binanceInterval: '1m',
    description: 'Vela de 1 minuto - Scalping',
  },
  '2m': {
    id: '2m',
    label: '2 minutos',
    category: TimeframeCategory.MINUTES,
    seconds: 120,
    description: 'Vela de 2 minutos',
  },
  '3m': {
    id: '3m',
    label: '3 minutos',
    category: TimeframeCategory.MINUTES,
    seconds: 180,
    binanceInterval: '3m',
    description: 'Vela de 3 minutos',
  },
  '5m': {
    id: '5m',
    label: '5 minutos',
    category: TimeframeCategory.MINUTES,
    seconds: 300,
    binanceInterval: '5m',
    description: 'Vela de 5 minutos - Scalping',
  },
  '10m': {
    id: '10m',
    label: '10 minutos',
    category: TimeframeCategory.MINUTES,
    seconds: 600,
    description: 'Vela de 10 minutos',
  },
  '15m': {
    id: '15m',
    label: '15 minutos',
    category: TimeframeCategory.MINUTES,
    seconds: 900,
    binanceInterval: '15m',
    description: 'Vela de 15 minutos - Intraday',
  },
  '30m': {
    id: '30m',
    label: '30 minutos',
    category: TimeframeCategory.MINUTES,
    seconds: 1800,
    binanceInterval: '30m',
    description: 'Vela de 30 minutos - Intraday',
  },
  '45m': {
    id: '45m',
    label: '45 minutos',
    category: TimeframeCategory.MINUTES,
    seconds: 2700,
    description: 'Vela de 45 minutos',
  },

  // ==================== HORAS ====================
  '1h': {
    id: '1h',
    label: '1 hora',
    category: TimeframeCategory.HOURS,
    seconds: 3600,
    binanceInterval: '1h',
    description: 'Vela de 1 hora - Day Trading',
  },
  '2h': {
    id: '2h',
    label: '2 horas',
    category: TimeframeCategory.HOURS,
    seconds: 7200,
    binanceInterval: '2h',
    description: 'Vela de 2 horas',
  },
  '3h': {
    id: '3h',
    label: '3 horas',
    category: TimeframeCategory.HOURS,
    seconds: 10800,
    description: 'Vela de 3 horas',
  },
  '4h': {
    id: '4h',
    label: '4 horas',
    category: TimeframeCategory.HOURS,
    seconds: 14400,
    binanceInterval: '4h',
    description: 'Vela de 4 horas - Swing Trading',
  },

  // ==================== DÍAS ====================
  '1D': {
    id: '1D',
    label: '1 día',
    category: TimeframeCategory.DAYS,
    seconds: 86400,
    binanceInterval: '1d',
    description: 'Vela diaria - Position Trading',
  },

  // ==================== SEMANAS ====================
  '1W': {
    id: '1W',
    label: '1 semana',
    category: TimeframeCategory.WEEKS,
    seconds: 604800,
    binanceInterval: '1w',
    description: 'Vela semanal - Position Trading',
  },

  // ==================== MESES ====================
  '1M': {
    id: '1M',
    label: '1 mes',
    category: TimeframeCategory.MONTHS,
    seconds: 2592000,
    binanceInterval: '1M',
    description: 'Vela mensual - Inversión largo plazo',
  },
  '3M': {
    id: '3M',
    label: '3 meses',
    category: TimeframeCategory.MONTHS,
    seconds: 7776000,
    description: 'Vela trimestral',
  },
  '6M': {
    id: '6M',
    label: '6 meses',
    category: TimeframeCategory.MONTHS,
    seconds: 15552000,
    description: 'Vela semestral',
  },
  '12M': {
    id: '12M',
    label: '12 meses',
    category: TimeframeCategory.MONTHS,
    seconds: 31104000,
    description: 'Vela anual',
  },

  // ==================== AÑOS ====================
  '1Y': {
    id: '1Y',
    label: '1 año',
    category: TimeframeCategory.YEARS,
    seconds: 31536000,
    description: 'Vela anual - Análisis macro',
  },
  '5Y': {
    id: '5Y',
    label: '5 años',
    category: TimeframeCategory.YEARS,
    seconds: 157680000,
    description: 'Vela quinquenal - Análisis macro largo plazo',
  },

  // ==================== RANGOS ====================
  '1R': {
    id: '1R',
    label: '1 rango',
    category: TimeframeCategory.RANGES,
    seconds: 0,
    description: 'Gráfico de rango',
  },
  '10R': {
    id: '10R',
    label: '10 rangos',
    category: TimeframeCategory.RANGES,
    seconds: 0,
    description: 'Gráfico de 10 rangos',
  },
  '100R': {
    id: '100R',
    label: '100 rangos',
    category: TimeframeCategory.RANGES,
    seconds: 0,
    description: 'Gráfico de 100 rangos',
  },
  '1000R': {
    id: '1000R',
    label: '1000 rangos',
    category: TimeframeCategory.RANGES,
    seconds: 0,
    description: 'Gráfico de 1000 rangos',
  },
};

/**
 * Agrupar timeframes por categoría para el selector de UI
 */
export const TIMEFRAMES_BY_CATEGORY = {
  [TimeframeCategory.TICKS]: Object.values(TIMEFRAMES).filter(
    (tf) => tf.category === TimeframeCategory.TICKS
  ),
  [TimeframeCategory.SECONDS]: Object.values(TIMEFRAMES).filter(
    (tf) => tf.category === TimeframeCategory.SECONDS
  ),
  [TimeframeCategory.MINUTES]: Object.values(TIMEFRAMES).filter(
    (tf) => tf.category === TimeframeCategory.MINUTES
  ),
  [TimeframeCategory.HOURS]: Object.values(TIMEFRAMES).filter(
    (tf) => tf.category === TimeframeCategory.HOURS
  ),
  [TimeframeCategory.DAYS]: Object.values(TIMEFRAMES).filter(
    (tf) => tf.category === TimeframeCategory.DAYS
  ),
  [TimeframeCategory.WEEKS]: Object.values(TIMEFRAMES).filter(
    (tf) => tf.category === TimeframeCategory.WEEKS
  ),
  [TimeframeCategory.MONTHS]: Object.values(TIMEFRAMES).filter(
    (tf) => tf.category === TimeframeCategory.MONTHS
  ),
  [TimeframeCategory.YEARS]: Object.values(TIMEFRAMES).filter(
    (tf) => tf.category === TimeframeCategory.YEARS
  ),
  [TimeframeCategory.RANGES]: Object.values(TIMEFRAMES).filter(
    (tf) => tf.category === TimeframeCategory.RANGES
  ),
};

/**
 * Helper para obtener timeframe por ID
 */
export function getTimeframe(id: string): Timeframe | undefined {
  return TIMEFRAMES[id];
}

/**
 * Helper para validar si un timeframe es soportado por Binance
 */
export function isBinanceSupported(timeframeId: string): boolean {
  const tf = TIMEFRAMES[timeframeId];
  return tf?.binanceInterval !== undefined;
}

/**
 * Convertir timeframe a intervalo de Binance
 */
export function toBinanceInterval(timeframeId: string): string | null {
  const tf = TIMEFRAMES[timeframeId];
  return tf?.binanceInterval || null;
}

/**
 * Timeframes más usados (para acceso rápido en UI)
 */
export const POPULAR_TIMEFRAMES = [
  '1m',
  '5m',
  '15m',
  '30m',
  '1h',
  '4h',
  '1D',
  '1W',
  '1M',
];
