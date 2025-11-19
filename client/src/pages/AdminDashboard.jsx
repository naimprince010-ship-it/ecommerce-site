import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, api, setAuthToken } from '../api';
import '../admin.css';

const sortByDiscount = (items) =>
  [...items].sort((a, b) => Number(b.discountPercent || 0) - Number(a.discountPercent || 0));

export default function AdminDashboard() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    regularPrice: '',
    discountPrice: '',
    description: '',
    category: '',
    isSuperDeal: false,
    dealStart: '',
    dealEnd: '',
    stock: '',
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sortedProducts = useMemo(() => sortByDiscount(products), [products]);

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
      const list = Array.isArray(res.data?.products) ? res.data.products : [];
      setProducts(list);
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

  const discountPercent = (() => {
    const regular = Number(form.regularPrice);
    const discount = Number(form.discountPrice);
    if (!Number.isFinite(regular) || regular <= 0 || !Number.isFinite(discount)) {
      return 0;
    }
    return Math.max(0, Math.round(((regular - discount) / regular) * 100));
  })();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const regular = Number(form.regularPrice);
    const discount = Number(form.discountPrice);
    if (!form.name || Number.isNaN(regular) || Number.isNaN(discount)) {
      setMessage('Name, regular price and discount price are required');
      setLoading(false);
      return;
    }

    if (discount >= regular) {
      setMessage('Discount price must be less than regular price');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('regularPrice', regular);
      formData.append('discountPrice', discount);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('isSuperDeal', form.isSuperDeal);
      if (form.dealStart) formData.append('dealStart', form.dealStart);
      if (form.dealEnd) formData.append('dealEnd', form.dealEnd);
      if (form.stock !== '') formData.append('stock', form.stock);
      if (image) {
        formData.append('image', image);
      }

      await api.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Product created');
      setForm({
        name: '',
        regularPrice: '',
        discountPrice: '',
        description: '',
        category: '',
        isSuperDeal: false,
        dealStart: '',
        dealEnd: '',
        stock: '',
      });
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
    <div className="container">
      <header>
        <div>
          <h1>Ecommerce Admin</h1>
          <p className="muted">{API_BASE_URL}</p>
        </div>
        <div className="header-actions">
          {user && <span className="pill">{user.name}</span>}
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="grid">
        <form className="card" onSubmit={handleCreate}>
          <h2>Create Product</h2>
          <div className="grid two-col">
            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </label>
            <label>
              Category
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              />
            </label>
            <label>
              Regular Price
              <input
                type="number"
                value={form.regularPrice}
                onChange={(e) => setForm((prev) => ({ ...prev, regularPrice: e.target.value }))}
                required
              />
            </label>
            <label>
              Discount Price
              <input
                type="number"
                value={form.discountPrice}
                onChange={(e) => setForm((prev) => ({ ...prev, discountPrice: e.target.value }))}
                required
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.isSuperDeal}
                onChange={(e) => setForm((prev) => ({ ...prev, isSuperDeal: e.target.checked }))}
              />
              Mark as super deal
            </label>
            <label>
              Deal start
              <input
                type="datetime-local"
                value={form.dealStart}
                onChange={(e) => setForm((prev) => ({ ...prev, dealStart: e.target.value }))}
              />
            </label>
            <label>
              Deal end
              <input
                type="datetime-local"
                value={form.dealEnd}
                onChange={(e) => setForm((prev) => ({ ...prev, dealEnd: e.target.value }))}
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </label>
          <label>
            Product image
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </label>
          {image && <img src={URL.createObjectURL(image)} alt="Preview" className="thumb" />}
          <div className="pill success">Discount: {discountPercent}%</div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Create product'}
          </button>
          {message && <p className="status">{message}</p>}
        </form>

        <div className="card">
          <div className="header">
            <h2>Products</h2>
            <p className="muted">Sorted by biggest discount</p>
          </div>
          <ul className="product-list">
            {sortedProducts.map((product) => (
              <li key={product._id} className="product-item">
                <div>
                  <div className="pill small">-{product.discountPercent}%</div>
                  <p className="muted">{product.category || 'General'}</p>
                  <strong>{product.name}</strong>
                  <p className="muted">${product.discountPrice}</p>
                  {product.isSuperDeal && <div className="pill success">Super Deal</div>}
                </div>
                <button type="button" onClick={() => handleDelete(product._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
