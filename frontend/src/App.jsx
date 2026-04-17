// frontend/src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Layout from './components/shared/Layout';

// Public
import Login from './pages/Login';

// Customer pages
import NewComplaint from './pages/customer/NewComplaint';
import TrackComplaint from './pages/customer/TrackComplaint';
import ComplaintDetail from './pages/customer/ComplaintDetail';
import SuccessScreen from './pages/customer/SuccessScreen';

// Agent pages
import AgentQueue from './pages/agent/AgentQueue';
import ComplaintWorkView from './pages/agent/ComplaintWorkView';
import Escalations from './pages/agent/Escalations';
import MyPerformance from './pages/agent/MyPerformance';

// Manager pages
import ManagerOverview from './pages/manager/ManagerOverview';
import SLAMonitor from './pages/manager/SLAMonitor';
import RBIReports from './pages/manager/RBIReports';
import AgentPerformance from './pages/manager/AgentPerformance';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                style: { fontFamily: "'DM Sans', sans-serif", fontSize: 13, borderRadius: 10 },
                duration: 4000,
              }}
            />
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* ── Customer routes ── */}
              <Route path="/customer" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Navigate to="/customer/track" replace />
                </ProtectedRoute>
              } />
              <Route path="/customer/new" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Layout>
                    <CustomerTopbar />
                    <NewComplaint />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/customer/track" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Layout>
                    <CustomerTopbar />
                    <TrackComplaint />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/customer/complaint/:id" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Layout>
                    <CustomerTopbar />
                    <ComplaintDetail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/customer/success" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Layout>
                    <CustomerTopbar />
                    <SuccessScreen />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* ── Agent routes — agent OR manager can view ── */}
              <Route path="/agent/queue" element={
                <ProtectedRoute allowedRoles={['agent', 'manager']}>
                  <AgentQueue />
                </ProtectedRoute>
              } />
              <Route path="/agent/complaint/:id" element={
                <ProtectedRoute allowedRoles={['agent', 'manager']}>
                  <ComplaintWorkView />
                </ProtectedRoute>
              } />
              {/* Stub routes so nav links don't 404 */}
              <Route path="/agent/all" element={<ProtectedRoute allowedRoles={['agent', 'manager']}><AgentQueue /></ProtectedRoute>} />
              <Route path="/agent/escalations" element={<ProtectedRoute allowedRoles={['agent', 'manager']}><Escalations /></ProtectedRoute>} />
              <Route path="/agent/performance" element={<ProtectedRoute allowedRoles={['agent', 'manager']}><MyPerformance /></ProtectedRoute>} />

              {/* ── Manager routes ── */}
              <Route path="/manager/overview" element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <ManagerOverview />
                </ProtectedRoute>
              } />
              <Route path="/manager/sla" element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <SLAMonitor />
                </ProtectedRoute>
              } />
              <Route path="/manager/reports" element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <RBIReports />
                </ProtectedRoute>
              } />
              <Route path="/manager/agents" element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <AgentPerformance />
                </ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// ── Customer topbar (inline to keep routing simple) ────────────────────────
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function CustomerTopbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, labels, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(path) {
    if (path === '/customer/new') return location.pathname === '/customer/new';
    if (path === '/customer/track') {
      return location.pathname === '/customer/track' || location.pathname.startsWith('/customer/complaint/');
    }
    return location.pathname.startsWith(path);
  }

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <header className="h-14 sticky top-0 z-50 flex items-center justify-between px-6 bg-white dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg tracking-tight">
          Complaint<span className="text-teal-600">IQ</span>
        </span>
        <nav className="flex gap-1.5 rounded-xl p-1.5 bg-slate-100 border border-slate-200 dark:bg-[#061330] dark:border-[#10254d]">
          {[
            { path: '/customer/new', label: t('File a Complaint') },
            { path: '/customer/track', label: t('Track Complaint') },
          ].map(n => (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-200 ${isActive(n.path)
                ? 'bg-white text-slate-900 border-slate-300 shadow-sm dark:bg-[#0f2144] dark:text-white dark:border-[#1b3568]'
                : 'text-slate-700 border-transparent hover:bg-white hover:text-slate-900 dark:text-white dark:border-white/70 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Language switcher */}
        <div className="flex gap-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          {Object.values(labels).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors duration-200 ${lang === l
                ? 'bg-teal-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
            >
              🇮🇳 {l}
            </button>
          ))}
        </div>

        {user && <span className="text-xs font-medium text-slate-700 dark:text-slate-300">👤 {user.name}</span>}

        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
