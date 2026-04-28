import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/login', label: 'Login' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/backtesting', label: 'Backtesting' }
];

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="app-title">Bolsa de Valores Guarne Pro</div>
          <div className="app-subtitle">Frontend React + Vite + JavaScript en transici?n controlada</div>
        </div>
        <nav className="app-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
