-- Tabla para auditoría e historial de movimientos de inventario
CREATE TABLE inventory_movements (
                                     id BIGSERIAL PRIMARY KEY,
                                     product_id BIGINT NOT NULL,
                                     type VARCHAR(20) NOT NULL,
                                     quantity INT NOT NULL,
                                     previous_stock INT NOT NULL,
                                     new_stock INT NOT NULL,
                                     reason VARCHAR(255),
                                     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     CONSTRAINT fk_inventory_movement_product FOREIGN KEY (product_id) REFERENCES products(id)
);