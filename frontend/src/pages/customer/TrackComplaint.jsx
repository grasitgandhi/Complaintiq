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
  const [statusFilter, setStatusFilter] = useState('All');

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

  const shown = complaints.filter(c => {
    const matchesSearch = !search || (c.reference_number || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner label="Loading your complaints..." />;

  // Calculate stats
  const openCount = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const urgentCount = complaints.filter(c => c.sla_tier === 'P1' || c.sla_tier === 'P2').length;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0B1629', marginBottom: 8 }}>
          Track My Complaints
        </h2>
        <p style={{ fontSize: 15, color: '#64748B' }}>
          Monitor and manage all your filed complaints
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total', value: complaints.length, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, color: '#0B1629' },
          { label: 'Open', value: openCount, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, color: '#00C6B5' },
          { label: 'Resolved', value: resolvedCount, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, color: '#10B981' },
          { label: 'Urgent', value: urgentCount, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, color: '#F59E0B' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff',
            borderRadius: 16,
            padding: '20px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ color: stat.color }}>{stat.icon}</div>
              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 16,
          padding: '16px 20px',
          color: '#991B1B',
          fontSize: 14,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by reference number..."
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                borderRadius: 12,
                border: '2px solid #E2E8F0',
                fontSize: 15,
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: 6, background: '#F1F5F9', borderRadius: 12, padding: 4 }}>
            {['All', 'Pending', 'In_Review', 'Resolved'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: statusFilter === status ? '#0B1629' : 'transparent',
                  color: statusFilter === status ? '#fff' : '#64748B',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                {status === 'In_Review' ? 'In Review' : status}
              </button>
            ))}
          </div>

          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: '#F1F5F9',
                color: '#64748B',
                border: 'none',
                borderRadius: 10,
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {shown.length === 0 && !search && !error && statusFilter === 'All' && (
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '80px 40px',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#F0FDFA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00C6B5" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0B1629', marginBottom: 8 }}>No complaints filed yet</h3>
          <p style={{ fontSize: 15, color: '#64748B', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
            When you file a complaint, it will appear here so you can track its progress.
          </p>
          <button
            onClick={() => navigate('/customer/new')}
            style={{
              background: '#00C6B5',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            File Your First Complaint
          </button>
        </div>
      )}

      {(search || statusFilter !== 'All') && shown.length === 0 && (
        <div style={{
          background: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <div>
            <p style={{ fontSize: 15, color: '#92400E', fontWeight: 600, margin: 0 }}>No results found</p>
            <p style={{ fontSize: 14, color: '#B45309', margin: '4px 0 0' }}>
              {search ? `No complaint matching "${search}"` : 'No complaints match the selected filter'}
            </p>
          </div>
        </div>
      )}

      {/* Complaint cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {shown.map(c => {
          const tier = SLA_TIERS[c.sla_tier] || SLA_TIERS.P3;
          const risk = breachRiskLabel(c.sla_breach_probability || 0);
          const isUrgent = c.sla_tier === 'P1' || c.sla_tier === 'P2';
          
          return (
            <div
              key={c.id}
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                border: '1px solid #E2E8F0',
                borderLeft: `4px solid ${tier.color}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/customer/complaint/${c.id}`)}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: 700,
                      color: '#0B1629',
                      fontSize: 17,
                    }}>
                      {c.reference_number}
                    </span>
                    {isUrgent && (
                      <span style={{
                        background: '#FEF3C7',
                        color: '#D97706',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        </svg>
                        URGENT
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #00C6B5, #009E90)',
                      color: '#fff',
                      borderRadius: 20,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {c.product_category}
                    </span>
                    <span
                      title="P1=24hr, P2=48hr, P3=5 days, P4=10 days (RBI IOS)"
                      style={{
                        background: tier.bg,
                        color: tier.color,
                        borderRadius: 20,
                        padding: '4px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'help',
                      }}
                    >
                      {c.sla_tier}
                    </span>
                    <span style={{
                      background: '#F1F5F9',
                      color: '#475569',
                      borderRadius: 20,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>
                    Filed {fmtDate(c.filed_at)}
                  </div>
                  <SLACountdown deadline={c.sla_deadline} />
                  {isUrgent && (
                    <div style={{ marginTop: 6 }}>
                      <span style={{
                        background: risk.bg,
                        color: risk.color,
                        borderRadius: 20,
                        padding: '4px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                      }}>
                        Risk: {risk.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status stepper */}
              <StatusStepper status={c.status} />

              {/* Snippet + button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid #F1F5F9',
                gap: 16,
              }}>
                <p style={{ fontSize: 14, color: '#64748B', margin: 0, flex: 1, lineHeight: 1.5 }}>
                  {c.complaint_text?.slice(0, 120)}{c.complaint_text?.length > 120 ? '...' : ''}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/customer/complaint/${c.id}`);
                  }}
                  style={{
                    background: '#0B1629',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease',
                  }}
                >
                  View Details
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
