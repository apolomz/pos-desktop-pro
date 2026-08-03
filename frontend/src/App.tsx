import React, { useState } from 'react';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { CategoryManager } from './components/CategoryManager';
import { ProductManager } from './components/ProductManager';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'categories'>('products');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Login onLoginSuccess={(t) => setToken(t)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {activeTab === 'pos' && (
        <div className="p-8 text-center text-slate-400">
          <h2 className="text-xl font-bold text-white mb-2">Módulo de Punto de Venta (Caja)</h2>
          <p className="text-sm">Próximamente en el Sprint 4 🛒</p>
        </div>
      )}

      {activeTab === 'products' && <ProductManager />}

      {activeTab === 'categories' && <CategoryManager />}
    </Layout>
  );
};

export default App;