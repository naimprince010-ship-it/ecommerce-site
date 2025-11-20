import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import { setAuthToken } from './api';
import CustomersPage from './pages/admin/CustomersPage';
import DashboardPage from './pages/admin/DashboardPage';
import LoginPage from './pages/admin/LoginPage';
import OrdersPage from './pages/admin/OrdersPage';
import ProductsPage from './pages/admin/ProductsPage';
import SettingsPage from './pages/admin/SettingsPage';
import Storefront from './pages/Storefront';
import './admin.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    setAuthToken(token || null);
  }, [token]);

  const handleLoginSuccess = (nextToken, nextUser) => {
    setAuthToken(nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  return (
    <Routes>
      <Route path="/admin">
        <Route
          index
          element={<Navigate to={token ? '/admin/products' : '/admin/login'} replace />}
        />
        <Route
          path="login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} token={token} />}
        />
        <Route element={<ProtectedLayout token={token} user={user} onLogout={handleLogout} />}>
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Storefront />} />
    </Routes>
  );
}

function ProtectedLayout({ token, user, onLogout }) {
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout user={user} onLogout={onLogout} outletContext={{ token, user }} />;
}
