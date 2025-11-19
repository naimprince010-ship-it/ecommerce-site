import { useEffect, useState } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import Storefront from './pages/Storefront';

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (path.startsWith('/admin')) {
    return <AdminDashboard />;
  }

  return <Storefront />;
}
