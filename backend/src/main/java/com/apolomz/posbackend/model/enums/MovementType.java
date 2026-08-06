package com.apolomz.posbackend.model.enums;

public enum MovementType {
    ENTRY,       // Entrada manual (compra a proveedor, reabastecimiento)
    EXIT,        // Salida manual (merma, producto dañado/vencido)
    ADJUSTMENT,  // Ajuste por conteo físico
    SALE,        // Descuento automático por venta
    RETURN       // Devolución (reingreso de producto por cliente o anulación)
}