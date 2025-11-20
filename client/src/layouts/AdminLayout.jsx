import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">Ecommerce Admin</div>
        <nav>
          <NavItem to="/admin" label="Dashboard" onNavigate={closeSidebar} />
          <NavItem to="/admin/products" label="Products" onNavigate={closeSidebar} />
          <NavItem to="/admin/orders" label="Orders" onNavigate={closeSidebar} />
          <NavItem to="/admin/customers" label="Customers" onNavigate={closeSidebar} />
          <NavItem to="/admin/settings" label="Settings" onNavigate={closeSidebar} />
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="menu-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <div className="spacer" />
          <div className="topbar-actions">
            {user?.email && <span className="pill">{user.email}</span>}
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
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
