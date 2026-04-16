// frontend/src/pages/agent/AgentQueue.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import SidebarNav from '../../components/agent/SidebarNav';
import ComplaintCard from '../../components/agent/ComplaintCard';
import LoadingSkeleton from '../../components/agent/LoadingSkeleton';
import api from '../../services/api';

const AGENT_NAV = [
  { path: '/agent/queue',       icon: '📋', label: 'My Queue' },
  { path: '/agent/all',         icon: '📂', label: 'All Complaints' },
  { path: '/agent/escalations', icon: '🚨', label: 'Escalations', badge: 2 },
  { path: '/agent/performance', icon: '📈', label: 'My Performance' },
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
    { label: 'My Open',            value: myOpen,           color: '#00B4A6' },
    { label: 'Due Today',          value: dueToday,         color: '#D97706' },
    { label: 'Overdue',            value: overdue,          color: '#DC2626' },
    { label: 'Resolved This Week', value: resolvedThisWeek, color: '#16A34A' },
  ];
}

export default function AgentQueue() {
  const { token }  = useAuth();
  const navigate   = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tierFilter, setTierFilter] = useState('All');
  const [search, setSearch]         = useState('');

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

    // Escalation alert on first load (refinement: polling every 30s)
    const timer = setTimeout(() => {
      toast.error(
        <span>
          ⚠ Escalation risk: <strong>CIQ-2026-000002</strong> — Banking Ombudsman mentioned
          <button onClick={() => navigate('/agent/complaint/2')} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}>
            Open →
          </button>
        </span>,
        { duration: 8000, style: { background: '#991B1B', color: '#fff', maxWidth: 400 } }
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, [token]);

  const stats = computeStats(complaints);

  const filtered = complaints.filter(c =>
    (tierFilter === 'All' || c.sla_tier === tierFilter) &&
    (!search || c.reference_number?.toLowerCase().includes(search.toLowerCase()) || c.customer_name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif" }}>
      <SidebarNav items={AGENT_NAV} />

      <div style={{ marginLeft: 220, flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search reference, customer name…"
            style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 10, border: '1.5px solid #D1D5DB', fontSize: 13, outline: 'none' }} />
          <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #E5E7EB' }}>
            {['All', 'P1', 'P2', 'P3', 'P4'].map(t => (
              <button key={t} onClick={() => setTierFilter(t)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tierFilter === t ? '#0A1628' : 'transparent',
                color:      tierFilter === t ? '#fff'    : '#374151',
                fontSize: 13, fontWeight: 700,
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading
          ? <LoadingSkeleton count={4} />
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.length === 0
                ? <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>No complaints match your filter.</div>
                : filtered.map(c => <ComplaintCard key={c.id} c={c} />)
              }
            </div>
        }
      </div>
    </div>
  );
}
