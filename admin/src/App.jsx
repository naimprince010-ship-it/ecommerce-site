import { useEffect, useState } from 'react';
import { api, API_BASE_URL, setAuthToken } from './api';

function App() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', description: '' });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      fetchProducts();
    } else {
      setAuthToken(null);
    }
  }, [token]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to load products', error);
      setMessage('Failed to load products');
    }
  };

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
    } catch (error) {
      console.error('Login failed', error);
      setMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('description', form.description);
      if (image) {
        formData.append('image', image);
      }

      await api.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Product created');
      setForm({ name: '', price: '', description: '' });
      setImage(null);
      await fetchProducts();
    } catch (error) {
      console.error('Create failed', error);
      setMessage(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Delete failed', error);
      setMessage('Failed to delete product');
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
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
              onChange={(e) =>
                setCredentials((prev) => ({ ...prev, email: e.target.value }))
              }
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
          Need an account? Create one via <code>/api/auth/register</code> using
          Postman.
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Signed in as {user?.email}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="grid">
        <form className="card" onSubmit={handleCreate}>
          <h2>Create Product</h2>
          <label>
            Name
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Price
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, price: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </label>
          <label>
            Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Create'}
          </button>
          {message && <p className="status">{message}</p>}
        </form>

        <div className="card">
          <h2>Products</h2>
          {products.length === 0 ? (
            <p>No products yet.</p>
          ) : (
            <ul className="product-list">
              {products.map((product) => (
                <li key={product._id} className="product-item">
                  <div>
                    <strong>{product.name}</strong>
                    <p>${product.price}</p>
                    {product.description && (
                      <p className="muted">{product.description}</p>
                    )}
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="thumb"
                      />
                    )}
                  </div>
                  <button onClick={() => handleDelete(product._id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
