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

export default function Storefront() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  const limit = 8;

  const activeDeals = useMemo(() => deals.filter(isSuperDealActive), [deals]);
  const bestDeal = activeDeals[0];

  const fetchDeals = async () => {
    setLoadingDeals(true);
    try {
      const response = await api.get('/api/products/deals');
      const data = Array.isArray(response.data) ? response.data : [];
      const sorted = [...data].sort(
        (a, b) => Number(b.discountPercent || 0) - Number(a.discountPercent || 0),
      );
      setDeals(sorted);
      setError('');
    } catch (err) {
      console.error('Error loading deals', err);
      setError('Unable to load deals right now. Please try again later.');
    } finally {
      setLoadingDeals(false);
    }
  };

  const fetchProducts = async (pageToLoad = page, categoryFilter = category) => {
    setLoadingProducts(true);
    try {
      const response = await api.get('/api/products', {
        params: {
          page: pageToLoad,
          limit,
          ...(categoryFilter ? { category: categoryFilter } : {}),
        },
      });

      const { products: list = [], totalPages: pages = 1 } = response.data || {};
      const normalized = Array.isArray(list) ? list : [];
      const filtered = categoryFilter
        ? normalized.filter((item) => item.category === categoryFilter)
        : normalized;
      setProducts(filtered);
      setTotalPages(pages || 1);
      setError('');
    } catch (err) {
      console.error('Error loading products', err);
      setError('Unable to load products right now. Please try again later.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/products/categories');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error loading categories', err);
    }
  };

  useEffect(() => {
    fetchDeals();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(page, category);
  }, [page, category]);

  useEffect(() => {
    if (!bestDeal) {
      setTimeLeft('');
      return undefined;
    }

    const updateTime = () => {
      setTimeLeft(formatCountdown(bestDeal.dealEnd));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [bestDeal]);

  const handleCategoryChange = (event) => {
    const nextCategory = event.target.value;
    setCategory(nextCategory);
    setPage(1);
  };

  const scrollToProducts = () => {
    const target = document.getElementById('products');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  const featurePoints = useMemo(
    () => [
      'Fast, reliable delivery on every order',
      'Curated, quality products only',
      'Secure checkout with trusted providers',
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-blue-600 text-white text-sm md:text-base">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <p className="font-medium">Today&apos;s Super Discounts are live</p>
          <div className="flex items-center gap-3 text-blue-100">
            <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide">Don&apos;t miss out</span>
            <button
              type="button"
              onClick={scrollToProducts}
              className="rounded-full border border-white/30 px-4 py-1 text-sm font-semibold hover:bg-white hover:text-blue-700"
            >
              Shop deals
            </button>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl items-center gap-3 px-4 py-4 md:grid-cols-[auto,1fr,auto]">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-blue-700">Super Discount Bazaar</div>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
              <span className="text-slate-500">🔍</span>
              <input
                type="search"
                placeholder="Search deals"
                className="w-48 border-none text-sm font-medium text-slate-700 outline-none"
              />
            </div>
          </div>
          <nav className="hidden items-center justify-center gap-6 text-sm font-semibold text-slate-700 md:flex">
            <a href="#hero" className="hover:text-blue-700">
              Home
            </a>
            <button type="button" onClick={scrollToProducts} className="hover:text-blue-700">
              Shop
            </button>
            <a href="#contact" className="hover:text-blue-700">
              Contact
            </a>
            <a href="/admin" className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50">
              Admin
            </a>
          </nav>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm hover:bg-slate-50"
              aria-label="Cart"
            >
              🛒
            </button>
            <a
              href="/admin"
              className="inline-flex rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              Admin
            </a>
            <button
              type="button"
              onClick={scrollToProducts}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Shop Now
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section id="hero" className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-8 text-white shadow-lg">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> Active super deal
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {bestDeal ? bestDeal.name : 'Unbeatable discounts, every day'}
            </h1>
            <p className="mt-4 max-w-xl text-base text-blue-100 sm:text-lg">
              {bestDeal
                ? `Save ${bestDeal.discountPercent}% on our best pick. Grab it before the clock runs out!`
                : 'Discover fresh super deals, slashed prices, and curated picks tailored for you.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {bestDeal ? (
                <>
                  <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
                    {formatCurrency(bestDeal.discountPrice)}
                  </span>
                  <span className="text-blue-100 line-through">{formatCurrency(bestDeal.regularPrice)}</span>
                  <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-emerald-900">
                    -{bestDeal.discountPercent}%
                  </span>
                  <span className="rounded-full bg-orange-400/90 px-3 py-1 text-xs font-bold text-orange-950">
                    {timeLeft || 'Limited time'}
                  </span>
                </>
              ) : (
                <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">Fresh deals dropping daily</span>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToProducts}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-md transition hover:-translate-y-0.5"
              >
                Shop Super Deals
              </button>
              <button
                type="button"
                onClick={fetchDeals}
                className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Refresh deals
              </button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-blue-50">
              {featurePoints.map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Flash Deals</h2>
              <p className="mt-2 text-sm text-slate-600">
                Active super deals sorted by biggest savings.
              </p>
              {loadingDeals && <p className="mt-4 text-sm text-slate-500">Loading deals...</p>}
              {!loadingDeals && activeDeals.length === 0 && (
                <p className="mt-4 text-sm text-slate-500">No active deals right now. Check back soon.</p>
              )}
              {!loadingDeals && activeDeals.length > 0 && (
                <div className="mt-4 space-y-3">
                  {activeDeals.slice(0, 3).map((deal) => (
                    <div
                      key={deal._id}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"
                    >
                      <img
                        src={deal.imageUrl || placeholderImage}
                        alt={deal.name}
                        className="h-14 w-14 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{deal.name}</p>
                        <p className="text-xs text-slate-600">{deal.category || 'Deal'}</p>
                        <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-blue-700">
                          <span>{formatCurrency(deal.discountPrice)}</span>
                          <span className="text-xs text-slate-500 line-through">
                            {formatCurrency(deal.regularPrice)}
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            -{deal.discountPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Why shop with us</h2>
              <p className="mt-2 text-sm text-slate-600">Trusted experience, better value.</p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">⚡</span>
                  <div>
                    <p className="font-semibold">Fast delivery</p>
                    <p className="text-xs text-slate-500">Speedy shipping on all orders.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">✨</span>
                  <div>
                    <p className="font-semibold">Quality items</p>
                    <p className="text-xs text-slate-500">Curated catalog, trusted brands.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-700">🔒</span>
                  <div>
                    <p className="font-semibold">Secure checkout</p>
                    <p className="text-xs text-slate-500">Protected payment options.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="super-deals">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">Super Deals</p>
              <h2 id="super-deals" className="text-2xl font-bold text-slate-900">
                Biggest savings happening now
              </h2>
            </div>
            <button
              type="button"
              onClick={fetchDeals}
              className="text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
          {loadingDeals && <p className="text-sm text-slate-600">Loading deals...</p>}
          {!loadingDeals && activeDeals.length === 0 && (
            <p className="text-sm text-slate-600">No active super deals at the moment.</p>
          )}
          {!loadingDeals && activeDeals.length > 0 && (
            <div className="no-scrollbar -mx-2 flex gap-4 overflow-x-auto pb-4">
              {activeDeals.map((deal) => (
                <article
                  key={deal._id}
                  className="min-w-[260px] max-w-[260px] flex-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-xl">
                    <img
                      src={deal.imageUrl || placeholderImage}
                      alt={deal.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      -{deal.discountPercent}%
                    </span>
                    {isSuperDealActive(deal) && (
                      <span className="absolute right-2 top-2 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                        Super Deal
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-semibold text-slate-900">{deal.name}</p>
                    <p className="text-xs text-slate-500">{deal.category || 'Deal'}</p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                      <span>{formatCurrency(deal.discountPrice)}</span>
                      <span className="text-xs text-slate-500 line-through">{formatCurrency(deal.regularPrice)}</span>
                    </div>
                    {isSuperDealActive(deal) && (
                      <p className="text-xs font-semibold text-orange-600">
                        Ends in {formatCountdown(deal.dealEnd)}
                      </p>
                    )}
                    <p className="text-xs font-medium text-emerald-700">
                      Stock: {typeof deal.stock === 'number' ? deal.stock : 'N/A'}
                    </p>
                    <button
                      type="button"
                      className="mt-2 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      onClick={() => console.log('Add to cart', deal.name)}
                    >
                      Add to cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="products" className="mt-12" aria-labelledby="all-products">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">All Products</p>
              <h2 id="all-products" className="text-2xl font-bold text-slate-900">
                Shop the entire catalog
              </h2>
              <p className="text-sm text-slate-600">Sorted by biggest discount first.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold text-slate-700" htmlFor="category-filter">
                Category
              </label>
              <select
                id="category-filter"
                value={category}
                onChange={handleCategoryChange}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {loadingProducts ? (
            <p className="mt-6 text-sm text-slate-600">Loading products...</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <article
                  key={product._id}
                  className="group flex h-full flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
                    <img
                      src={product.imageUrl || placeholderImage}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      -{product.discountPercent}%
                    </span>
                    {isSuperDealActive(product) && (
                      <span className="absolute right-2 top-2 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                        Super Deal
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                        {product.category || 'General'}
                      </p>
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <p className="text-sm text-slate-600">{product.description}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-lg font-bold text-blue-700">
                        <span>{formatCurrency(product.discountPrice)}</span>
                        <span className="text-sm font-medium text-slate-500 line-through">
                          {formatCurrency(product.regularPrice)}
                        </span>
                      </div>
                      {isSuperDealActive(product) && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-orange-600">
                          <span>Ends in {formatCountdown(product.dealEnd)}</span>
                        </div>
                      )}
                      <p className="text-xs font-medium text-emerald-700">
                        Stock: {typeof product.stock === 'number' ? product.stock : 'N/A'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => console.log('Add to cart', product.name)}
                      className="mt-auto rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      Add to cart
                    </button>
                  </div>
                </article>
              ))}
              {products.length === 0 && !loadingProducts && (
                <p className="text-sm text-slate-600">No products available.</p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-bold text-blue-700">Super Discount</p>
            <p className="text-sm text-slate-600">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold text-slate-700">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="hover:text-blue-700">
              Instagram
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="hover:text-blue-700">
              Facebook
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noreferrer" className="hover:text-blue-700">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
