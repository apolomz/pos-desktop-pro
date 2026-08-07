-- Tabla de Clientes
CREATE TABLE customers (
                           id BIGSERIAL PRIMARY KEY,
                           name VARCHAR(150) NOT NULL,
                           document_number VARCHAR(30) UNIQUE,
                           phone VARCHAR(25),
                           email VARCHAR(100),
                           is_active BOOLEAN NOT NULL DEFAULT TRUE,
                           created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relación opcional entre Ventas y Clientes
ALTER TABLE sales
    ADD CONSTRAINT fk_sales_customer
        FOREIGN KEY (customer_id)
            REFERENCES customers(id)
            ON DELETE SET NULL;

-- Índice para consultas de ventas por cliente
CREATE INDEX idx_sales_customer_id
    ON sales(customer_id);