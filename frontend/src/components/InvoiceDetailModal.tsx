import React from 'react';
import { FileText, X, Calendar, User, CreditCard, ShoppingBag, Printer } from 'lucide-react';
import { formatCurrency, formatPaymentMethod } from '../utils/formatters';

export interface SaleDetailItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleInvoiceData {
  id: number;
  sellerUsername: string;
  customerName?: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  details: SaleDetailItem[];
}

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleInvoiceData | null;
  businessName?: string;
  businessNit?: string;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  sale,
  businessName = 'POS Desktop Store',
  businessNit = '900.000.000-1',
}) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Estilos de Impresión CSS Nativos (@media print) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 16px;
            color: #000 !important;
            background: #fff !important;
            font-family: monospace;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Modal Flotante Interactivo UI */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Factura #{sale.id}</h3>
                <p className="text-xs text-slate-400">{businessName} • NIT: {businessNit}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> Fecha:</span>
                <p className="font-semibold text-white">{new Date(sale.createdAt).toLocaleString('es-CO')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-indigo-400" /> Cajero:</span>
                <p className="font-semibold text-white">{sale.sellerUsername}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-indigo-400" /> Cliente:</span>
                <p className="font-semibold text-white">{sale.customerName || 'Cliente General'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Forma Pago:</span>
                <p className="font-semibold text-emerald-400">{formatPaymentMethod(sale.paymentMethod)}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" /> Detalle de Productos
              </h4>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3 text-center">Cant.</th>
                      <th className="py-2.5 px-3 text-right">P. Unit</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sale.details.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-medium text-white">{item.productName}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-indigo-300">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-400">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-200">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Totals */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-200">{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Impuestos (IVA):</span>
                <span className="font-mono text-slate-200">{formatCurrency(sale.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white border-t border-slate-800 pt-2">
                <span>Total Pagado:</span>
                <span className="font-mono text-emerald-400">{formatCurrency(sale.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Descargar Factura</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor Imprimible Oculto para Impresión de Ticket/Factura */}
      <div id="printable-invoice" className="hidden print:block">
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{businessName}</h2>
          <p style={{ fontSize: '12px', margin: '0' }}>NIT: {businessNit}</p>
          <p style={{ fontSize: '12px', margin: '4px 0' }}>----------------------------------------</p>
          <h3 style={{ fontSize: '14px', margin: '4px 0' }}>TICKET DE VENTA #{sale.id}</h3>
        </div>

        <div style={{ fontSize: '12px', marginBottom: '12px', lineHeight: '1.5' }}>
          <div><strong>Fecha:</strong> {new Date(sale.createdAt).toLocaleString('es-CO')}</div>
          <div><strong>Cajero:</strong> {sale.sellerUsername}</div>
          <div><strong>Cliente:</strong> {sale.customerName || 'Cliente General'}</div>
          <div><strong>Pago:</strong> {formatPaymentMethod(sale.paymentMethod)}</div>
        </div>

        <p style={{ fontSize: '12px', margin: '4px 0' }}>----------------------------------------</p>

        <table style={{ width: '100%', fontSize: '11px', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <th style={{ padding: '4px 0' }}>Cant x Producto</th>
              <th style={{ padding: '4px 0', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.details.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px dashed #ccc' }}>
                <td style={{ padding: '4px 0' }}>
                  {item.quantity}x {item.productName} ({formatCurrency(item.unitPrice)})
                </td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ fontSize: '12px', margin: '4px 0' }}>----------------------------------------</p>

        <div style={{ fontSize: '12px', textAlign: 'right', lineHeight: '1.6' }}>
          <div>Subtotal: {formatCurrency(sale.subtotal)}</div>
          <div>IVA: {formatCurrency(sale.tax)}</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
            TOTAL: {formatCurrency(sale.total)}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px' }}>
          <p>¡Gracias por su compra!</p>
          <p>Conserve este ticket para cualquier reclamo.</p>
        </div>
      </div>
    </>
  );
};
