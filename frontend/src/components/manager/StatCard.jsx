// frontend/src/components/manager/StatCard.jsx
export default function StatCard({ label, value, sub, color, tooltip, subColor }) {
  return (
    <div title={tooltip || ''} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', cursor: tooltip ? 'help' : 'default' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || '#0A1628' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: subColor || '#9CA3AF', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}
