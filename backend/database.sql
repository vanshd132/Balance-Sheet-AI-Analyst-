-- Create database (run this separately if needed)
-- CREATE DATABASE balance_sheet_db;

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    industry VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('analyst', 'ceo', 'top_management')),
    company_id INTEGER REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create balance_sheets table
CREATE TABLE IF NOT EXISTS balance_sheets (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter IN (1, 2, 3, 4)),
    data JSONB NOT NULL,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, year, quarter)
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    balance_sheet_id INTEGER REFERENCES balance_sheets(id),
    company_id INTEGER REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_balance_sheets_company_id ON balance_sheets(company_id);
CREATE INDEX IF NOT EXISTS idx_balance_sheets_year ON balance_sheets(year);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_company_id ON chat_history(company_id);

-- Insert sample companies
INSERT INTO companies (name, industry) VALUES 
('Reliance Industries', 'Conglomerate'),
('JIO Platforms', 'Telecommunications'),
('Reliance Retail Ventures', 'Retail'),
('Reliance Jio Infocomm', 'Telecommunications'),
('Reliance Petroleum', 'Oil & Gas');

-- Insert sample users (password is 'password123' hashed with bcrypt)
INSERT INTO users (email, password, name, role, company_id) VALUES 
('analyst@reliance.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Financial Analyst', 'analyst', 1),
('ceo@reliance.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mukesh Ambani', 'ceo', 1),
('management@reliance.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Top Management', 'top_management', 1),
('analyst@jio.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'JIO Analyst', 'analyst', 2),
('ceo@jio.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'JIO CEO', 'ceo', 2);

-- Insert sample balance sheet data
INSERT INTO balance_sheets (company_id, year, quarter, data, uploaded_by) VALUES 
(1, 2023, 4, '{
  "total_assets": 1500000000000,
  "current_assets": 500000000000,
  "non_current_assets": 1000000000000,
  "total_liabilities": 800000000000,
  "current_liabilities": 200000000000,
  "non_current_liabilities": 600000000000,
  "total_equity": 700000000000,
  "revenue": 800000000000,
  "net_income": 50000000000,
  "cash_and_equivalents": 100000000000,
  "accounts_receivable": 80000000000,
  "inventory": 120000000000,
  "property_plant_equipment": 800000000000,
  "intangible_assets": 200000000000
}', 1),
(2, 2023, 4, '{
  "total_assets": 800000000000,
  "current_assets": 300000000000,
  "non_current_assets": 500000000000,
  "total_liabilities": 400000000000,
  "current_liabilities": 100000000000,
  "non_current_liabilities": 300000000000,
  "total_equity": 400000000000,
  "revenue": 400000000000,
  "net_income": 30000000000,
  "cash_and_equivalents": 80000000000,
  "accounts_receivable": 60000000000,
  "inventory": 40000000000,
  "property_plant_equipment": 300000000000,
  "intangible_assets": 150000000000
}', 4); 