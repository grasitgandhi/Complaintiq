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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif" }}>
      <SidebarNav items={MANAGER_NAV} />

      <div style={{ marginLeft: 220, flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0A1628', marginBottom: 20 }}>Agent Performance — March 2026</h2>

        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                {[
                  'Agent', 'Assigned', 'Resolved', 'Avg Handle Time',
                  'CSAT', 'SLA Compliance', 'AI Draft Usage',
                ].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#6B7280', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENTS.map(a => (
                <>
                  <tr
                    key={a.id}
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                    style={{ borderBottom: '1px solid #F9FAFB', cursor: 'pointer', background: expanded === a.id ? '#F0FDFC' : '#fff' }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0A1628' }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{a.team}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{a.assigned}</td>
                    <td style={{ padding: '14px 16px', color: '#16A34A', fontWeight: 700 }}>{a.resolved}</td>
                    <td style={{ padding: '14px 16px' }}>{a.avg_handle}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 700 }}>{a.csat}</span>
                      <span style={{ color: '#F59E0B', marginLeft: 4 }}>★</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: a.sla_pct >= 95 ? '#16A34A' : '#D97706', fontWeight: 700 }}>
                        {a.sla_pct}%
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
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
                      <td colSpan={7} style={{ background: '#F8FFFE', padding: '20px 24px', borderBottom: '2px solid #00B4A6' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                          <div>
                            <h5 style={{ fontSize: 12, color: '#6B7280', fontWeight: 700, marginBottom: 12 }}>
                              Complaints by Product
                            </h5>
                            {a.by_product.map(p => (
                              <div key={p.product} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: '#374151', width: 130, flexShrink: 0 }}>{p.product}</span>
                                <MiniBar value={p.count} max={20} color="#00B4A6" />
                              </div>
                            ))}
                          </div>

                          <div>
                            <h5 style={{ fontSize: 12, color: '#6B7280', fontWeight: 700, marginBottom: 12 }}>
                              Customer Sentiment Breakdown
                            </h5>
                            {[
                              { label: 'Frustrated', value: a.sentiment.frustrated, color: '#DC2626' },
                              { label: 'Neutral',    value: a.sentiment.neutral,    color: '#9CA3AF' },
                              { label: 'Satisfied',  value: a.sentiment.satisfied,  color: '#16A34A' },
                            ].map(s => (
                              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: '#374151', width: 80, flexShrink: 0 }}>{s.label}</span>
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
