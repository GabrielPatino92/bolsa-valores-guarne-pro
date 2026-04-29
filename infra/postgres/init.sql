-- Guarne Pro - Schema simplificado
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

SET timezone = 'America/Bogota';

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auth_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    replaced_by_token_id UUID REFERENCES auth_refresh_tokens(id),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_refresh_tokens_user_id
    ON auth_refresh_tokens (user_id);

CREATE INDEX idx_auth_refresh_tokens_expires_at
    ON auth_refresh_tokens (expires_at);

CREATE TYPE provider_type AS ENUM ('crypto', 'forex', 'stocks', 'futures');
CREATE TYPE provider_name AS ENUM ('binance', 'okx', 'ibkr', 'coinbase');

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name provider_name UNIQUE NOT NULL,
    type provider_type NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    supports_testnet BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);



CREATE TABLE market_candles (
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

SELECT create_hypertable(
    'market_candles',
    'open_time',
    chunk_time_interval => INTERVAL '7 days',
    if_not_exists => TRUE
);

CREATE INDEX idx_market_candles_lookup
    ON market_candles (provider_name, symbol, timeframe, open_time DESC);

CREATE TABLE market_candle_coverage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name provider_name NOT NULL REFERENCES providers(name) ON DELETE CASCADE,
    symbol VARCHAR(64) NOT NULL,
    timeframe VARCHAR(16) NOT NULL,
    range_start TIMESTAMPTZ NOT NULL,
    range_end TIMESTAMPTZ NOT NULL,
    refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (range_end >= range_start)
);

CREATE INDEX idx_market_candle_coverage_lookup
    ON market_candle_coverage (provider_name, symbol, timeframe, range_start, range_end);

INSERT INTO providers (name, type, display_name, supports_testnet) VALUES
('binance', 'crypto', 'Binance', true),
('okx', 'crypto', 'OKX', true),
('coinbase', 'crypto', 'Coinbase', true),
('ibkr', 'stocks', 'Interactive Brokers', true);

INSERT INTO users (email, username, password_hash, full_name, email_verified, is_active) VALUES
('demo@guarne.pro', 'demo_trader', '$2b$10$rX5w8YzKGDGqJZVKJ0a8/.Dw5z3lKGHHqT0qP7zxQQ8oXqPvRXZ6i', 'Demo Trader', true, true);
