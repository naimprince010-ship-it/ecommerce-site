import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, api } from '../../api';

export default function LoginPage({ onLoginSuccess, token }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/admin/products', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/api/auth/login', credentials);
      onLoginSuccess(res.data.token, res.data.user);
      setMessage('Login successful');
      setCredentials({ email: '', password: '' });
      navigate('/admin/products', { replace: true });
    } catch (error) {
      console.error('Login failed', error);
      setMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container narrow">
      <header className="stacked">
        <h1>Admin Login</h1>
        <p className="muted">API base URL: {API_BASE_URL}</p>
      </header>
      <form className="card" onSubmit={handleLogin}>
        <h2>Sign in</h2>
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
            onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
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
