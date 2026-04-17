// frontend/src/pages/agent/AgentQueue.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SidebarNav from '../../components/agent/SidebarNav';
import ComplaintCard from '../../components/agent/ComplaintCard';
import ComplaintQueue from '../../components/agent/ComplaintQueue';
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
  const { isDark } = useTheme();
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
    <div className="flex min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <SidebarNav items={AGENT_NAV} />

      <div className="ml-[220px] flex-1 p-6 sm:p-7 overflow-y-auto">
        {/* Use new ComplaintQueue Table Component */}
        <ComplaintQueue complaints={complaints} loading={loading} />
      </div>
    </div>
  );
}
