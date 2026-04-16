// frontend/src/components/agent/ConfirmSendModal.jsx
export default function ConfirmSendModal({ customerName, onCancel, onConfirm }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 480, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>
          ✅
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>
          Send Response to {customerName}?
        </h3>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, marginBottom: 8 }}>
          As the approving agent, you confirm this response is accurate and policy-compliant. This action cannot be undone.
        </p>
        <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 24 }}>
          HITL Layer 8 — Human-in-the-Loop sign-off. No AI output reaches a customer without agent approval.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, padding: 12, cursor: 'pointer', fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, background: '#00B4A6', color: '#fff', border: 'none', borderRadius: 10, padding: 12, cursor: 'pointer', fontWeight: 700 }}>
            Confirm and Send ✓
          </button>
        </div>
      </div>
    </div>
  );
}
