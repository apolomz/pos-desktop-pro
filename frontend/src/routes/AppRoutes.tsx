import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../components/Layout';
import { Login } from '../components/Login';
import { PosScreen } from '../pages/PosScreen';
import { ProductManager } from '../components/ProductManager';
import { CategoryManager } from '../components/CategoryManager';

// Wrapper que adapta la URL al componente Layout existente
const AppLayout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mapea la ruta actual ('/pos', '/products', '/categories') a la tab activa
  const getActiveTab = (): 'pos' | 'products' | 'categories' => {
    if (location.pathname.startsWith('/products')) return 'products';
    if (location.pathname.startsWith('/categories')) return 'categories';
    return 'pos';
  };

  const handleTabChange = (tab: 'pos' | 'products' | 'categories') => {
    navigate(`/${tab}`);
  };

  return (
    <Layout
      activeTab={getActiveTab()}
      setActiveTab={handleTabChange}
      onLogout={onLogout}
    >
      <Outlet />
    </Layout>
  );
};

export const AppRoutes: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    navigate('/pos');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  return (
    <Routes>
      {/* Ruta Pública */}
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/pos" replace />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      {/* Rutas Protegidas en bloque */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout onLogout={handleLogout} />}>
          <Route path="/" element={<Navigate to="/pos" replace />} />
          <Route path="/pos" element={<PosScreen />} />
          <Route path="/products" element={<ProductManager />} />
          <Route path="/categories" element={<CategoryManager />} />
        </Route>
      </Route>

      {/* Redirección ante rutas no encontradas */}
      <Route path="*" element={<Navigate to="/pos" replace />} />
    </Routes>
  );
};