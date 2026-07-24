-- Indices para las columnas mas consultadas (buscar por nombre, listar por tienda).
-- No existian en el esquema generado por Hibernate.

CREATE INDEX idx_producto_tienda ON tbl_producto(tienda_id);
CREATE INDEX idx_producto_nombre ON tbl_producto(nombre);
CREATE INDEX idx_valoracion_tienda ON tbl_valoracion(tienda_id);
