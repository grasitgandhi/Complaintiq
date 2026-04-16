// frontend/src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Public
import Login from './pages/Login';

// Customer pages
import NewComplaint   from './pages/customer/NewComplaint';
import TrackComplaint from './pages/customer/TrackComplaint';
import ComplaintDetail from './pages/customer/ComplaintDetail';
import SuccessScreen  from './pages/customer/SuccessScreen';

// Agent pages
import AgentQueue        from './pages/agent/AgentQueue';
import ComplaintWorkView from './pages/agent/ComplaintWorkView';

// Manager pages
import ManagerOverview  from './pages/manager/ManagerOverview';
import SLAMonitor       from './pages/manager/SLAMonitor';
import RBIReports       from './pages/manager/RBIReports';
import AgentPerformance from './pages/manager/AgentPerformance';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { 
              fontFamily: "'Inter', sans-serif", 
              fontSize: 14, 
              borderRadius: 12,
              padding: '12px 16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            },
            duration: 4000,
            success: {
              style: {
                background: '#10B981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
              },
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Customer routes */}
          <Route path="/customer" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Navigate to="/customer/track" replace />
            </ProtectedRoute>
          } />
          <Route path="/customer/new" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
                <CustomerTopbar />
                <NewComplaint />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/customer/track" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
                <CustomerTopbar />
                <TrackComplaint />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/customer/complaint/:id" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
                <CustomerTopbar />
                <ComplaintDetail />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/customer/success" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
                <CustomerTopbar />
                <SuccessScreen />
              </div>
            </ProtectedRoute>
          } />

          {/* Agent routes */}
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
          <Route path="/agent/all"         element={<ProtectedRoute allowedRoles={['agent','manager']}><AgentQueue /></ProtectedRoute>} />
          <Route path="/agent/escalations" element={<ProtectedRoute allowedRoles={['agent','manager']}><AgentQueue /></ProtectedRoute>} />
          <Route path="/agent/performance" element={<ProtectedRoute allowedRoles={['agent','manager']}><AgentQueue /></ProtectedRoute>} />

          {/* Manager routes */}
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
    </AuthProvider>
  );
}

// Customer topbar component
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function CustomerTopbar() {
  const { user, logout }       = useAuth();
  const navigate               = useNavigate();
  const location               = useLocation();
  const [activeLang, setActiveLang] = useState('EN');

  const LANG_LABELS = {
    EN:      { file: 'File a Complaint', track: 'Track Complaint' },
    HI:      { file: 'शिकायत दर्ज करें', track: 'शिकायत ट्रैक करें' },
    TA:      { file: 'புகார் தாக்கல்', track: 'புகாரை கண்காணி' },
    MR:      { file: 'तक्रार दाखल करा', track: 'तक्रार ट्रॅक करा' },
  };
  const t = LANG_LABELS[activeLang] || LANG_LABELS.EN;

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <header style={{
      background: 'linear-gradient(90deg, #0B1629 0%, #1A2F50 100%)',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/customer/track')}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #00C6B5, #009E90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: -0.5 }}>
            Complaint<span style={{ color: '#00C6B5' }}>IQ</span>
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {[
            { path: '/customer/new', label: t.file, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> },
            { path: '/customer/track', label: t.track, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
          ].map(n => {
            const isActive = location.pathname === n.path;
            return (
              <button
                key={n.path}
                onClick={() => navigate(n.path)}
                style={{
                  background: isActive ? '#00C6B5' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 18px',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              >
                {n.icon}
                {n.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Language switcher */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 3 }}>
          {[
            { code: 'EN', label: 'EN' },
            { code: 'HI', label: 'HI' },
            { code: 'TA', label: 'TA' },
            { code: 'MR', label: 'MR' },
          ].map(l => (
            <button
              key={l.code}
              onClick={() => setActiveLang(l.code)}
              style={{
                background: activeLang === l.code ? '#00C6B5' : 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* User info */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00C6B5, #009E90)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
            }}>
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>{user.name}</span>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#94A3B8',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
            e.currentTarget.style.color = '#EF4444';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '#94A3B8';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
