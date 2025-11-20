import { useEffect, useState } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import { API_BASE_URL, api, setAuthToken } from './api';
import CustomersPage from './pages/admin/CustomersPage';
import DashboardPage from './pages/admin/DashboardPage';
import OrdersPage from './pages/admin/OrdersPage';
import ProductsPage from './pages/admin/ProductsPage';
import SettingsPage from './pages/admin/SettingsPage';
import Storefront from './pages/Storefront';
import './admin.css';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminRoutes />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Storefront />} />
    </Routes>
  );
}

function AdminRoutes() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    } else {
      setAuthToken(null);
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/api/auth/login', credentials);
      setAuthToken(res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      setMessage('Login successful');
      setCredentials({ email: '', password: '' });
      navigate('/admin/products');
    } catch (error) {
      console.error('Login failed', error);
      setMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    navigate('/admin');
  };

  if (!token) {
    return (
      <div className="container">
        <header>
          <h1>Ecommerce Admin</h1>
          <p>API base URL: {API_BASE_URL}</p>
        </header>
        <form className="card" onSubmit={handleLogin}>
          <h2>Login</h2>
          <label>
            Email
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
          {message && <p className="status">{message}</p>}
        </form>
        <p className="hint">
          Need an account? Create one via <code>/api/auth/register</code> using Postman.
        </p>
      </div>
    );
  }

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
      <Outlet context={{ token, user }} />
    </AdminLayout>
  );
}
