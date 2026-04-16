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
              <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif" }}>
                <CustomerTopbar />
                <NewComplaint />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/customer/track" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif" }}>
                <CustomerTopbar />
                <TrackComplaint />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/customer/complaint/:id" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif" }}>
                <CustomerTopbar />
                <ComplaintDetail />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/customer/success" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif" }}>
                <CustomerTopbar />
                <SuccessScreen />
              </div>
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
          <Route path="/agent/all"         element={<ProtectedRoute allowedRoles={['agent','manager']}><AgentQueue /></ProtectedRoute>} />
          <Route path="/agent/escalations" element={<ProtectedRoute allowedRoles={['agent','manager']}><AgentQueue /></ProtectedRoute>} />
          <Route path="/agent/performance" element={<ProtectedRoute allowedRoles={['agent','manager']}><AgentQueue /></ProtectedRoute>} />

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
    </AuthProvider>
  );
}

// ── Customer topbar (inline to keep routing simple) ────────────────────────
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function CustomerTopbar() {
  const { user, logout }       = useAuth();
  const navigate               = useNavigate();
  const location               = useLocation();
  const [activeLang, setActiveLang] = useState('EN');

  const LANG_LABELS = {
    EN:      { file: 'File a Complaint', track: 'Track Complaint' },
    'हिं':  { file: 'शिकायत दर्ज करें', track: 'शिकायत ट्रैक करें' },
    'தமி':  { file: 'புகார் தாக்கல்',   track: 'புகாரை கண்காணி' },
    'मराठी': { file: 'तक्रार दाखल करा', track: 'तक्रार ट्रॅक करा' },
  };
  const t = LANG_LABELS[activeLang] || LANG_LABELS.EN;

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <header style={{
      background: '#0A1628', height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: -0.5 }}>
          Complaint<span style={{ color: '#00B4A6' }}>IQ</span>
        </span>
        <nav style={{ display: 'flex', gap: 4 }}>
          {[
            { path: '/customer/new',   label: t.file },
            { path: '/customer/track', label: t.track },
          ].map(n => (
            <button key={n.path} onClick={() => navigate(n.path)} style={{
              background: location.pathname === n.path ? '#00B4A6' : 'transparent',
              color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>{n.label}</button>
          ))}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Language switcher */}
        {/* TODO: i18n — Language switcher */}
        <div style={{ display: 'flex', gap: 2, background: '#1E293B', borderRadius: 8, padding: 2 }}>
          {['EN', 'हिं', 'தமி', 'मराठी'].map(l => (
            <button key={l} onClick={() => setActiveLang(l)} style={{
              background: activeLang === l ? '#00B4A6' : 'transparent',
              color: '#fff', border: 'none', borderRadius: 6,
              padding: '4px 7px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
            }}>🇮🇳 {l}</button>
          ))}
        </div>
        {user && <span style={{ fontSize: 12, color: '#94A3B8' }}>👤 {user.name}</span>}
        <button onClick={handleLogout} style={{
          background: '#1E293B', color: '#94A3B8', border: 'none',
          borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12,
        }}>Logout</button>
      </div>
    </header>
  );
}
