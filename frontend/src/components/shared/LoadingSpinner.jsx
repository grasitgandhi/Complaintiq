// frontend/src/components/shared/LoadingSpinner.jsx
export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 14 }}>
      <div style={{
        width: 36, height: 36, border: '3px solid #E5E7EB',
        borderTopColor: '#00B4A6', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
    </div>
  );
}
