// frontend/src/components/manager/StatCard.jsx
export default function StatCard({ label, value, sub, color, tooltip, subColor }) {
  const valueStyle = color ? { color } : undefined;
  return (
    <div
      title={tooltip || ''}
      className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-[14px] px-5 py-4 shadow-sm dark:shadow-md transition-colors duration-300"
      style={{ cursor: tooltip ? 'help' : 'default' }}
    >
      <div className="text-[28px] font-extrabold text-slate-900 dark:text-slate-100" style={valueStyle}>
        {value}
      </div>
      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
        {label}
      </div>
      {sub && (
        <div className="text-[11px] mt-1" style={{ color: subColor || '#9CA3AF' }}>
          {sub}
        </div>
      )}
    </div>
  );
}
