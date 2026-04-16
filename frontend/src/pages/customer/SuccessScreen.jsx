// frontend/src/pages/customer/SuccessScreen.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { SLA_TIERS } from '../../constants';
import { fmtDate } from '../../utils';

export default function SuccessScreen() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  if (!state) { navigate('/customer/new'); return null; }

  const { reference_number, sla_tier, estimated_resolution, escalation_detected } = state;
  const tier = SLA_TIERS[sla_tier] || SLA_TIERS.P3;

  return (
    <div style={{ maxWidth: 560, margin: '60px auto', padding: '0 20px' }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: 48,
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}>
        {/* Success icon with animation */}
        <div style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #DCFCE7, #A7F3D0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          position: 'relative',
        }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16A34A"
            strokeWidth="2.5"
            style={{ animation: 'checkmark 0.6s ease-in-out forwards' }}
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h2 style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#0B1629',
          marginBottom: 12,
        }}>
          Complaint Filed Successfully
        </h2>
        <p style={{ fontSize: 15, color: '#64748B', marginBottom: 28, lineHeight: 1.6 }}>
          Your complaint has been received and classified by our AI pipeline.
          We&apos;ll keep you updated via SMS and email.
        </p>

        {/* Reference number card */}
        <div style={{
          background: 'linear-gradient(135deg, #F0FDFA 0%, #E6F9F7 100%)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
          border: '1px solid #A7F3D0',
        }}>
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 8, fontWeight: 500 }}>
            Your Reference Number
          </p>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 26,
            fontWeight: 700,
            color: '#00C6B5',
            letterSpacing: 1,
          }}>
            {reference_number}
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>
            Save this number for future reference
          </p>
        </div>

        {/* SLA tier info */}
        <div style={{
          background: tier.bg,
          border: `1px solid ${tier.color}30`,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{
              background: tier.color,
              color: '#fff',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 14,
              fontWeight: 700,
            }}>
              {sla_tier}
            </span>
            <span style={{ fontSize: 15, color: '#374151', fontWeight: 600 }}>
              Priority Level
            </span>
          </div>
          <p style={{ fontSize: 14, color: '#475569', margin: 0, fontWeight: 500 }}>
            {tier.text}
          </p>
          {estimated_resolution && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${tier.color}20` }}>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                Expected resolution by{' '}
                <strong style={{ color: tier.color }}>{fmtDate(estimated_resolution)}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Escalation notice */}
        {escalation_detected && (
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            textAlign: 'left',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, color: '#92400E', fontWeight: 600, margin: 0 }}>
                Escalation Detected
              </p>
              <p style={{ fontSize: 13, color: '#B45309', margin: '4px 0 0', lineHeight: 1.5 }}>
                Your complaint mentions a regulatory body. It has been assigned to a senior agent and you will be contacted within 1 hour.
              </p>
            </div>
          </div>
        )}

        {/* What happens next */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: 16,
          padding: 20,
          marginBottom: 28,
          textAlign: 'left',
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0B1629', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C6B5" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            What happens next?
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { step: '1', text: 'Our AI will analyze and categorize your complaint' },
              { step: '2', text: 'A dedicated agent will be assigned to your case' },
              { step: '3', text: 'You\'ll receive updates via SMS and email' },
              { step: '4', text: 'Track progress anytime using your reference number' },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#00C6B5',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <span style={{ fontSize: 13, color: '#475569' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/customer/track')}
            style={{
              background: '#0B1629',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Track This Complaint
          </button>
          <button
            onClick={() => navigate('/customer/new')}
            style={{
              background: '#F1F5F9',
              color: '#475569',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            File Another
          </button>
        </div>
      </div>
    </div>
  );
}
