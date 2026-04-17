// frontend/src/pages/agent/AgentQueue.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import SidebarNav from '../../components/agent/SidebarNav';
import ComplaintQueue from '../../components/agent/ComplaintQueue';
import api from '../../services/api';

const AGENT_NAV_BASE = [
  { path: '/agent/queue', icon: '📋', label: 'My Queue' },
  { path: '/agent/all', icon: '📂', label: 'All Complaints' },
  { path: '/agent/escalations', icon: '🚨', label: 'Escalations' },
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
    { label: 'My Open', value: myOpen, color: '#00B4A6' },
    { label: 'Due Today', value: dueToday, color: '#D97706' },
    { label: 'Overdue', value: overdue, color: '#DC2626' },
    { label: 'Resolved This Week', value: resolvedThisWeek, color: '#16A34A' },
  ];
}

export default function AgentQueue() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [escalationCount, setEscalationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const agentNavItems = AGENT_NAV_BASE.map((item) => {
    if (item.path !== '/agent/escalations') return item;
    return escalationCount > 0 ? { ...item, badge: escalationCount } : item;
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.complaints.list({ agent_id: 'me' });
        setComplaints(data);

        const openEscalations = (Array.isArray(data) ? data : []).filter((c) =>
          c.escalation_threat_detected && c.status !== 'Resolved' && c.status !== 'Closed'
        );
        setEscalationCount(openEscalations.length);

        const escalation = (data || []).find(c =>
          c.escalation_threat_detected && c.status !== 'Resolved' && c.status !== 'Closed'
        );

        if (escalation) {
          toast(
            <span>
              {t('Priority alert:')} <strong>{escalation.reference_number}</strong> {t('has regulatory escalation keywords.')}
              <button
                onClick={() => navigate(`/agent/complaint/${escalation.id || escalation.reference_number}`)}
                style={{
                  marginLeft: 8,
                  background: 'none',
                  border: 'none',
                  color: '#0F766E',
                  cursor: 'pointer',
                  fontWeight: 700,
                  textDecoration: 'underline',
                }}
              >
                {t('Open →')}
              </button>
            </span>,
            {
              duration: 7000,
              style: {
                background: '#FFF7ED',
                color: '#7C2D12',
                border: '1px solid #FDBA74',
                maxWidth: 560,
              },
              icon: '⚠️',
            }
          );
        }
      } catch (err) {
        setEscalationCount(0);
        toast.error(err.message || t('Failed to load queue.'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <SidebarNav items={agentNavItems} />

      <div className="ml-[220px] flex-1 p-6 sm:p-7 overflow-y-auto">
        {/* Use new ComplaintQueue Table Component */}
        <ComplaintQueue
          complaints={complaints}
          loading={loading}
          onOpenComplaint={(complaintKey) => navigate(`/agent/complaint/${complaintKey}`)}
        />
      </div>
    </div>
  );
}
