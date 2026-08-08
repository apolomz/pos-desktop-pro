import React, { useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../layouts/Layout';
import { Login } from '../components/Login';

import { PosScreen } from '../pages/PosScreen';
import { ProductManager } from '../components/ProductManager';
import { CategoryManager } from '../components/CategoryManager';
import { InventoryManager } from '../components/InventoryManager';
import { CustomerManager } from '../components/CustomerManager';
import { ReportsDashboard } from '../components/ReportsDashboard';
import { SettingsDashboard } from '../components/SettingsDashboard';
import { AiAssistant } from '../pages/AiAssistant'; // Importación del Asistente IA

export type TabType =
  | 'pos'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'customers'
  | 'reports'
  | 'ai-assistant'
  | 'settings';

const AppLayout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = (): TabType => {
    if (location.pathname.startsWith('/products')) return 'products';
    if (location.pathname.startsWith('/categories')) return 'categories';
    if (location.pathname.startsWith('/inventory')) return 'inventory';
    if (location.pathname.startsWith('/customers')) return 'customers';
    if (location.pathname.startsWith('/reports')) return 'reports';
    if (location.pathname.startsWith('/ai-assistant')) return 'ai-assistant'; // Reconocimiento de ruta activa 'ai-assistant'
    if (location.pathname.startsWith('/settings')) return 'settings';

    return 'pos';
  };

  const handleTabChange = (tab: TabType) => {
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
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

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

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout onLogout={handleLogout} />}>
          <Route
            path="/"
            element={<Navigate to="/pos" replace />}
          />

          <Route
            path="/pos"
            element={<PosScreen />}
          />

          <Route
            path="/products"
            element={<ProductManager />}
          />

          <Route
            path="/categories"
            element={<CategoryManager />}
          />

          <Route
            path="/inventory"
            element={<InventoryManager />}
          />

          <Route
            path="/customers"
            element={<CustomerManager />}
          />

          <Route
            path="/reports"
            element={<ReportsDashboard />}
          />

          {/* Ruta del Asistente Virtual */}
          <Route
            path="/ai-assistant"
            element={<AiAssistant />}
          />

          <Route
            path="/settings"
            element={<SettingsDashboard />}
          />
        </Route>
      </Route>

      {/* Ruta no encontrada */}
      <Route
        path="*"
        element={<Navigate to="/pos" replace />}
      />
    </Routes>
  );
};