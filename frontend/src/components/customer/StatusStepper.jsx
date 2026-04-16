// frontend/src/components/customer/StatusStepper.jsx

const STEPS = ['Received', 'Under Review', 'Response Drafted', 'Resolved'];
const STATUS_IDX = {
  New: 0, InProgress: 1, AwaitingCustomer: 1,
  DraftReady: 2, Resolved: 3, Closed: 3,
};

export default function StatusStepper({ status }) {
  const idx = STATUS_IDX[status] ?? 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: i <= idx ? '#00B4A6' : '#E5E7EB',
              border: `2px solid ${i <= idx ? '#00B4A6' : '#D1D5DB'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#fff', fontWeight: 700, flexShrink: 0,
            }}>
              {i < idx
                ? '✓'
                : i === idx
                  ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'block', animation: 'pulse-dot 1.4s infinite' }} />
                  : null}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', color: i <= idx ? '#00B4A6' : '#9CA3AF' }}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < idx ? '#00B4A6' : '#E5E7EB', margin: '0 4px', marginBottom: 18 }} />
          )}
        </div>
      ))}
    </div>
  );
}
