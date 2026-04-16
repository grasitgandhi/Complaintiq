// frontend/src/components/agent/ComplaintCard.jsx
import { useNavigate } from 'react-router-dom';
import { SLA_TIERS, SENTIMENT_MAP, STATUS_LABELS } from '../../constants';
import { slaCountdown } from '../../utils';

export default function ComplaintCard({ c }) {
  const navigate = useNavigate();
  const tier     = SLA_TIERS[c.tier] || SLA_TIERS.P3;
  const t        = slaCountdown(c.sla_deadline);
  const sentiment = SENTIMENT_MAP[c.ai_sentiment] || SENTIMENT_MAP.NEUTRAL;

  return (
    <div style={{
      background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      display: 'flex', overflow: 'hidden', position: 'relative',
    }}>
      {/* Priority left bar — 4px colour */}
      <div style={{ width: 4, background: tier.color, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          {/* Left: ref, badges */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, color: '#0A1628', fontSize: 14 }}>{c.reference}</span>
              <span style={{ background: tier.bg, color: tier.color, borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{c.tier}</span>
              <span style={{ background: '#00B4A6', color: '#fff', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{c.product}</span>
              <span style={{ background: sentiment.bg, color: sentiment.color, borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{sentiment.label}</span>

              {/* Escalation badge */}
              {c.escalation_threat_detected && (
                <span
                  title="Customer mentioned RBI / Banking Ombudsman — auto-upgraded to P1 by Indian banking ontology NLP (6-language detection)"
                  style={{ background: '#DC2626', color: '#fff', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700, cursor: 'help' }}
                >
                  ⚠ ESCALATION RISK
                </span>
              )}
            </div>

            {/* Customer + complaint type */}
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>
              {c.customer_name} ·{' '}
              <em title="Classified by DistilBERT 4-head NLP (Type · Product · Severity · Sentiment)" style={{ color: '#9CA3AF', cursor: 'help' }}>
                {c.ai_complaint_type}
              </em>
            </div>
          </div>

          {/* Right: SLA + confidence */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: t.color, fontWeight: 600, fontSize: 13 }}>⏱ {t.label}</div>
            {/* AI confidence bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, justifyContent: 'flex-end' }}>
              <div style={{ width: 60, height: 6, borderRadius: 3, background: '#E5E7EB', overflow: 'hidden' }}>
                <div style={{ width: `${(c.ai_confidence_score || 0) * 100}%`, height: '100%', background: '#00B4A6', borderRadius: 3 }} />
              </div>
              <span title="Average confidence across 4 classification heads" style={{ fontSize: 11, color: '#6B7280', cursor: 'help' }}>
                AI: {Math.round((c.ai_confidence_score || 0) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom row: status + open button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ background: '#F3F4F6', color: '#374151', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
            {STATUS_LABELS[c.status]}
          </span>
          <button
            onClick={() => navigate(`/agent/complaint/${c.id}`)}
            style={{ background: '#0A1628', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            Open →
          </button>
        </div>
      </div>
    </div>
  );
}
