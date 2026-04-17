// frontend/src/pages/manager/AgentPerformance.jsx
import { Fragment, useState, useEffect } from 'react';
import SidebarNav from '../../components/agent/SidebarNav';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const MANAGER_NAV = [
  { path: '/manager/overview', icon: '📊', label: 'Overview' },
  { path: '/manager/sla', icon: '⏱', label: 'SLA Monitor' },
  { path: '/manager/reports', icon: '📄', label: 'RBI Reports' },
  { path: '/manager/agents', icon: '👥', label: 'Agent Performance' },
];

function MiniBar({ value, max, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 80, height: 8, borderRadius: 4, background: '#E5E7EB', overflow: 'hidden' }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 12, color: '#374151' }}>{value}</span>
    </div>
  );
}

export default function AgentPerformance() {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const rows = await api.analytics.agentPerformance();
        setAgents(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setError(err.message || t('Failed to load agent performance.'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
        <SidebarNav items={MANAGER_NAV} />
        <div className="ml-[220px] flex-1 flex items-center justify-center">
          <LoadingSpinner label={t('Loading agent performance...')} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
        <SidebarNav items={MANAGER_NAV} />
        <div className="ml-[220px] flex-1 flex items-center justify-center">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
      <SidebarNav items={MANAGER_NAV} />

      <div className="ml-[220px] flex-1 p-6 sm:p-7 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">{t('Agent Performance — March 2026')}</h2>

        <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-md overflow-hidden">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                {[
                  'Agent', 'Assigned', 'Resolved', 'Avg Handle Time',
                  'CSAT', 'SLA Compliance', 'AI Draft Usage',
                ].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{t(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <Fragment key={a.id}>
                  <tr
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                    className={`border-b border-slate-100 dark:border-slate-800 cursor-pointer ${expanded === a.id ? 'bg-teal-50 dark:bg-teal-900/10' : 'bg-white dark:bg-transparent'
                      }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{a.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{a.team}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{a.assigned}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">{a.resolved}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{a.avg_handle_days} {t('days')}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{a.csat.toFixed(1)}</span>
                      <span className="text-amber-500 ml-1">★</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${a.sla_pct >= 95 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {a.sla_pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        title="% of resolved complaints where agent approved AI draft without manual edits. NatWest Cora+ benchmark: 49% no-edit rate across 11.2M conversations (NatWest H1 2025)."
                        style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'help' }}
                      >
                        <div style={{ width: 64, height: 6, borderRadius: 3, background: '#E5E7EB', overflow: 'hidden' }}>
                          <div style={{ width: `${a.ai_usage}%`, height: '100%', background: '#7C3AED', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontWeight: 700, color: '#7C3AED' }}>{a.ai_usage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {expanded === a.id && (
                    <tr>
                      <td colSpan={7} className="bg-teal-50 dark:bg-teal-900/10 px-6 py-5 border-b-2 border-teal-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div>
                            <h5 className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-3">
                              {t('Complaints by Product')}
                            </h5>
                            {a.by_product.map(p => (
                              <div key={p.product} className="flex items-center gap-2.5 mb-2">
                                <span className="text-xs text-slate-700 dark:text-slate-300 w-[130px] flex-shrink-0">{p.product}</span>
                                <MiniBar value={p.count} max={Math.max(1, ...a.by_product.map(x => x.count))} color="#00B4A6" />
                              </div>
                            ))}
                          </div>

                          <div>
                            <h5 className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-3">
                              {t('Customer Sentiment Breakdown')}
                            </h5>
                            {[
                              { label: t('Frustrated'), value: a.sentiment.frustrated, color: '#DC2626' },
                              { label: t('Neutral'), value: a.sentiment.neutral, color: '#9CA3AF' },
                              { label: t('Satisfied'), value: a.sentiment.satisfied, color: '#16A34A' },
                            ].map(s => (
                              <div key={s.label} className="flex items-center gap-2.5 mb-2">
                                <span className="text-xs text-slate-700 dark:text-slate-300 w-20 flex-shrink-0">{s.label}</span>
                                <MiniBar
                                  value={s.value}
                                  max={Math.max(1, a.sentiment.frustrated, a.sentiment.neutral, a.sentiment.satisfied)}
                                  color={s.color}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    {t('No agent performance data available.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
