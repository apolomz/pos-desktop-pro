-- Tabla principal de Ventas
CREATE TABLE sales (
                       id BIGSERIAL PRIMARY KEY,
                       user_id BIGINT NOT NULL,
                       customer_id BIGINT, -- Opcional (HU-014)
                       subtotal DECIMAL(12, 2) NOT NULL,
                       tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                       total DECIMAL(12, 2) NOT NULL,
                       payment_method VARCHAR(30) NOT NULL, -- CASH, CARD, TRANSFER
                       status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED', -- COMPLETED, CANCELLED
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_sales_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de Detalle de Venta
CREATE TABLE sale_details (
                              id BIGSERIAL PRIMARY KEY,
                              sale_id BIGINT NOT NULL,
                              product_id BIGINT NOT NULL,
                              quantity INT NOT NULL,
                              unit_price DECIMAL(12, 2) NOT NULL,
                              subtotal DECIMAL(12, 2) NOT NULL,
                              CONSTRAINT fk_sale_details_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
                              CONSTRAINT fk_sale_details_product FOREIGN KEY (product_id) REFERENCES products(id)
);