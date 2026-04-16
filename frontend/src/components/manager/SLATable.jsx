// frontend/src/components/manager/SLATable.jsx
import { SLA_TIERS } from '../../constants';

const ROWS = [
  { tier: 'P1', total: 12, on_time: 11, breached: 1, breach_rate: 8.3, avg_days: 0.9 },
  { tier: 'P2', total: 28, on_time: 27, breached: 1, breach_rate: 3.6, avg_days: 1.8 },
  { tier: 'P3', total: 76, on_time: 74, breached: 2, breach_rate: 2.6, avg_days: 3.9 },
  { tier: 'P4', total: 26, on_time: 26, breached: 0, breach_rate: 0.0, avg_days: 7.2 },
];

function brColor(br) {
  if (br > 10) return { bg: '#FEE2E2', text: '#DC2626' };
  if (br >  5) return { bg: '#FEF3C7', text: '#D97706' };
  return             { bg: '#F0FDF4', text: '#16A34A' };
}

export default function SLATable({ data = ROWS }) {
  const totals = data.reduce((acc, r) => ({
    total:       acc.total    + r.total,
    on_time:     acc.on_time  + r.on_time,
    breached:    acc.breached + r.breached,
  }), { total: 0, on_time: 0, breached: 0 });
  totals.breach_rate = ((totals.breached / totals.total) * 100).toFixed(1);

  const cols = ['Tier', 'Total', 'On Time', 'Breached', 'Breach Rate', 'Avg Resolution'];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #F3F4F6' }}>
            {cols.map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const tier = SLA_TIERS[row.tier] || {};
            const br   = brColor(row.breach_rate);
            return (
              <tr key={row.tier} style={{ borderBottom: '1px solid #F9FAFB' }}>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: tier.bg, color: tier.color, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{row.tier}</span>
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 700 }}>{row.total}</td>
                <td style={{ padding: '10px 14px', color: '#16A34A', fontWeight: 600 }}>{row.on_time}</td>
                <td style={{ padding: '10px 14px', color: '#DC2626', fontWeight: 600 }}>{row.breached}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: br.bg, color: br.text, borderRadius: 8, padding: '3px 10px', fontWeight: 700, fontSize: 12 }}>{row.breach_rate}%</span>
                </td>
                <td style={{ padding: '10px 14px' }}>{row.avg_days}d</td>
              </tr>
            );
          })}
          {/* Totals row */}
          <tr style={{ background: '#F8F9FA', fontWeight: 700 }}>
            <td style={{ padding: '10px 14px' }}>Total</td>
            <td style={{ padding: '10px 14px' }}>{totals.total}</td>
            <td style={{ padding: '10px 14px', color: '#16A34A' }}>{totals.on_time}</td>
            <td style={{ padding: '10px 14px', color: '#DC2626' }}>{totals.breached}</td>
            <td style={{ padding: '10px 14px' }}>
              <span style={{ ...brColor(parseFloat(totals.breach_rate)), borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{totals.breach_rate}%</span>
            </td>
            <td style={{ padding: '10px 14px' }}>—</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: '#9CA3AF', padding: '8px 14px' }}>
        SLA tiers per RBI Integrated Ombudsman Scheme (Circular RBI/2023-24/117)
      </p>
    </div>
  );
}
