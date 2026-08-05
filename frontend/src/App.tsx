import React, { useState } from 'react';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { PosScreen } from './pages/PosScreen';
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
      {activeTab === 'pos' && <PosScreen />}

      {activeTab === 'products' && <ProductManager />}

      {activeTab === 'categories' && <CategoryManager />}
    </Layout>
  );
};

export default App;