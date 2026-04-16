// frontend/src/components/shared/Header.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const ROLE_BADGE = {
  customer: { label: 'Customer',         bg: '#F0FDFC', color: '#00B4A6' },
  agent:    { label: 'Bank Agent',        bg: '#EFF6FF', color: '#1D4ED8' },
  manager:  { label: 'Compliance Manager',bg: '#F5F3FF', color: '#7C3AED' },
};

export default function Header() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const badge = ROLE_BADGE[role] || {};

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header style={{
      background: '#0A1628', color: '#fff',
      height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: '1px solid #1E293B',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>⚖️</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: -0.5 }}>
          Complaint<span style={{ color: '#00B4A6' }}>IQ</span>
        </span>
        <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>
          State Bank of India
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {(role === 'agent' || role === 'manager') && <NotificationBell />}

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#1E3A5F', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#00B4A6',
            }}>
              {user.name?.[0] || '?'}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
              <span style={{
                fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 7px',
                background: badge.bg, color: badge.color,
              }}>{badge.label}</span>
            </div>
          </div>
        )}

        <button onClick={handleLogout} style={{
          background: '#1E293B', color: '#94A3B8',
          border: 'none', borderRadius: 8, padding: '6px 14px',
          cursor: 'pointer', fontSize: 12, fontWeight: 600,
        }}>
          Logout
        </button>
      </div>
    </header>
  );
}
