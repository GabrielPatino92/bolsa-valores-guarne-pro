import { AppError } from '../../shared/errors/app-error.js';

const ENSURE_MARKET_DATA_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS market_candles (
  provider_name provider_name NOT NULL REFERENCES providers(name) ON DELETE CASCADE,
  symbol VARCHAR(64) NOT NULL,
  timeframe VARCHAR(16) NOT NULL,
  open_time TIMESTAMPTZ NOT NULL,
  open DOUBLE PRECISION NOT NULL,
  high DOUBLE PRECISION NOT NULL,
  low DOUBLE PRECISION NOT NULL,
  close DOUBLE PRECISION NOT NULL,
  volume DOUBLE PRECISION NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (provider_name, symbol, timeframe, open_time)
);

CREATE INDEX IF NOT EXISTS idx_market_candles_lookup
  ON market_candles (provider_name, symbol, timeframe, open_time DESC);

DO $$
BEGIN
  PERFORM create_hypertable(
    'market_candles',
    'open_time',
    chunk_time_interval => INTERVAL '7 days',
    if_not_exists => TRUE
  );
EXCEPTION
  WHEN undefined_function THEN
    RAISE NOTICE 'create_hypertable() is unavailable; market_candles remains a regular table';
END
$$;

CREATE TABLE IF NOT EXISTS market_candle_coverage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name provider_name NOT NULL REFERENCES providers(name) ON DELETE CASCADE,
  symbol VARCHAR(64) NOT NULL,
  timeframe VARCHAR(16) NOT NULL,
  range_start TIMESTAMPTZ NOT NULL,
  range_end TIMESTAMPTZ NOT NULL,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (range_end >= range_start)
);

CREATE INDEX IF NOT EXISTS idx_market_candle_coverage_lookup
  ON market_candle_coverage (provider_name, symbol, timeframe, range_start, range_end);
`;

function toDate(value) {
  return new Date(Number(value));
}

function toTimestamp(value) {
  return new Date(value).getTime();
}

function mapCandleRow(row) {
  return {
    symbol: row.symbol,
    timeframe: row.timeframe,
    timestamp: toTimestamp(row.open_time),
    open: Number(row.open),
    high: Number(row.high),
    low: Number(row.low),
    close: Number(row.close),
    volume: Number(row.volume)
  };
}

export async function ensurePgMarketDataStorage({ pool }) {
  await pool.query(ENSURE_MARKET_DATA_SCHEMA_SQL);
}

export function createPgMarketDataRepository({ pool }) {
  return {
    async hasCoverage({ providerName, symbol, timeframe, startTime, endTime }) {
      const result = await pool.query(
        `
          SELECT 1
          FROM market_candle_coverage
          WHERE provider_name = $1::provider_name
            AND symbol = $2
            AND timeframe = $3
            AND range_start <= $4::timestamptz
            AND range_end >= $5::timestamptz
          LIMIT 1
        `,
        [providerName, symbol, timeframe, toDate(startTime), toDate(endTime)]
      );

      return result.rowCount > 0;
    },

    async listCandlesByRange({ providerName, symbol, timeframe, startTime, endTime, limit = 500 }) {
      const result = await pool.query(
        `
          SELECT provider_name, symbol, timeframe, open_time, open, high, low, close, volume
          FROM market_candles
          WHERE provider_name = $1::provider_name
            AND symbol = $2
            AND timeframe = $3
            AND ($4::timestamptz IS NULL OR open_time >= $4::timestamptz)
            AND ($5::timestamptz IS NULL OR open_time <= $5::timestamptz)
          ORDER BY open_time ASC
          LIMIT $6
        `,
        [
          providerName,
          symbol,
          timeframe,
          startTime === undefined ? null : toDate(startTime),
          endTime === undefined ? null : toDate(endTime),
          limit
        ]
      );

      return result.rows.map(mapCandleRow);
    },

    async listLatestCandles({ providerName, symbol, timeframe, limit = 5 }) {
      const result = await pool.query(
        `
          SELECT provider_name, symbol, timeframe, open_time, open, high, low, close, volume
          FROM market_candles
          WHERE provider_name = $1::provider_name
            AND symbol = $2
            AND timeframe = $3
          ORDER BY open_time DESC
          LIMIT $4
        `,
        [providerName, symbol, timeframe, limit]
      );

      return result.rows.map(mapCandleRow).reverse();
    },

    async upsertCandles({ providerName, symbol, timeframe, candles }) {
      if (!Array.isArray(candles) || candles.length === 0) {
        return 0;
      }

      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        for (const candle of candles) {
          await client.query(
            `
              INSERT INTO market_candles (
                provider_name,
                symbol,
                timeframe,
                open_time,
                open,
                high,
                low,
                close,
                volume,
                fetched_at
              )
              VALUES (
                $1::provider_name,
                $2,
                $3,
                $4::timestamptz,
                $5,
                $6,
                $7,
                $8,
                $9,
                NOW()
              )
              ON CONFLICT (provider_name, symbol, timeframe, open_time)
              DO UPDATE SET
                open = EXCLUDED.open,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                close = EXCLUDED.close,
                volume = EXCLUDED.volume,
                fetched_at = NOW()
            `,
            [
              providerName,
              symbol,
              timeframe,
              toDate(candle.timestamp),
              candle.open,
              candle.high,
              candle.low,
              candle.close,
              candle.volume
            ]
          );
        }

        await client.query('COMMIT');
        return candles.length;
      } catch (error) {
        await client.query('ROLLBACK');
        throw new AppError('Failed to persist market candles', {
          statusCode: 500,
          code: 'market_data_persistence_failed',
          details: {
            providerName,
            symbol,
            timeframe,
            reason: error instanceof Error ? error.message : String(error)
          }
        });
      } finally {
        client.release();
      }
    },

    async mergeCoverage({ providerName, symbol, timeframe, startTime, endTime }) {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        const overlapResult = await client.query(
          `
            SELECT id, range_start, range_end
            FROM market_candle_coverage
            WHERE provider_name = $1::provider_name
              AND symbol = $2
              AND timeframe = $3
              AND NOT (
                range_end < $4::timestamptz OR
                range_start > $5::timestamptz
              )
            FOR UPDATE
          `,
          [providerName, symbol, timeframe, toDate(startTime), toDate(endTime)]
        );

        const mergedStart = overlapResult.rows.reduce(
          (current, row) => Math.min(current, toTimestamp(row.range_start)),
          Number(startTime)
        );
        const mergedEnd = overlapResult.rows.reduce(
          (current, row) => Math.max(current, toTimestamp(row.range_end)),
          Number(endTime)
        );

        if (overlapResult.rows.length > 0) {
          await client.query(
            `
              DELETE FROM market_candle_coverage
              WHERE id = ANY($1::uuid[])
            `,
            [overlapResult.rows.map((row) => row.id)]
          );
        }

        await client.query(
          `
            INSERT INTO market_candle_coverage (
              provider_name,
              symbol,
              timeframe,
              range_start,
              range_end,
              refreshed_at
            )
            VALUES (
              $1::provider_name,
              $2,
              $3,
              $4::timestamptz,
              $5::timestamptz,
              NOW()
            )
          `,
          [providerName, symbol, timeframe, toDate(mergedStart), toDate(mergedEnd)]
        );

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw new AppError('Failed to merge market candle coverage', {
          statusCode: 500,
          code: 'market_data_coverage_failed',
          details: {
            providerName,
            symbol,
            timeframe,
            reason: error instanceof Error ? error.message : String(error)
          }
        });
      } finally {
        client.release();
      }
    }
  };
}
