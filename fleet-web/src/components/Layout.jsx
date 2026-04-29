import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/vehicles', label: 'Véhicules', icon: '🚗' },
  { to: '/drivers', label: 'Chauffeurs', icon: '👤' },
  { to: '/map', label: 'Carte GPS', icon: '🗺️' },
  { to: '/fuel', label: 'Carburant', icon: '⛽' },
  { to: '/history', label: 'Historique', icon: '🕘' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--black)' }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: '240px',
          minWidth: '240px',
          background: 'var(--card)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/fleet-white.png"
              alt="Fleet Manager"
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain',
                mixBlendMode: 'screen',
              }}
            />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Fleet</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                MANAGER
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--muted)',
              letterSpacing: '0.12em',
              padding: '8px 10px',
              marginBottom: '4px',
            }}
          >
            MENU
          </div>

          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '2px',
                color: isActive ? '#fff' : 'var(--muted)',
                background: isActive
                  ? 'linear-gradient(135deg, #6C63FF, #8B85FF)'
                  : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '13px',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 12px rgba(108,99,255,0.3)' : 'none',
                textDecoration: 'none',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(108,99,255,0.12)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.color = 'var(--muted)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '15px' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(108,99,255,0.08)',
              border: '1px solid rgba(108,99,255,0.15)',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name}
              </div>
              <div style={{ fontSize: '11px', color: '#6C63FF', textTransform: 'capitalize' }}>
                {user?.role}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              width: '100%',
              padding: '9px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--muted)',
              fontSize: '12px',
              letterSpacing: '0.04em',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(231,76,60,0.1)';
              e.target.style.borderColor = 'rgba(231,76,60,0.4)';
              e.target.style.color = '#E74C3C';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'var(--border)';
              e.target.style.color = 'var(--muted)';
            }}
          >
            ⏻ Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <header
          style={{
            height: '64px',
            background: 'var(--card)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: '16px',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <span
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: searchFocus ? '#6C63FF' : 'var(--muted)',
                fontSize: '15px',
                transition: 'color 0.2s',
                pointerEvents: 'none',
              }}
            >
              🔎
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="Rechercher..."
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                background: searchFocus ? 'rgba(108,99,255,0.08)' : 'var(--card2)',
                border: `1px solid ${searchFocus ? 'rgba(108,99,255,0.5)' : 'var(--border)'}`,
                borderRadius: '10px',
                color: 'var(--text)',
                fontSize: '13px',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                boxShadow: searchFocus ? '0 0 0 3px rgba(108,99,255,0.1)' : 'none',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '2px',
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Notification button */}
            <button
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                background: 'var(--card2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)';
                e.currentTarget.style.background = 'rgba(108,99,255,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--card2)';
              }}
            >
              🔔
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '7px',
                  height: '7px',
                  background: '#6C63FF',
                  borderRadius: '50%',
                  border: '1.5px solid var(--card)',
                }}
              />
            </button>

            {/* Refresh button */}
            <button
              onClick={() => window.location.reload()}
              style={{
                width: '38px',
                height: '38px',
                background: 'var(--card2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)';
                e.currentTarget.style.background = 'rgba(108,99,255,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--card2)';
              }}
            >
              ↻
            </button>

            <div style={{ width: '1px', height: '28px', background: 'var(--border)', margin: '0 4px' }} />

            {/* Date */}
            <div
              style={{
                padding: '7px 14px',
                background: 'var(--card2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '12px',
                color: 'var(--muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

