import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SuccessModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center text-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
          ✓
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-100">¡Venta Exitosa!</h3>
        <p className="text-slate-400 text-sm mb-6">
          La transacción se ha procesado y el stock fue actualizado correctamente.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};