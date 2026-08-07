-- V7__add_report_indexes.sql

-- Índices para acelerar agrupaciones y filtros del Dashboard de Reportes
CREATE INDEX IF NOT EXISTS idx_sales_created_at_status ON sales(created_at, status);
CREATE INDEX IF NOT EXISTS idx_sale_details_sale_id ON sale_details(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_details_product_id ON sale_details(product_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_min ON products(stock, min_stock);