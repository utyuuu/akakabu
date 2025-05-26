-- auth スキーマの存在を保証
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE if NOT EXISTS users(
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE if NOT EXISTS dividend(
    stock_code TEXT NOT NULL,
    company_name TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    dividend_type TEXT,
    dividend_per_share NUMERIC CHECK (dividend_per_share IS NULL OR dividend_per_share >= 0),
    source TEXT DEFAULT 'free',
    PRIMARY KEY (stock_code, fiscal_year)
);

CREATE TABLE if NOT EXISTS favorites(
    user_id uuid NOT NULL,
    stock_code TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    company_name TEXT NOT NULL,
    close_price NUMERIC,
    PRIMARY KEY (user_id, stock_code),
    FOREIGN KEY (stock_code, fiscal_year) REFERENCES dividend(stock_code, fiscal_year),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE if NOT EXISTS jquants_tokens(
    user_id uuid primary key,
    refresh_token text,
    api_token text,
    plan text,
    FOREIGN KEY (user_id) REFERENCES users(id)
);