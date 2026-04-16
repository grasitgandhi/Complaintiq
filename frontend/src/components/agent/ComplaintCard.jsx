// frontend/src/components/agent/ComplaintCard.jsx
import { useNavigate } from 'react-router-dom';
import { SLA_TIERS, SENTIMENT_MAP, STATUS_LABELS } from '../../constants';
import { slaCountdown } from '../../utils';

export default function ComplaintCard({ c }) {
  const navigate = useNavigate();
  const tier     = SLA_TIERS[c.sla_tier || c.tier] || SLA_TIERS.P3;
  const t        = slaCountdown(c.sla_deadline);
  const sentiment = SENTIMENT_MAP[c.ai_sentiment] || SENTIMENT_MAP.NEUTRAL;
  const isUrgent = c.sla_tier === 'P1' || c.sla_tier === 'P2' || c.tier === 'P1' || c.tier === 'P2';

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        border: '1px solid #E2E8F0',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/agent/complaint/${c.id}`)}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Priority left bar */}
      <div style={{ width: 4, background: tier.color, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          {/* Left: ref, badges */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontWeight: 700,
                color: '#0B1629',
                fontSize: 15,
              }}>
                {c.reference_number || c.reference}
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
              
              {c.escalation_threat_detected && (
                <span
                  title="Customer mentioned RBI / Banking Ombudsman - auto-upgraded to P1"
                  style={{
                    background: '#FEE2E2',
                    color: '#DC2626',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'help',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  ESCALATION RISK
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                background: tier.bg,
                color: tier.color,
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
              }}>
                {c.sla_tier || c.tier}
              </span>
              <span style={{
                background: 'linear-gradient(135deg, #00C6B5, #009E90)',
                color: '#fff',
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 600,
              }}>
                {c.product_category || c.product}
              </span>
              <span style={{
                background: sentiment.bg,
                color: sentiment.color,
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 600,
              }}>
                {sentiment.label}
              </span>
            </div>

            {/* Customer + complaint type */}
            <div style={{ fontSize: 14, color: '#64748B', marginTop: 10 }}>
              {c.customer_name}
              {(c.ai_complaint_type || c.complaint_text) && (
                <>
                  {' '}&middot;{' '}
                  <span
                    title="Classified by DistilBERT 4-head NLP"
                    style={{ color: '#94A3B8', cursor: 'help' }}
                  >
                    {c.ai_complaint_type || (c.complaint_text?.slice(0, 40) + '...')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: SLA + confidence */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              color: t.color,
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              justifyContent: 'flex-end',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {t.label}
            </div>
            
            {/* AI confidence bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <div style={{
                width: 64,
                height: 6,
                borderRadius: 3,
                background: '#E2E8F0',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${(c.ai_confidence_score || 0.85) * 100}%`,
                  height: '100%',
                  background: '#00C6B5',
                  borderRadius: 3,
                }} />
              </div>
              <span
                title="Average confidence across 4 classification heads"
                style={{ fontSize: 12, color: '#64748B', cursor: 'help', fontWeight: 500 }}
              >
                AI: {Math.round((c.ai_confidence_score || 0.85) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom row: status + open button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 14,
          paddingTop: 14,
          borderTop: '1px solid #F1F5F9',
        }}>
          <span style={{
            background: c.status === 'Resolved' || c.status === 'Closed' ? '#DCFCE7' : '#F1F5F9',
            color: c.status === 'Resolved' || c.status === 'Closed' ? '#16A34A' : '#475569',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 600,
          }}>
            {STATUS_LABELS[c.status]}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/agent/complaint/${c.id}`);
            }}
            style={{
              background: '#0B1629',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 18px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
            }}
          >
            Open
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
