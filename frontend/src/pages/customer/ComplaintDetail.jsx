// frontend/src/pages/customer/ComplaintDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import StatusStepper from '../../components/customer/StatusStepper';
import SLACountdown from '../../components/customer/SLACountdown';
import ComplaintTimeline from '../../components/customer/ComplaintTimeline';
import StarRating from '../../components/customer/StarRating';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { SLA_TIERS, STATUS_LABELS } from '../../constants';
import { fmtDate } from '../../utils';
import api from '../../services/api';

export default function ComplaintDetail() {
  const { id }      = useParams();
  const { token }   = useAuth();
  const navigate    = useNavigate();
  const [c, setC]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [rating, setRating]       = useState(0);
  const [feedback, setFeedback]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.complaints.get(id);
        setC(data);
      } catch (err) {
        setError(err.message || 'Failed to load complaint details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token]);

  async function submitFeedback() {
    setSubmitting(true);
    try {
      await api.complaints.submitFeedback(id, { csat_rating: rating, csat_comment: feedback });
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading complaint details..." />;

  if (error) return (
    <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 48,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#FEF2F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0B1629', marginBottom: 8 }}>Unable to Load</h3>
        <p style={{ fontSize: 14, color: '#991B1B', marginBottom: 24 }}>{error}</p>
        <button
          onClick={() => navigate('/customer/track')}
          style={{
            background: '#00C6B5',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to My Complaints
        </button>
      </div>
    </div>
  );

  if (!c) return (
    <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
      <p style={{ fontSize: 16, fontWeight: 600 }}>Complaint not found.</p>
    </div>
  );

  const tier = SLA_TIERS[c.sla_tier] || SLA_TIERS.P3;
  const isUrgent = c.sla_tier === 'P1' || c.sla_tier === 'P2';
  const isResolved = c.status === 'Resolved' || c.status === 'Closed';

  // Normalize events
  const events = (c.events || []).map(ev => ({
    ...ev,
    event_type: ev.event_type || ev.type,
    description: ev.description || ev.text,
    created_at: ev.created_at || ev.at,
  }));

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/customer/track')}
        style={{
          background: 'none',
          border: 'none',
          color: '#00C6B5',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to My Complaints
      </button>

      {/* Header card */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 28,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        marginBottom: 20,
        borderLeft: `4px solid ${tier.color}`,
      }}>
        {/* Reference and badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontWeight: 700,
                fontSize: 22,
                color: '#0B1629',
              }}>
                {c.reference_number}
              </span>
              {isUrgent && (
                <span style={{
                  background: '#FEF3C7',
                  color: '#D97706',
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                padding: '5px 14px',
                fontSize: 13,
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
                  padding: '5px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'help',
                }}
              >
                {c.sla_tier}
              </span>
              <span style={{
                background: isResolved ? '#DCFCE7' : '#F1F5F9',
                color: isResolved ? '#16A34A' : '#475569',
                borderRadius: 20,
                padding: '5px 14px',
                fontSize: 13,
                fontWeight: 600,
              }}>
                {STATUS_LABELS[c.status]}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>
              Filed on {fmtDate(c.filed_at)}
            </div>
            <SLACountdown deadline={c.sla_deadline} showDue />
          </div>
        </div>

        {/* Status stepper */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: 16,
          padding: '20px 24px',
        }}>
          <StatusStepper status={c.status} />
        </div>
      </div>

      {/* Complaint description */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 28,
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        marginBottom: 20,
      }}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#0B1629',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C6B5" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Complaint Description
        </h3>
        <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, margin: 0 }}>
          {c.complaint_text}
        </p>
        {c.incident_date && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>Incident Date: </span>
            <span style={{ fontSize: 14, color: '#0B1629', fontWeight: 600 }}>{fmtDate(c.incident_date)}</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 28,
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        marginBottom: 20,
      }}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#0B1629',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C6B5" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Activity Timeline
        </h3>
        {events.length > 0 ? (
          <ComplaintTimeline events={events} />
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '32px 20px',
            background: '#F8FAFC',
            borderRadius: 12,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={{ margin: '0 auto 12px' }}>
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>No activity recorded yet</p>
          </div>
        )}
      </div>

      {/* Bank's final response */}
      {isResolved && c.final_response && (
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: 28,
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          marginBottom: 20,
          borderLeft: '4px solid #0B1629',
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0B1629',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1629" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Bank&apos;s Response
          </h3>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, margin: 0 }}>
            {c.final_response}
          </p>
        </div>
      )}

      {/* Feedback section */}
      {isResolved && !c.csat_rating && !submitted && (
        <div style={{
          background: 'linear-gradient(135deg, #F0FDFA 0%, #E6F9F7 100%)',
          borderRadius: 20,
          padding: 28,
          marginBottom: 20,
          border: '1px solid #A7F3D0',
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#0B1629',
            marginBottom: 8,
          }}>
            How was your experience?
          </h3>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>
            Your feedback helps us improve our service
          </p>
          
          <StarRating value={rating} onChange={setRating} />
          
          {rating > 0 && (
            <div style={{ marginTop: 20 }}>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Share more details about your experience (optional)"
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '2px solid #E2E8F0',
                  fontSize: 14,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  lineHeight: 1.6,
                  outline: 'none',
                }}
              />
              <button
                onClick={submitFeedback}
                disabled={submitting}
                style={{
                  background: submitting ? '#A7E8E5' : '#00C6B5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 28px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 15,
                  marginTop: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
              >
                {submitting ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                      <line x1="12" y1="2" x2="12" y2="6"/>
                      <line x1="12" y1="18" x2="12" y2="22"/>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                      <line x1="2" y1="12" x2="6" y2="12"/>
                      <line x1="18" y1="12" x2="22" y2="12"/>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13"/>
                      <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      {submitted && (
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #86EFAC',
          borderRadius: 16,
          padding: 24,
          textAlign: 'center',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#DCFCE7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <p style={{ fontSize: 16, color: '#16A34A', fontWeight: 600, margin: 0 }}>
            Thank you for your feedback!
          </p>
          <p style={{ fontSize: 14, color: '#22C55E', margin: '8px 0 0' }}>
            Your input helps us serve you better.
          </p>
        </div>
      )}
    </div>
  );
}
