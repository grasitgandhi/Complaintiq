// frontend/src/pages/manager/SLAMonitor.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SidebarNav from '../../components/agent/SidebarNav';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { slaCountdown, breachRiskLabel } from '../../utils';
import { SLA_TIERS, STATUS_LABELS } from '../../constants';
import api from '../../services/api';

const MANAGER_NAV = [
  { path: '/manager/overview', icon: '📊', label: 'Overview' },
  { path: '/manager/sla',      icon: '⏱',  label: 'SLA Monitor' },
  { path: '/manager/reports',  icon: '📄',  label: 'RBI Reports' },
  { path: '/manager/agents',   icon: '👥',  label: 'Agent Performance' },
];

export default function SLAMonitor() {
  const { token }   = useAuth();
  const [open, setOpen]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const all = await api.complaints.list();
        // Filter client-side: only open/in-progress complaints
        const openComplaints = all.filter(c => c.status !== 'Resolved' && c.status !== 'Closed');
        setOpen(openComplaints);
      } catch (err) {
        setError(err.message || 'Failed to load complaints.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const highRisk = open.filter(c => (c.sla_breach_probability || 0) > 0.6);

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
      <SidebarNav items={MANAGER_NAV} />
      <div className="ml-[220px] flex-1 flex items-center justify-center">
        <LoadingSpinner label="Loading SLA data…" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
      <SidebarNav items={MANAGER_NAV} />

      <div className="ml-[220px] flex-1 p-6 sm:p-7 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">SLA Monitor</h2>

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
              {highRisk.length} complaint{highRisk.length > 1 ? 's' : ''} at high breach risk — regulatory escalation imminent:&nbsp;
              {highRisk.map(c => {
                const t = slaCountdown(c.sla_deadline);
                return <strong key={c.id} style={{ marginRight: 8 }}>{c.reference_number} ({t.label})</strong>;
              })}
            </span>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">Open Complaints — Sorted by SLA Deadline</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              AI Breach Probability by XGBoost (Layer 4) — target: breach rate below 3%
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  {['Reference', 'Customer', 'Product', 'Tier', 'Status', 'Time Remaining', 'Assigned Agent', 'AI Breach Risk', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {open.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                      No open complaints found.
                    </td>
                  </tr>
                ) : open.map(c => {
                  const tier = SLA_TIERS[c.sla_tier] || {};
                  const t    = slaCountdown(c.sla_deadline);
                  const risk = breachRiskLabel(c.sla_breach_probability || 0);
                  return (
                    <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{c.reference_number}</td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{c.customer_name}</td>
                      <td className="px-4 py-2.5">
                        <span className="bg-teal-600 text-white rounded-full px-2.5 py-0.5 text-xs font-bold">{c.product_category}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span style={{ background: tier.bg, color: tier.color, borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{c.sla_tier}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full px-2.5 py-0.5 text-xs font-bold">{STATUS_LABELS[c.status]}</span>
                      </td>
                      <td className="px-4 py-2.5 font-bold whitespace-nowrap" style={{ color: t.color }}>{t.label}</td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{c.assigned_agent || 'Unassigned'}</td>
                      <td className="px-4 py-2.5">
                        <div
                          title="XGBoost prediction (Layer 4) — based on time remaining, complaint status, and agent queue depth. Target: reduce breach rate below 3%."
                          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'help' }}
                        >
                          <div style={{ width: 64, height: 6, borderRadius: 3, background: '#E5E7EB', overflow: 'hidden' }}>
                            <div style={{ width: `${(c.sla_breach_probability || 0) * 100}%`, height: '100%', background: risk.color, borderRadius: 3 }} />
                          </div>
                          <span style={{ color: risk.color, fontWeight: 700, fontSize: 12 }}>{Math.round((c.sla_breach_probability || 0) * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <button className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200">
                          Reassign
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
