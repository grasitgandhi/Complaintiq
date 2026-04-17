// frontend/src/pages/customer/SuccessScreen.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SLA_TIERS } from '../../constants';
import { fmtDate } from '../../utils';

export default function SuccessScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  if (!state) { navigate('/customer/new'); return null; }

  const { reference_number, sla_tier, estimated_resolution, escalation_detected } = state;
  const tier = SLA_TIERS[sla_tier] || SLA_TIERS.P3;
  const cardBg = isDark ? '#0F172A' : '#fff';
  const border = isDark ? '#334155' : '#E5E7EB';
  const textPrimary = isDark ? '#F1F5F9' : '#0A1628';
  const textBody = isDark ? '#CBD5E1' : '#374151';
  const textMuted = isDark ? '#A3B4C8' : '#64748B';

  return (
    <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 16px', textAlign: 'center', minHeight: '100vh' }}>
      <div style={{ background: cardBg, borderRadius: 20, padding: 40, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${border}` }}>
        {/* Icon */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(22,163,74,0.18)' : '#F0FDF4', border: isDark ? '1px solid rgba(34,197,94,0.35)' : '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 20px' }}>
          ✅
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>
          {t('Complaint Filed Successfully')}
        </h2>
        <p style={{ fontSize: 13, color: textMuted, marginBottom: 20 }}>
          {t('Your complaint has been received and classified by our AI pipeline.')}
        </p>

        {/* Reference number */}
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 22, fontWeight: 700, color: '#00B4A6', background: '#F0FDFC', borderRadius: 10, padding: '14px 20px', margin: '0 0 16px' }}>
          {/* TODO: i18n — Reference Number */}
          {reference_number}
        </div>

        {/* SLA tier */}
        <div style={{ background: tier.bg, border: `1px solid ${tier.color}30`, borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
          <span style={{ background: tier.color, color: '#fff', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{sla_tier}</span>
          <p style={{ fontSize: 13, color: textBody, margin: '8px 0 0', fontWeight: 600 }}>{t('Priority:')} {tier.text}</p>
          {estimated_resolution && (
            <p style={{ fontSize: 12, color: textMuted, margin: '4px 0 0' }}>
              {t('Expected resolution by:')} {fmtDate(estimated_resolution)}
            </p>
          )}
        </div>

        {/* Escalation note */}
        {escalation_detected && (
          <div style={{ background: '#FFFBEB', border: '1px solid #F59E0B', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: '#92400E', fontWeight: 600, margin: 0 }}>
              {t('⚠ Escalation detected — assigned to a senior agent. You will be contacted within 1 hour.')}
            </p>
          </div>
        )}

        <p style={{ fontSize: 12, color: textMuted, marginBottom: 24 }}>
          {t("We'll notify you via SMS and email as your complaint progresses.")}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => navigate('/customer/track')} style={{ background: '#0A1628', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {t('Track This Complaint')}
          </button>
          <button onClick={() => navigate('/customer/new')} style={{ background: isDark ? '#1F2937' : '#F3F4F6', color: isDark ? '#E2E8F0' : '#374151', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {t('File Another')}
          </button>
        </div>
      </div>
    </div>
  );
}
