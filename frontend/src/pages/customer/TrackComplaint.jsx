// frontend/src/pages/customer/TrackComplaint.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatusStepper from '../../components/customer/StatusStepper';
import SLACountdown from '../../components/customer/SLACountdown';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { SLA_TIERS, STATUS_LABELS } from '../../constants';
import { fmtDate, breachRiskLabel } from '../../utils';
import api from '../../services/api';

export default function TrackComplaint() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.complaints.list();
        setComplaints(data);
      } catch (err) {
        setError(err.message || 'Failed to load complaints.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [token]);

  const shown = search
    ? complaints.filter(c =>
        (c.reference_number || '').toLowerCase().includes(search.toLowerCase())
      )
    : complaints;

  if (loading) return <LoadingSpinner label="Loading your complaints…" />;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0A1628', marginBottom: 4 }}>
          Track My Complaints
        </h2>
        <p style={{ fontSize: 13, color: '#6B7280' }}>
          Complaints filed under your account · {complaints.length} total
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', color: '#991B1B', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Filter by reference number (e.g. CIQ-2026-000001)"
          style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1.5px solid #D1D5DB', fontSize: 14, outline: 'none' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', fontWeight: 700 }}>
            Clear
          </button>
        )}
      </div>

      {/* Empty state */}
      {shown.length === 0 && !search && !error && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No complaints filed yet</p>
          <p style={{ fontSize: 13, marginBottom: 20 }}>Use the button below to file your first complaint.</p>
          <button onClick={() => navigate('/customer/new')} style={{ background: '#00B4A6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 700 }}>
            File a Complaint
          </button>
        </div>
      )}

      {search && shown.length === 0 && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', color: '#991B1B', fontSize: 13 }}>
          No complaint matching <strong>{search}</strong> found in your account.
        </div>
      )}

      {/* Complaint cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {shown.map(c => {
          const tier = SLA_TIERS[c.sla_tier] || SLA_TIERS.P3;
          const risk = breachRiskLabel(c.sla_breach_probability || 0);
          return (
            <div key={c.id} style={{
              background: '#fff', borderRadius: 16, padding: 20,
              boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${tier.color}`,
            }}>
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: '#0A1628', fontSize: 15 }}>{c.reference_number}</span>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: '#00B4A6', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{c.product_category}</span>
                    <span title="P1=24hr · P2=48hr · P3=5 business days · P4=10 business days (RBI IOS)" style={{ background: tier.bg, color: tier.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, cursor: 'help' }}>{c.sla_tier}</span>
                    <span style={{ background: '#F3F4F6', color: '#374151', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{STATUS_LABELS[c.status]}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>Filed {fmtDate(c.filed_at)}</div>
                  <SLACountdown deadline={c.sla_deadline} />
                  {(c.sla_tier === 'P1' || c.sla_tier === 'P2') && (
                    <div style={{ marginTop: 4 }}>
                      <span style={{ background: risk.bg, color: risk.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                        Risk: {risk.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status stepper */}
              <StatusStepper status={c.status} />

              {/* Snippet + button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 12 }}>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, flex: 1 }}>
                  {c.complaint_text?.slice(0, 100)}…
                </p>
                <button
                  onClick={() => navigate(`/customer/complaint/${c.id}`)}
                  style={{ background: '#0A1628', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  View Details →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
