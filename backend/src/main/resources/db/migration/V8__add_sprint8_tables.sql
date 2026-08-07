-- V8__add_sprint8_tables.sql

-- 1. Agregar columna is_active en la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Tabla de Configuración del Negocio
CREATE TABLE IF NOT EXISTS business_config (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL DEFAULT 'POS Desktop Store',
    nit VARCHAR(50) DEFAULT '900.000.000-1',
    address VARCHAR(255) DEFAULT 'Calle Principal # 10 - 20',
    phone VARCHAR(50) DEFAULT '300 000 0000',
    email VARCHAR(100) DEFAULT 'contacto@negocio.com',
    tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 19.00,
    logo_url VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Turnos de Caja (Cash Shifts)
CREATE TABLE IF NOT EXISTS cash_shifts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    opened_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITHOUT TIME ZONE,
    initial_base DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    expected_final_amount DECIMAL(12,2),
    actual_final_amount DECIMAL(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    notes TEXT
);

-- 4. Tabla de Egresos / Gastos Operativos (Expenses)
CREATE TABLE IF NOT EXISTS expenses (
    id BIGSERIAL PRIMARY KEY,
    shift_id BIGINT NOT NULL REFERENCES cash_shifts(id),
    category VARCHAR(50) NOT NULL, -- PAYROLL, RAW_MATERIAL, OTHER
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    registered_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración inicial por defecto si no existe
INSERT INTO business_config (id, name, nit, address, phone, email, tax_percentage)
SELECT 1, 'POS Desktop Store', '900.000.000-1', 'Calle Principal # 10 - 20', '300 000 0000', 'contacto@negocio.com', 19.00
WHERE NOT EXISTS (SELECT 1 FROM business_config WHERE id = 1);
