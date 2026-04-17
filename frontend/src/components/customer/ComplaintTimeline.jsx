// frontend/src/components/customer/ComplaintTimeline.jsx
import { fmtDateTime } from '../../utils';
import { useTheme } from '../../context/ThemeContext';

const ACTOR_STYLE = {
  SYSTEM: { icon: '⚙', bg: '#F3F4F6', border: '#D1D5DB' },
  AGENT: { icon: '👤', bg: '#F0FDFC', border: '#00B4A6' },
  CUSTOMER: { icon: '🧑', bg: '#EFF6FF', border: '#0A1628' },
};

export default function ComplaintTimeline({ events }) {
  const { isDark } = useTheme();
  const sorted = [...events].sort((a, b) => new Date(b.at) - new Date(a.at));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {sorted.map((ev, i) => {
        const eventType = ev.type || ev.event_type || 'SYSTEM';
        const style = ACTOR_STYLE[eventType] || ACTOR_STYLE.SYSTEM;
        return (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 20, position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                background: style.bg, border: `2px solid ${style.border}`,
              }}>{style.icon}</div>
              {i < sorted.length - 1 && <div style={{ width: 2, flex: 1, background: '#F3F4F6', marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <p style={{ fontSize: 13, color: isDark ? '#E2E8F0' : '#0A1628', margin: 0, lineHeight: 1.5 }}>
                {ev.text || ev.description || ''}
              </p>
              <p style={{ fontSize: 11, color: isDark ? '#94A3B8' : '#9CA3AF', marginTop: 3 }}>
                {fmtDateTime(ev.at || ev.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
