-- Tabla de Categorías (EPIC 3: HU-017 a HU-020)
CREATE TABLE categories (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE,
                            description VARCHAR(255),
                            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos (EPIC 5: HU-025 a HU-029)
CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          name VARCHAR(150) NOT NULL,
                          description TEXT,
                          price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
                          stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
                          min_stock INTEGER NOT NULL DEFAULT 5 CHECK (min_stock >= 0),
                          is_active BOOLEAN NOT NULL DEFAULT TRUE,
                          image_url VARCHAR(255),
                          category_id BIGINT NOT NULL,
                          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Índice para acelerar la búsqueda por nombre (HU-028)
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_active ON products(is_active);