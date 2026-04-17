// frontend/src/pages/manager/AgentPerformance.jsx
// TODO: Replace AGENTS with api.analytics.agentPerformance() when endpoint is available
import { useState } from 'react';
import SidebarNav from '../../components/agent/SidebarNav';

const MANAGER_NAV = [
  { path: '/manager/overview', icon: '📊', label: 'Overview' },
  { path: '/manager/sla',      icon: '⏱',  label: 'SLA Monitor' },
  { path: '/manager/reports',  icon: '📄',  label: 'RBI Reports' },
  { path: '/manager/agents',   icon: '👥',  label: 'Agent Performance' },
];

const AGENTS = [
  {
    id: 1, name: 'Priya Mehta',   team: 'Email Team',
    assigned: 18, resolved: 41, avg_handle: '2.1 days', csat: 4.4, sla_pct: 97, ai_usage: 64,
    by_product: [
      { product: 'UPI Payment',     count: 14 },
      { product: 'NACH Mandate',    count: 12 },
      { product: 'Savings Account', count:  9 },
      { product: 'Other',           count:  6 },
    ],
    sentiment: { frustrated: 12, neutral: 18, satisfied: 11 },
  },
  {
    id: 2, name: 'Arjun Nair',    team: 'Phone Team',
    assigned: 22, resolved: 38, avg_handle: '2.4 days', csat: 4.1, sla_pct: 94, ai_usage: 58,
    by_product: [
      { product: 'Credit Card', count: 14 },
      { product: 'NRE Account', count: 10 },
      { product: 'Home Loan',   count:  8 },
      { product: 'Other',       count:  6 },
    ],
    sentiment: { frustrated: 15, neutral: 14, satisfied: 9 },
  },
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
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
      <SidebarNav items={MANAGER_NAV} />

      <div className="ml-[220px] flex-1 p-6 sm:p-7 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Agent Performance — March 2026</h2>

        <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-md overflow-hidden">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                {[
                  'Agent', 'Assigned', 'Resolved', 'Avg Handle Time',
                  'CSAT', 'SLA Compliance', 'AI Draft Usage',
                ].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENTS.map(a => (
                <>
                  <tr
                    key={a.id}
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                    className={`border-b border-slate-100 dark:border-slate-800 cursor-pointer ${
                      expanded === a.id ? 'bg-teal-50 dark:bg-teal-900/10' : 'bg-white dark:bg-transparent'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{a.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{a.team}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{a.assigned}</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">{a.resolved}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{a.avg_handle}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{a.csat}</span>
                      <span className="text-amber-500 ml-1">★</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${a.sla_pct >= 95 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {a.sla_pct}%
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
                        <span style={{ fontWeight: 700, color: '#7C3AED' }}>{a.ai_usage}%</span>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {expanded === a.id && (
                    <tr key={`exp-${a.id}`}>
                      <td colSpan={7} className="bg-teal-50 dark:bg-teal-900/10 px-6 py-5 border-b-2 border-teal-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div>
                            <h5 className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-3">
                              Complaints by Product
                            </h5>
                            {a.by_product.map(p => (
                              <div key={p.product} className="flex items-center gap-2.5 mb-2">
                                <span className="text-xs text-slate-700 dark:text-slate-300 w-[130px] flex-shrink-0">{p.product}</span>
                                <MiniBar value={p.count} max={20} color="#00B4A6" />
                              </div>
                            ))}
                          </div>

                          <div>
                            <h5 className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-3">
                              Customer Sentiment Breakdown
                            </h5>
                            {[
                              { label: 'Frustrated', value: a.sentiment.frustrated, color: '#DC2626' },
                              { label: 'Neutral',    value: a.sentiment.neutral,    color: '#9CA3AF' },
                              { label: 'Satisfied',  value: a.sentiment.satisfied,  color: '#16A34A' },
                            ].map(s => (
                              <div key={s.label} className="flex items-center gap-2.5 mb-2">
                                <span className="text-xs text-slate-700 dark:text-slate-300 w-20 flex-shrink-0">{s.label}</span>
                                <MiniBar value={s.value} max={20} color={s.color} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
