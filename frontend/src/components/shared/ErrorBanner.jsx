// frontend/src/components/shared/ErrorBanner.jsx
export default function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: '#FEF2F2', border: '1px solid #FECACA',
      borderRadius: 12, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 18 }}>⚠️</span>
      <span style={{ flex: 1, fontSize: 13, color: '#991B1B' }}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: '#DC2626', color: '#fff', border: 'none',
          borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
        }}>Retry</button>
      )}
    </div>
  );
}
