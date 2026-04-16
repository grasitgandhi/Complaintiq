// frontend/src/components/shared/ConfirmModal.jsx
export default function ConfirmModal({ title, message, onCancel, onConfirm, confirmLabel = 'Confirm', danger = false }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 460, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, padding: '12px', cursor: 'pointer', fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, border: 'none', borderRadius: 10, padding: '12px', cursor: 'pointer', fontWeight: 700,
            background: danger ? '#DC2626' : '#00B4A6', color: '#fff',
          }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
