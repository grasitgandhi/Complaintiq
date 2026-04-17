// frontend/src/components/customer/StepProgressBar.jsx
import { useTheme } from '../../context/ThemeContext';

export default function StepProgressBar({ steps, current }) {
  const { isDark } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
      {steps.map((label, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          {/* Node */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14,
              background: i < current ? '#00B4A6' : i === current ? '#0A1628' : (isDark ? '#1F2937' : '#E5E7EB'),
              color: i < current ? '#fff' : i === current ? '#fff' : (isDark ? '#94A3B8' : '#9CA3AF'),
              border: `2px solid ${i <= current ? (i < current ? '#00B4A6' : '#0A1628') : (isDark ? '#334155' : '#E5E7EB')}`,
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
              color: i === current ? (isDark ? '#E2E8F0' : '#0A1628') : i < current ? '#00B4A6' : (isDark ? '#94A3B8' : '#9CA3AF'),
            }}>{label}</span>
          </div>
          {/* Connector */}
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? '#00B4A6' : (isDark ? '#334155' : '#E5E7EB'), margin: '0 8px', marginBottom: 20 }} />
          )}
        </div>
      ))}
    </div>
  );
}
