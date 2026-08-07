import React from 'react';
import {
  ShoppingCart,
  Package,
  Tags,
  LogOut,
  Store,
  Boxes,
  Users,
  BarChart3,
} from 'lucide-react';

interface LayoutProps {
  activeTab:
    | 'pos'
    | 'products'
    | 'categories'
    | 'inventory'
    | 'customers'
    | 'reports';

  setActiveTab: (
    tab:
      | 'pos'
      | 'products'
      | 'categories'
      | 'inventory'
      | 'customers'
      | 'reports'
  ) => void;

  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  children,
}) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">

      {/* Sidebar Lateral */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">

        <div className="space-y-6">

          {/* Logo / Branding */}
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Store className="w-6 h-6" />
            </div>

            <div>
              <h1 className="font-bold text-white text-base leading-tight">
                POS Desktop
              </h1>

              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                Caja & Control
              </span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-1">

            {/* Punto de Venta */}
            <button
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'pos'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Punto de Venta</span>
            </button>

            {/* Productos */}
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Productos</span>
            </button>

            {/* Categorías */}
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'categories'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Tags className="w-4 h-4" />
              <span>Categorías</span>
            </button>

            {/* Inventario */}
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Inventario</span>
            </button>

            {/* Clientes */}
            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'customers'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clientes</span>
            </button>

            {/* Reportes */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'reports'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reportes</span>
            </button>

          </nav>
        </div>

        {/* Footer Sidebar / Logout */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </aside>

      {/* Área de contenido */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        {children}
      </main>

    </div>
  );
};