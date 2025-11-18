import { useEffect, useMemo, useState } from 'react';
import { api } from './api';

const placeholderImage =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export default function App() {
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, dealsRes] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/products/deals'),
        ]);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setDeals(Array.isArray(dealsRes.data) ? dealsRes.data : []);
      } catch (err) {
        setError('Unable to load products right now. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const bestDeal = deals[0];

  return (
    <div className="app">
      <div className="top-strip">
        <p>
          Today&apos;s Super Discounts — grab limited-time deals before they&apos;re gone!
          <button type="button" className="link-button" onClick={scrollToProducts}>
            Shop deals
          </button>
        </p>
      </div>
      <header className="navbar">
        <div className="nav-brand">Super Discount</div>
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
            <p className="badge">Super Deal of the day</p>
            <h1>
              {bestDeal ? `${bestDeal.name}` : 'Welcome to the Super Discount store'}
            </h1>
            <p className="subtitle">
              {bestDeal
                ? `Save ${bestDeal.discountPercent}% on our top pick today. Limited time only!`
                : 'Discover our latest discounts and everyday essentials.'}
            </p>
            <div className="hero-pricing">
              {bestDeal ? (
                <>
                  <span className="muted strike">${bestDeal.regularPrice?.toFixed(2)}</span>
                  <span className="hero-price">${bestDeal.discountPrice?.toFixed(2)}</span>
                  <span className="pill">-{bestDeal.discountPercent}%</span>
                </>
              ) : (
                <span className="muted">Fresh deals added daily</span>
              )}
            </div>
            <div className="hero-actions">
              <button className="btn primary" onClick={scrollToProducts}>
                Shop Now
              </button>
              <button className="btn ghost" type="button">
                View All Deals
              </button>
            </div>
          </div>
          <div className="hero-visual" aria-hidden>
            <div className="hero-card">
              <span className="pill">Flash Savings</span>
              <h3>Score extra discounts</h3>
              <p>Stack savings on top products every single day.</p>
              <div className="hero-grid">
                <span>Up to 70% off</span>
                <span>Limited drops</span>
                <span>Trusted brands</span>
                <span>Fast shipping</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section deals" id="deals">
          <div className="section-header">
            <p className="badge">Flash Deals</p>
            <div>
              <h2>Today&apos;s Super Discounts</h2>
              <p className="subtitle">Hot picks with the biggest savings right now.</p>
            </div>
          </div>
          {loading && <p className="muted">Loading deals...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <div className="deals-row">
              {deals.length === 0 && <p className="muted">No active deals yet. Check back soon.</p>}
              {deals.map((product) => (
                <article key={product._id} className="deal-card">
                  <div className="deal-image">
                    <img
                      src={product.imageUrl || placeholderImage}
                      alt={product.name}
                      loading="lazy"
                    />
                    <span className="pill">-{product.discountPercent}%</span>
                  </div>
                  <div className="deal-body">
                    <h3>{product.name}</h3>
                    <p className="muted category">{product.category || 'Special deal'}</p>
                    <div className="price-row">
                      <span className="strike">${product.regularPrice?.toFixed(2)}</span>
                      <strong>${product.discountPrice?.toFixed(2)}</strong>
                    </div>
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
            </div>
          )}
        </section>

        <section id="products" className="section">
          <div className="section-header">
            <p className="badge">All Products</p>
            <div>
              <h2>Shop the entire catalog</h2>
              <p className="subtitle">Everything sorted by the biggest discounts first.</p>
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
                    <span className="badge deal">-{product.discountPercent}%</span>
                  </div>
                  <div className="product-body">
                    <div className="product-meta">
                      <h3>{product.name}</h3>
                      <p className="price">
                        <span className="strike">${product.regularPrice?.toFixed(2)}</span>
                        <span className="discount">${product.discountPrice?.toFixed(2)}</span>
                      </p>
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
        <p>© {new Date().getFullYear()} Super Discount. All rights reserved.</p>
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
