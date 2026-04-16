// frontend/src/components/agent/SidebarNav.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SidebarNav({ items }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div style={{
      width: 220, background: '#0A1628', color: '#fff',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid #1E293B' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
          Complaint<span style={{ color: '#00B4A6' }}>IQ</span>
        </div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>State Bank of India</div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '14px 10px' }}>
        {items.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 12px', marginBottom: 4,
              background: active ? '#1E3A5F' : 'transparent',
              border: `1px solid ${active ? '#00B4A6' : 'transparent'}`,
              borderRadius: 10, color: '#fff', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, textAlign: 'left',
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ background: '#DC2626', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '14px 18px', borderTop: '1px solid #1E293B' }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name}</div>
        <div style={{ fontSize: 11, color: '#475569', marginBottom: 10 }}>{user?.email}</div>
        <button onClick={handleLogout} style={{
          width: '100%', background: '#1E293B', color: '#64748B',
          border: 'none', borderRadius: 8, padding: '7px', cursor: 'pointer', fontSize: 12,
        }}>Logout</button>
      </div>
    </div>
  );
}
