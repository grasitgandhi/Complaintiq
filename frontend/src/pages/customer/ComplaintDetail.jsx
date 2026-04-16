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
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading complaint details…" />;

  if (error) return (
    <div style={{ padding: 32, textAlign: 'center', color: '#991B1B' }}>
      <p>{error}</p>
      <button onClick={() => navigate('/customer/track')} style={{ background: '#00B4A6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600, marginTop: 12 }}>
        ← Back to My Complaints
      </button>
    </div>
  );

  if (!c) return <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>Complaint not found.</div>;

  const tier = SLA_TIERS[c.sla_tier] || SLA_TIERS.P3;

  // Normalize events — handle both field name conventions
  const events = (c.events || []).map(ev => ({
    ...ev,
    event_type: ev.event_type || ev.type,
    description: ev.description || ev.text,
    created_at: ev.created_at || ev.at,
  }));

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <button onClick={() => navigate('/customer/track')} style={{ background: 'none', border: 'none', color: '#00B4A6', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
        ← Back to My Complaints
      </button>

      {/* Header card */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 18, color: '#0A1628' }}>{c.reference_number}</span>
          <span style={{ background: '#00B4A6', color: '#fff', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{c.product_category}</span>
          <span style={{ background: tier.bg, color: tier.color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{c.sla_tier}</span>
          <span style={{ background: '#F3F4F6', color: '#374151', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{STATUS_LABELS[c.status]}</span>
        </div>
        <StatusStepper status={c.status} />
        <div style={{ marginTop: 12 }}>
          <SLACountdown deadline={c.sla_deadline} showDue />
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0A1628', marginBottom: 20 }}>Timeline</h3>
        <ComplaintTimeline events={events} />
      </div>

      {/* Bank's final response */}
      {c.status === 'Resolved' && c.final_response && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16, borderLeft: '4px solid #0A1628' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0A1628', marginBottom: 12 }}>Bank's Response</h3>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{c.final_response}</p>
        </div>
      )}

      {/* Feedback — only when resolved and no rating yet */}
      {c.status === 'Resolved' && !c.csat_rating && !submitted && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0A1628', marginBottom: 12 }}>How was your experience?</h3>
          <StarRating value={rating} onChange={setRating} />
          {rating > 0 && (
            <>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder="Tell us more (optional)" rows={3}
                style={{ width: '100%', marginTop: 14, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #D1D5DB', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
              <button onClick={submitFeedback} disabled={submitting} style={{ background: submitting ? '#99E8E3' : '#00B4A6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, marginTop: 12 }}>
                {submitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </>
          )}
        </div>
      )}
      {submitted && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: 16, textAlign: 'center', color: '#16A34A', fontWeight: 600 }}>
          Thank you for your feedback ✓
        </div>
      )}
    </div>
  );
}
