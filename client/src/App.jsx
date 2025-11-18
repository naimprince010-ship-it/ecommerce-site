import { useEffect, useMemo, useState } from 'react';
import { api } from './api';

const placeholderImage =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/api/products');
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Unable to load products right now. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const features = useMemo(
    () => [
      {
        title: 'Fast delivery',
        description: 'Reliable shipping that gets your order to you quickly.',
      },
      {
        title: 'Quality products',
        description: 'Carefully curated items from trusted suppliers.',
      },
      {
        title: 'Secure payment',
        description: 'Protected checkout process with multiple options.',
      },
    ],
    [],
  );

  const scrollToProducts = () => {
    const section = document.getElementById('products');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddToCart = (productName) => {
    console.log(`Add to Cart clicked for ${productName}`);
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="nav-brand">Ecommerce Store</div>
        <nav className="nav-links">
          <a href="#hero">Home</a>
          <button type="button" onClick={scrollToProducts} className="link-button">
            Shop
          </button>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section id="hero" className="hero">
          <div className="hero-content">
            <p className="badge">New season arrivals</p>
            <h1>Discover products you&apos;ll love.</h1>
            <p className="subtitle">
              Curated collections, modern styles, and everyday essentials — all in one place.
            </p>
            <div className="hero-actions">
              <button className="btn primary" onClick={scrollToProducts}>
                Shop Now
              </button>
              <button className="btn ghost" type="button">
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-visual" aria-hidden>
            <div className="hero-card">
              <span className="pill">Bestseller</span>
              <h3>Everyday Essentials</h3>
              <p>Everything you need for your daily routine, selected by our team.</p>
              <div className="hero-grid">
                <span>Quality</span>
                <span>Comfort</span>
                <span>Style</span>
                <span>Value</span>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="section">
          <div className="section-header">
            <p className="badge">Shop</p>
            <div>
              <h2>Products you might like</h2>
              <p className="subtitle">Hand-picked items from our latest collection.</p>
            </div>
          </div>

          {loading && <p className="muted">Loading products...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            <div className="products-grid">
              {products.map((product) => (
                <article key={product._id} className="product-card">
                  <div className="product-image">
                    <img
                      src={product.imageUrl || placeholderImage}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="product-body">
                    <div className="product-meta">
                      <h3>{product.name}</h3>
                      <p className="price">${product.price?.toFixed(2) || '—'}</p>
                    </div>
                    <p className="description">{product.description}</p>
                    <button
                      className="btn primary full"
                      type="button"
                      onClick={() => handleAddToCart(product.name)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
              {products.length === 0 && <p className="muted">No products available yet.</p>}
            </div>
          )}
        </section>

        <section className="section why-us" id="contact">
          <div className="section-header">
            <p className="badge">Why shop with us</p>
            <h2>We make online shopping simple</h2>
          </div>
          <div className="features-grid">
            {features.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <div className="icon-circle" aria-hidden>
                  <span>✓</span>
                </div>
                <h3>{feature.title}</h3>
                <p className="description">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Ecommerce Store. All rights reserved.</p>
        <div className="social-links">
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
            Facebook
          </a>
          <a href="https://www.twitter.com" target="_blank" rel="noreferrer">
            Twitter
          </a>
        </div>
      </footer>
    </div>
  );
}
