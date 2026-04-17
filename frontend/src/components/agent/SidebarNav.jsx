// frontend/src/components/agent/SidebarNav.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function SidebarNav({ items }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div className="w-[220px] bg-slate-50 dark:bg-[#0A1628] text-slate-900 dark:text-white min-h-screen flex flex-col fixed top-0 left-0 z-50 border-r border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
          Complaint<span style={{ color: '#00B4A6' }}>IQ</span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">State Bank of India</div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4">
        {items.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg border text-sm font-semibold text-left transition-colors duration-200 ${
                active
                  ? 'bg-slate-100 dark:bg-[#1E3A5F] border-teal-500 text-slate-900 dark:text-white'
                  : 'bg-transparent border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</div>
        <div className="text-xs text-slate-500 dark:text-slate-500 mb-3">{user?.email}</div>
        <div className="flex gap-2 mb-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-2 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
