// frontend/src/components/manager/SLATable.jsx
import { SLA_TIERS } from '../../constants';

function brColor(br) {
  if (br > 10) return { bg: '#FEE2E2', text: '#DC2626' };
  if (br > 5) return { bg: '#FEF3C7', text: '#D97706' };
  return { bg: '#F0FDF4', text: '#16A34A' };
}

export default function SLATable({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];
  const totals = safeData.reduce((acc, r) => ({
    total: acc.total + r.total,
    on_time: acc.on_time + r.on_time,
    breached: acc.breached + r.breached,
  }), { total: 0, on_time: 0, breached: 0 });
  totals.breach_rate = totals.total > 0 ? ((totals.breached / totals.total) * 100).toFixed(1) : '0.0';

  const cols = ['Tier', 'Total', 'On Time', 'Breached', 'Breach Rate', 'Avg Resolution'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {cols.map(h => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                No SLA performance data available.
              </td>
            </tr>
          )}
          {safeData.map(row => {
            const tier = SLA_TIERS[row.tier] || {};
            const br = brColor(row.breach_rate);
            return (
              <tr key={row.tier} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-2.5">
                  <span style={{ background: tier.bg, color: tier.color, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{row.tier}</span>
                </td>
                <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-slate-100">{row.total}</td>
                <td className="px-4 py-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">{row.on_time}</td>
                <td className="px-4 py-2.5 text-red-600 dark:text-red-400 font-semibold">{row.breached}</td>
                <td className="px-4 py-2.5">
                  <span style={{ background: br.bg, color: br.text, borderRadius: 8, padding: '3px 10px', fontWeight: 700, fontSize: 12 }}>{row.breach_rate}%</span>
                </td>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{row.avg_days}d</td>
              </tr>
            );
          })}
          {/* Totals row */}
          {safeData.length > 0 && <tr className="bg-slate-50 dark:bg-slate-900 font-bold">
            <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100">Total</td>
            <td className="px-4 py-2.5 text-slate-900 dark:text-slate-100">{totals.total}</td>
            <td className="px-4 py-2.5 text-emerald-600 dark:text-emerald-400">{totals.on_time}</td>
            <td className="px-4 py-2.5 text-red-600 dark:text-red-400">{totals.breached}</td>
            <td className="px-4 py-2.5">
              <span style={{ ...brColor(parseFloat(totals.breach_rate)), borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{totals.breach_rate}%</span>
            </td>
            <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">—</td>
          </tr>}
        </tbody>
      </table>
      <p className="text-[11px] text-slate-500 dark:text-slate-500 px-4 py-2">
        SLA tiers per RBI Integrated Ombudsman Scheme (Circular RBI/2023-24/117)
      </p>
    </div>
  );
}
