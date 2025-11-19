import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const placeholderImage =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80';

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '$0.00';
  return `$${value.toFixed(2)}`;
};

const formatCountdown = (endTime) => {
  if (!endTime) return 'Limited time';
  const diff = new Date(endTime).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) return 'Deal ended';

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
};

const isSuperDealActive = (product) => {
  if (!product?.isSuperDeal) return false;
  const now = Date.now();
  const start = product.dealStart ? new Date(product.dealStart).getTime() : Number.NEGATIVE_INFINITY;
  const end = product.dealEnd ? new Date(product.dealEnd).getTime() : Number.POSITIVE_INFINITY;
  return now >= start && now <= end;
};

export default function ProductDetails({ productId, onNavigate }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useMemo(
    () =>
      typeof onNavigate === 'function'
        ? onNavigate
        : (path) => {
            window.history.pushState({}, '', path);
            window.location.replace(path);
          },
    [onNavigate],
  );

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/products/${productId}`);
        setProduct(response.data || null);
        setError('');
      } catch (err) {
        console.error('Failed to load product', err);
        setError('Unable to load this product right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleAddToCart = () => {
    if (!product) return;
    console.log('Add to cart', product._id);
    setMessage('Added to cart');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xl font-bold text-blue-700"
          >
            Super Discount Bazaar
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Back to Store
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm hover:bg-slate-50"
              aria-label="Cart"
            >
              🛒
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {loading && <p className="text-sm text-slate-600">Loading product...</p>}
        {!loading && error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && product && (
          <div className="grid gap-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[1.1fr,1fr]">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={product.imageUrl || placeholderImage}
                  alt={product.name}
                  className="h-full max-h-[480px] w-full object-cover"
                  loading="lazy"
                />
                {product.imageUrl ? null : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-500">
                    Image coming soon
                  </span>
                )}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    -{product.discountPercent}%
                  </span>
                  {isSuperDealActive(product) && (
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">Super Deal</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {product.category || 'General'}
                </p>
                <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-3xl font-bold text-blue-700">
                  <span>{formatCurrency(product.discountPrice)}</span>
                  <span className="text-lg font-medium text-slate-500 line-through">
                    {formatCurrency(product.regularPrice)}
                  </span>
                </div>
                {isSuperDealActive(product) && (
                  <p className="text-sm font-semibold text-orange-600">
                    Ends in {formatCountdown(product.dealEnd)}
                  </p>
                )}
                <p className="text-sm font-semibold text-emerald-700">
                  Stock: {typeof product.stock === 'number' ? product.stock : 'N/A'}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-slate-700">{product.description || 'No description available.'}</p>

              <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">Secure checkout</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Fast delivery</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Easy returns</span>
              </div>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Continue shopping
                </button>
                {message && <span className="text-sm font-semibold text-emerald-700">{message}</span>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
