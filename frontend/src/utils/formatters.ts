export const formatExpenseCategory = (category?: string): string => {
  if (!category) return 'Otro Egreso';
  switch (category.toUpperCase()) {
    case 'PAYROLL':
      return 'Pago de Nómina / Sueldos';
    case 'RAW_MATERIAL':
      return 'Insumos y Materia Prima';
    case 'OTHER':
      return 'Otros Egresos';
    default:
      return category;
  }
};

export const formatRole = (role?: string): string => {
  if (!role) return 'Usuario';
  const cleanRole = role.toUpperCase().replace('ROLE_', '');
  switch (cleanRole) {
    case 'ADMIN':
      return 'Administrador';
    case 'CASHIER':
      return 'Cajero';
    default:
      return cleanRole;
  }
};

export const formatShiftStatus = (status?: string): string => {
  if (!status) return 'Desconocido';
  switch (status.toUpperCase()) {
    case 'OPEN':
      return 'Abierto';
    case 'CLOSED':
      return 'Cerrado';
    default:
      return status;
  }
};

export const formatPaymentMethod = (method?: string): string => {
  if (!method) return 'Efectivo';
  switch (method.toUpperCase()) {
    case 'CASH':
      return 'Efectivo';
    case 'CARD':
      return 'Tarjeta Débito/Crédito';
    case 'TRANSFER':
      return 'Transferencia Bancaria / Nequi / Daviplata';
    default:
      return method;
  }
};

export const formatMovementType = (type?: string): string => {
  if (!type) return 'Movimiento';
  switch (type.toUpperCase()) {
    case 'SALE':
    case 'OUT':
      return 'Venta (Salida)';
    case 'ENTRY':
    case 'IN':
      return 'Entrada de Inventario';
    case 'ADJUSTMENT':
      return 'Ajuste Manual';
    case 'PURCHASE':
      return 'Compra / Recepción';
    case 'RETURN':
      return 'Devolución';
    default:
      return type;
  }
};

export const formatCurrency = (amount?: number | null): string => {
  if (amount == null || isNaN(amount)) return '$0';
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
};
