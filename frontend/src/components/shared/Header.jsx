// frontend/src/components/shared/Header.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';

const ROLE_BADGE = {
  customer: { label: 'Customer',         bg: '#F0FDFC', color: '#00B4A6' },
  agent:    { label: 'Bank Agent',        bg: '#EFF6FF', color: '#1D4ED8' },
  manager:  { label: 'Compliance Manager',bg: '#F5F3FF', color: '#7C3AED' },
};

export default function Header() {
  const { user, role, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const badge = ROLE_BADGE[role] || {};

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="h-14 sticky top-0 z-100 flex items-center justify-between px-6 bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center gap-2">
        <span className="text-2xl">⚖️</span>
        <span className="font-bold text-lg tracking-tight">
          Complaint<span className="text-teal-600">IQ</span>
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
          State Bank of India
        </span>
      </div>

      <div className="flex items-center gap-3">
        {(role === 'agent' || role === 'manager') && <NotificationBell />}

        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-xs font-bold text-white">
              {user.name?.[0] || '?'}
            </div>
            <div>
              <div className="text-sm font-semibold">{user.name}</div>
              <span className="text-xs font-bold rounded-lg px-2 py-0.5 inline-block" style={{ background: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            </div>
          </div>
        )}

        <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200">
          Logout
        </button>
      </div>
    </header>
  );
}
