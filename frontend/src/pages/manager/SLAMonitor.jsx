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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarNav items={MANAGER_NAV} />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner label="Loading SLA data…" />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif" }}>
      <SidebarNav items={MANAGER_NAV} />

      <div style={{ marginLeft: 220, flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0A1628', marginBottom: 20 }}>SLA Monitor</h2>

        {/* Error state */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 18px', marginBottom: 20, color: '#991B1B', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Alert banner */}
        {highRisk.length > 0 && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18 }}>⚠</span>
            <span style={{ color: '#991B1B', fontSize: 13, fontWeight: 600, flex: 1 }}>
              {highRisk.length} complaint{highRisk.length > 1 ? 's' : ''} at high breach risk — regulatory escalation imminent:&nbsp;
              {highRisk.map(c => {
                const t = slaCountdown(c.sla_deadline);
                return <strong key={c.id} style={{ marginRight: 8 }}>{c.reference_number} ({t.label})</strong>;
              })}
            </span>
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0A1628', margin: 0 }}>Open Complaints — Sorted by SLA Deadline</h3>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>
              AI Breach Probability by XGBoost (Layer 4) — target: breach rate below 3%
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8F9FA' }}>
                  {['Reference', 'Customer', 'Product', 'Tier', 'Status', 'Time Remaining', 'Assigned Agent', 'AI Breach Risk', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {open.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                      No open complaints found.
                    </td>
                  </tr>
                ) : open.map(c => {
                  const tier = SLA_TIERS[c.sla_tier] || {};
                  const t    = slaCountdown(c.sla_deadline);
                  const risk = breachRiskLabel(c.sla_breach_probability || 0);
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'DM Mono, monospace', fontWeight: 700, color: '#0A1628', whiteSpace: 'nowrap' }}>{c.reference_number}</td>
                      <td style={{ padding: '10px 14px' }}>{c.customer_name}</td>
                      <td style={{ padding: '10px 14px' }}><span style={{ background: '#00B4A6', color: '#fff', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{c.product_category}</span></td>
                      <td style={{ padding: '10px 14px' }}><span style={{ background: tier.bg, color: tier.color, borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{c.sla_tier}</span></td>
                      <td style={{ padding: '10px 14px' }}><span style={{ background: '#F3F4F6', color: '#374151', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{STATUS_LABELS[c.status]}</span></td>
                      <td style={{ padding: '10px 14px', color: t.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{t.label}</td>
                      <td style={{ padding: '10px 14px' }}>{c.assigned_agent || 'Unassigned'}</td>
                      <td style={{ padding: '10px 14px' }}>
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
                      <td style={{ padding: '10px 14px' }}>
                        <button style={{ fontSize: 11, background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', color: '#374151', fontWeight: 600 }}>Reassign</button>
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
