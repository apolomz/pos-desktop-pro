export const formatExpenseCategory = (category?: string): String => {
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

export const formatRole = (role?: string): String => {
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

export const formatShiftStatus = (status?: string): String => {
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

export const formatPaymentMethod = (method?: string): String => {
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

export const formatCurrency = (amount?: number | null): String => {
  if (amount == null || isNaN(amount)) return '$0';
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
};
