import { useEffect, useState } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import Storefront from './pages/Storefront';
import ProductDetails from './pages/ProductDetails';

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (nextPath) => {
    if (nextPath === path) return;
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  };

  const productMatch = path.match(/^\/product\/([^/]+)$/);

  if (path.startsWith('/admin')) {
    return <AdminDashboard />;
  }

  if (productMatch) {
    return <ProductDetails productId={productMatch[1]} onNavigate={navigate} />;
  }

  return <Storefront onNavigate={navigate} />;
}
