import React from 'react';
import { CircleX } from 'lucide-react';

interface Props {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export const ErrorModal: React.FC<Props> = ({
  isOpen,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center text-slate-100 animate-in fade-in zoom-in duration-200">

        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <CircleX size={34} />
        </div>

        <h3 className="text-xl font-bold mb-2">
          Error
        </h3>

        <p className="text-slate-400 text-sm mb-6">
          {message}
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition"
        >
          Entendido
        </button>

      </div>
    </div>
  );
};