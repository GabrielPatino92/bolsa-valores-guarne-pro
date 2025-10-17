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

INSERT INTO providers (name, type, display_name, supports_testnet) VALUES
('binance', 'crypto', 'Binance', true),
('okx', 'crypto', 'OKX', true),
('coinbase', 'crypto', 'Coinbase', true),
('ibkr', 'stocks', 'Interactive Brokers', true);

INSERT INTO users (email, username, password_hash, full_name, email_verified, is_active) VALUES
('demo@guarne.pro', 'demo_trader', '$2b$10$rX5w8YzKGDGqJZVKJ0a8/.Dw5z3lKGHHqT0qP7zxQQ8oXqPvRXZ6i', 'Demo Trader', true, true);
