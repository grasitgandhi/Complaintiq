// frontend/src/pages/agent/AgentQueue.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import SidebarNav from '../../components/agent/SidebarNav';
import ComplaintCard from '../../components/agent/ComplaintCard';
import LoadingSkeleton from '../../components/agent/LoadingSkeleton';
import api from '../../services/api';

const AGENT_NAV = [
  { path: '/agent/queue',       label: 'My Queue' },
  { path: '/agent/all',         label: 'All Complaints' },
  { path: '/agent/escalations', label: 'Escalations', badge: 2 },
  { path: '/agent/performance', label: 'My Performance' },
];

function computeStats(complaints) {
  const now = Date.now();
  const dayMs = 86400000;

  const myOpen = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;

  const dueToday = complaints.filter(c => {
    if (c.status === 'Resolved' || c.status === 'Closed') return false;
    const deadline = new Date(c.sla_deadline).getTime();
    return deadline > now && deadline <= now + dayMs;
  }).length;

  const overdue = complaints.filter(c => {
    if (c.status === 'Resolved' || c.status === 'Closed') return false;
    return new Date(c.sla_deadline).getTime() < now;
  }).length;

  const weekAgo = now - 7 * dayMs;
  const resolvedThisWeek = complaints.filter(c =>
    c.status === 'Resolved' && new Date(c.filed_at).getTime() >= weekAgo
  ).length;

  return [
    { 
      label: 'My Open', 
      value: myOpen, 
      color: '#00C6B5',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    },
    { 
      label: 'Due Today', 
      value: dueToday, 
      color: '#F59E0B',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    },
    { 
      label: 'Overdue', 
      value: overdue, 
      color: '#EF4444',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    },
    { 
      label: 'Resolved This Week', 
      value: resolvedThisWeek, 
      color: '#10B981',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    },
  ];
}

export default function AgentQueue() {
  const { token, user }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Open');
  const [search, setSearch]         = useState('');

  // Determine page title based on current route
  const pageTitle = location.pathname.includes('escalations') 
    ? 'Escalations' 
    : location.pathname.includes('all') 
      ? 'All Complaints'
      : location.pathname.includes('performance')
        ? 'My Performance'
        : 'My Queue';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.complaints.list({ agent_id: 'me' });
        setComplaints(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load queue.');
      } finally {
        setLoading(false);
      }
    }
    load();

    // Escalation alert on first load
    const timer = setTimeout(() => {
      toast.error(
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Escalation risk: <strong>CIQ-2026-000002</strong> - Banking Ombudsman mentioned</span>
          <button 
            onClick={() => navigate('/agent/complaint/2')} 
            style={{ 
              marginLeft: 4, 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              color: '#fff', 
              cursor: 'pointer', 
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            Open
          </button>
        </span>,
        { duration: 8000, style: { background: '#991B1B', color: '#fff', maxWidth: 450 } }
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, [token]);

  const stats = computeStats(complaints);

  const filtered = complaints.filter(c => {
    const matchesTier = tierFilter === 'All' || c.sla_tier === tierFilter;
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Open' && c.status !== 'Resolved' && c.status !== 'Closed') ||
      (statusFilter === 'Resolved' && (c.status === 'Resolved' || c.status === 'Closed'));
    const matchesSearch = !search || 
      c.reference_number?.toLowerCase().includes(search.toLowerCase()) || 
      c.customer_name?.toLowerCase().includes(search.toLowerCase());
    return matchesTier && matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      <SidebarNav items={AGENT_NAV} />

      <div style={{ marginLeft: 240, flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0B1629', margin: 0 }}>{pageTitle}</h1>
              <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
                {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Manage your assigned complaints'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => toast.success('Queue refreshed')}
                style={{
                  background: '#fff',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                  <path d="M21 21v-5h-5"/>
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
          {stats.map(s => (
            <div
              key={s.label}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '22px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                border: '1px solid #E2E8F0',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ color: s.color }}>{s.icon}</div>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0',
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search reference, customer name..."
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  borderRadius: 10,
                  border: '2px solid #E2E8F0',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Priority filter */}
            <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 10, padding: 4 }}>
              {['All', 'P1', 'P2', 'P3', 'P4'].map(t => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: tierFilter === t ? '#0B1629' : 'transparent',
                    color: tierFilter === t ? '#fff' : '#64748B',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 10, padding: 4 }}>
              {['All', 'Open', 'Resolved'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: statusFilter === s ? '#0B1629' : 'transparent',
                    color: statusFilter === s ? '#fff' : '#64748B',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
            Showing <strong style={{ color: '#0B1629' }}>{filtered.length}</strong> of {complaints.length} complaints
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#00C6B5',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear search
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', margin: 0 }}>No complaints found</p>
                <p style={{ fontSize: 14, color: '#94A3B8', margin: '8px 0 0' }}>
                  {search ? 'Try adjusting your search or filters' : 'Your queue is empty'}
                </p>
              </div>
            ) : (
              filtered.map(c => <ComplaintCard key={c.id} c={c} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
