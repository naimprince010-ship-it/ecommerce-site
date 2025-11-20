import { useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout({ user, onLogout, outletContext }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const email = user?.email || 'Admin';

  const navItems = useMemo(
    () => [
      { to: '/admin/products', label: 'Dashboard / Products' },
      { to: '/admin/orders', label: 'Orders' },
      { to: '/admin/customers', label: 'Customers' },
      { to: '/admin/settings', label: 'Settings' },
    ],
    [],
  );

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">Super Deal Admin</div>
        <nav>
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} onNavigate={closeSidebar} />
          ))}
        </nav>
        <button type="button" className="ghost" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
            ☰
          </button>
          <div className="project">Super Deal Admin</div>
          <div className="spacer" />
          <div className="topbar-actions">
            <span className="pill subtle">{email}</span>
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
      onClick={onNavigate}
    >
      {label}
    </NavLink>
  );
}
