// frontend/src/pages/customer/ComplaintDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import StatusStepper from '../../components/customer/StatusStepper';
import SLACountdown from '../../components/customer/SLACountdown';
import ComplaintTimeline from '../../components/customer/ComplaintTimeline';
import StarRating from '../../components/customer/StarRating';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { SLA_TIERS, STATUS_LABELS } from '../../constants';
import api from '../../services/api';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
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
        setError(err.message || t('Failed to load complaint details.'));
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
      toast.error(err.message || t('Failed to submit feedback. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label={t('Loading complaint details…')} />;

  if (error) return (
    <div style={{ padding: 32, textAlign: 'center', color: '#991B1B' }}>
      <p>{error}</p>
      <button onClick={() => navigate('/customer/track')} style={{ background: '#00B4A6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600, marginTop: 12 }}>
        {t('← Back to My Complaints')}
      </button>
    </div>
  );

  if (!c) return <div style={{ padding: 32, textAlign: 'center', color: isDark ? '#94A3B8' : '#9CA3AF' }}>{t('Complaint not found.')}</div>;

  const tier = SLA_TIERS[c.sla_tier] || SLA_TIERS.P3;
  const cardBg = isDark ? '#0F172A' : '#fff';
  const border = isDark ? '#334155' : '#E5E7EB';
  const textPrimary = isDark ? '#F1F5F9' : '#0A1628';
  const textBody = isDark ? '#CBD5E1' : '#374151';
  const textMuted = isDark ? '#A3B4C8' : '#64748B';

  // Normalize events — handle both field name conventions
  const events = (c.events || []).map(ev => ({
    type: ev.event_type || ev.type || 'SYSTEM',
    text: ev.description || ev.text || '',
    at: ev.created_at || ev.at,
  }));

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px', minHeight: '100vh', background: isDark ? '#010409' : '#F8FAFC' }}>
      <button onClick={() => navigate('/customer/track')} style={{ background: 'none', border: 'none', color: '#00B4A6', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
        {t('← Back to My Complaints')}
      </button>

      {/* Header card */}
      <div style={{ background: cardBg, borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16, border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 18, color: textPrimary }}>{c.reference_number}</span>
          <span style={{ background: '#00B4A6', color: '#fff', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{c.product_category}</span>
          <span style={{ background: tier.bg, color: tier.color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{c.sla_tier}</span>
          <span style={{ background: isDark ? '#1F2937' : '#F3F4F6', color: textBody, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{STATUS_LABELS[c.status]}</span>
        </div>
        <StatusStepper status={c.status} />
        <div style={{ marginTop: 12 }}>
          <SLACountdown deadline={c.sla_deadline} showDue />
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background: cardBg, borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16, border: `1px solid ${border}` }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: textPrimary, marginBottom: 20 }}>{t('Timeline')}</h3>
        <ComplaintTimeline events={events} />
      </div>

      {/* Bank's final response */}
      {c.status === 'Resolved' && c.final_response_text && (
        <div style={{ background: cardBg, borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16, borderLeft: '4px solid #0A1628', border: `1px solid ${border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: textPrimary, marginBottom: 12 }}>{t("Bank's Response")}</h3>
          <p style={{ fontSize: 13, color: textBody, lineHeight: 1.7 }}>{c.final_response_text}</p>
        </div>
      )}

      {/* Feedback — only when resolved and no rating yet */}
      {c.status === 'Resolved' && !c.csat_rating && !submitted && (
        <div style={{ background: cardBg, borderRadius: 16, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: 16, border: `1px solid ${border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: textPrimary, marginBottom: 12 }}>{t('How was your experience?')}</h3>
          <StarRating value={rating} onChange={setRating} />
          {rating > 0 && (
            <>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder={t('Tell us more (optional)')} rows={3}
                style={{ width: '100%', marginTop: 14, padding: '10px 14px', borderRadius: 10, border: isDark ? '1.5px solid #334155' : '1.5px solid #D1D5DB', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', background: isDark ? '#0B1220' : '#fff', color: isDark ? '#E2E8F0' : '#0F172A' }} />
              <button onClick={submitFeedback} disabled={submitting} style={{ background: submitting ? '#99E8E3' : '#00B4A6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, marginTop: 12 }}>
                {submitting ? t('Submitting…') : t('Submit Feedback')}
              </button>
            </>
          )}
        </div>
      )}
      {submitted && (
        <div style={{ background: isDark ? 'rgba(22,163,74,0.12)' : '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: 16, textAlign: 'center', color: '#16A34A', fontWeight: 600 }}>
          {t('Thank you for your feedback ✓')}
        </div>
      )}
    </div>
  );
}
