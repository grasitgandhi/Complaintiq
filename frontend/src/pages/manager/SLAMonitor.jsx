// frontend/src/pages/manager/SLAMonitor.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import SidebarNav from '../../components/agent/SidebarNav';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { slaCountdown, breachRiskLabel } from '../../utils';
import { SLA_TIERS, STATUS_LABELS } from '../../constants';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MANAGER_NAV = [
  { path: '/manager/overview', icon: '📊', label: 'Overview' },
  { path: '/manager/sla', icon: '⏱', label: 'SLA Monitor' },
  { path: '/manager/reports', icon: '📄', label: 'RBI Reports' },
  { path: '/manager/agents', icon: '👥', label: 'Agent Performance' },
];

function prettyProduct(product) {
  if (!product) return 'OTHER';
  const raw = String(product).replace(/^.*\./, '');
  return raw
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function customerLabel(c) {
  if (c.customer_name && String(c.customer_name).trim()) return c.customer_name;
  if (c.customer_account && String(c.customer_account).trim()) return c.customer_account;
  if (c.customer_mobile && String(c.customer_mobile).trim()) return c.customer_mobile;
  return 'Unknown Customer';
}

export default function SLAMonitor() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reassigningId, setReassigningId] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [all, agentRows] = await Promise.all([
          api.complaints.list(),
          api.auth.listAgents(),
        ]);
        // Filter client-side: only open/in-progress complaints
        const openComplaints = all.filter(c => c.status !== 'Resolved' && c.status !== 'Closed');
        setOpen(openComplaints);
        setAgents(Array.isArray(agentRows) ? agentRows : []);
      } catch (err) {
        setError(err.message || t('Failed to load complaints.'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const agentById = new Map((agents || []).map(a => [Number(a.id), a]));

  async function handleReassign(complaint) {
    if (!agents.length) {
      toast.error(t('No active agents found. Create at least one agent account in Auth/Register.'));
      return;
    }

    const optionsText = agents
      .map(a => `${a.id}: ${a.name}${a.team ? ` (${a.team})` : ''}`)
      .join('\n');

    const input = window.prompt(
      `${t('Reassign')} ${complaint.reference_number} ${t('to agent id:')}\n\n${optionsText}`,
      complaint.assigned_agent_id ? String(complaint.assigned_agent_id) : ''
    );

    if (input === null) return;
    const nextAgentId = Number(String(input).trim());
    if (!Number.isInteger(nextAgentId) || !agentById.has(nextAgentId)) {
      toast.error(t('Please enter a valid agent id from the list.'));
      return;
    }

    setReassigningId(complaint.id);
    try {
      await api.complaints.updateStatus(complaint.id, complaint.status, {
        agent_id: nextAgentId,
        note: 'Reassigned by manager from SLA Monitor',
      });

      const assignee = agentById.get(nextAgentId);
      setOpen(prev => prev.map(c =>
        c.id === complaint.id
          ? {
            ...c,
            assigned_agent_id: nextAgentId,
            assigned_agent: assignee?.name || c.assigned_agent,
          }
          : c
      ));

      toast.success(`${t('Reassigned to')} ${assignee?.name || `${t('Agent')} ${nextAgentId}`}`);
    } catch (err) {
      toast.error(err.message || t('Failed to reassign complaint.'));
    } finally {
      setReassigningId(null);
    }
  }

  const highRisk = open.filter(c => (c.sla_breach_probability || 0) > 0.6);

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
      <SidebarNav items={MANAGER_NAV} />
      <div className="ml-[220px] flex-1 flex items-center justify-center">
        <LoadingSpinner label={t('Loading SLA data…')} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
      <SidebarNav items={MANAGER_NAV} />

      <div className="ml-[220px] flex-1 p-6 sm:p-7 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">{t('SLA Monitor')}</h2>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-5 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Alert banner */}
        {highRisk.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-5 flex items-center gap-3 flex-wrap">
            <span className="text-lg">⚠</span>
            <span className="text-red-700 dark:text-red-300 text-sm font-semibold flex-1">
              {t('{count} complaint{plural} at high breach risk — regulatory escalation imminent:')
                .replace('{count}', highRisk.length)
                .replace('{plural}', highRisk.length > 1 ? 's' : '')}&nbsp;
              {highRisk.map(c => {
                const countdown = slaCountdown(c.sla_deadline);
                return <strong key={c.id} style={{ marginRight: 8 }}>{c.reference_number} ({countdown.label})</strong>;
              })}
            </span>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">{t('Open Complaints — Sorted by SLA Deadline')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('AI Breach Probability by XGBoost (Layer 4) — target: breach rate below 3%')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  {['Reference', 'Customer', 'Product', 'Tier', 'Status', 'Time Remaining', 'Assigned Agent', 'AI Breach Risk', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {t(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {open.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                      {t('No open complaints found.')}
                    </td>
                  </tr>
                ) : open.map(c => {
                  const tier = SLA_TIERS[c.sla_tier] || {};
                  const countdown = slaCountdown(c.sla_deadline);
                  const risk = breachRiskLabel(c.sla_breach_probability || 0);
                  return (
                    <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{c.reference_number}</td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{t(customerLabel(c))}</td>
                      <td className="px-4 py-2.5">
                        <span
                          style={{
                            background: '#00B4A6',
                            color: '#fff',
                            borderRadius: 9999,
                            padding: '2px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {prettyProduct(c.product_category)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span style={{ background: tier.bg, color: tier.color, borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{c.sla_tier}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full px-2.5 py-0.5 text-xs font-bold">{STATUS_LABELS[c.status]}</span>
                      </td>
                      <td className="px-4 py-2.5 font-bold whitespace-nowrap" style={{ color: countdown.color }}>{countdown.label}</td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                        {c.assigned_agent || (c.assigned_agent_id ? agentById.get(Number(c.assigned_agent_id))?.name : null) || t('Unassigned')}
                      </td>
                      <td className="px-4 py-2.5">
                        <div
                          title={t('XGBoost prediction (Layer 4) — based on time remaining, complaint status, and agent queue depth. Target: reduce breach rate below 3%.')}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'help' }}
                        >
                          <div style={{ width: 64, height: 6, borderRadius: 3, background: '#E5E7EB', overflow: 'hidden' }}>
                            <div style={{ width: `${(c.sla_breach_probability || 0) * 100}%`, height: '100%', background: risk.color, borderRadius: 3 }} />
                          </div>
                          <span style={{ color: risk.color, fontWeight: 700, fontSize: 12 }}>{Math.round((c.sla_breach_probability || 0) * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleReassign(c)}
                          disabled={reassigningId === c.id}
                          className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 disabled:opacity-60"
                        >
                          {reassigningId === c.id ? t('Reassigning…') : t('Reassign')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
