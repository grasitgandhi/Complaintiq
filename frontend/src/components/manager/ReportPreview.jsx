// frontend/src/components/manager/ReportPreview.jsx
// Renders the formal government-style RBI monthly report preview
// Used inside RBIReports.jsx after generation

const PRODUCT_ROWS = [
  { cat: 'UPI Payment',    recv: 52, prev: 10, disp: 44, end: 18 },
  { cat: 'NACH Mandate',   recv: 38, prev:  8, disp: 32, end: 14 },
  { cat: 'Savings Account',recv: 24, prev:  4, disp: 22, end:  6 },
  { cat: 'Home Loan',      recv: 18, prev:  3, disp: 17, end:  4 },
  { cat: 'Credit Card',    recv: 14, prev:  2, disp: 12, end:  4 },
  { cat: 'NRE Account',    recv: 10, prev:  1, disp:  9, end:  2 },
  { cat: 'PMJDY Account',  recv:  6, prev:  0, disp:  6, end:  0 },
  { cat: 'Other',          recv:  9, prev:  2, disp:  8, end:  3 },
];

const CHANNEL_ROWS = [
  { channel: 'Online Portal',  count: 71, pct: 41 },
  { channel: 'Email',          count: 43, pct: 25 },
  { channel: 'Phone',          count: 31, pct: 18 },
  { channel: 'Branch Walk-in', count: 17, pct: 10 },
  { channel: 'Social Media',   count: 10, pct:  6 },
];

const TOP_GROUNDS = [
  ['UPI Transaction Failure',      52],
  ['NACH Mandate Bounce',          38],
  ['Net Banking Downtime',         24],
  ['Card Billing Dispute',         18],
  ['Interest Credit Discrepancy',  14],
  ['Remittance Delay',             10],
  ['Account Freeze',                9],
  ['KYC Update Issue',              8],
  ['ATM Cash Dispense Failure',     7],
  ['Loan Statement Error',          6],
];

const TH = ({ children }) => (
  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>
    {children}
  </th>
);

const TD = ({ children, center, bold, color }) => (
  <td style={{
    padding: '7px 12px',
    textAlign: center ? 'center' : 'left',
    fontWeight: bold ? 700 : 400,
    color: color || '#374151',
  }}>
    {children}
  </td>
);

export default function ReportPreview({ bankName, month, onSubmit, submitted }) {
  const totals = PRODUCT_ROWS.reduce(
    (a, r) => ({ recv: a.recv + r.recv, prev: a.prev + r.prev, disp: a.disp + r.disp, end: a.end + r.end }),
    { recv: 0, prev: 0, disp: 0, end: 0 }
  );

  const tableHead = (cols) => (
    <thead>
      <tr style={{ background: '#0A1628', color: '#fff' }}>
        {cols.map(c => <TH key={c}>{c}</TH>)}
      </tr>
    </thead>
  );

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>

      {/* ── Formal government header ── */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #0A1628', paddingBottom: 20, marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0A1628', letterSpacing: 0.5, margin: '0 0 6px' }}>
          RBI MONTHLY COMPLAINT REPORT
        </h2>
        <p style={{ fontSize: 14, color: '#374151', margin: '0 0 2px' }}>{bankName} · {month}</p>
        <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
          Prepared under RBI/2023-24/117 · Integrated Ombudsman Scheme
        </p>
      </div>

      {/* ── Table 1 ── */}
      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>
        Table 1 — Category-wise Complaint Summary
      </h4>
      <div style={{ overflowX: 'auto', marginBottom: 28 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          {tableHead(['Category', 'Received', 'Pending (Prev Month)', 'Disposed', 'Pending (Month End)'])}
          <tbody>
            {PRODUCT_ROWS.map((r, i) => (
              <tr key={r.cat} style={{ background: i % 2 === 0 ? '#F8F9FA' : '#fff', borderBottom: '1px solid #F3F4F6' }}>
                <TD>{r.cat}</TD>
                <TD center>{r.recv}</TD>
                <TD center>{r.prev}</TD>
                <TD center>{r.disp}</TD>
                <TD center>{r.end}</TD>
              </tr>
            ))}
            <tr style={{ background: '#0A1628', color: '#fff' }}>
              <td style={{ padding: '8px 12px', fontWeight: 700, fontSize: 12 }}>Total</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>{totals.recv}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>{totals.prev}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>{totals.disp}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>{totals.end}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Table 2 ── */}
      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>
        Table 2 — Mode of Receipt
      </h4>
      <div style={{ overflowX: 'auto', marginBottom: 28 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          {tableHead(['Channel', 'Count', '%'])}
          <tbody>
            {CHANNEL_ROWS.map((r, i) => (
              <tr key={r.channel} style={{ background: i % 2 === 0 ? '#F8F9FA' : '#fff', borderBottom: '1px solid #F3F4F6' }}>
                <TD>{r.channel}</TD>
                <TD center>{r.count}</TD>
                <TD center>{r.pct}%</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Table 3 ── */}
      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>
        Table 3 — Top 10 Grounds of Complaints
      </h4>
      <div style={{ overflowX: 'auto', marginBottom: 28 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          {tableHead(['Ground', 'Count'])}
          <tbody>
            {TOP_GROUNDS.map(([g, c], i) => (
              <tr key={g} style={{ background: i % 2 === 0 ? '#F8F9FA' : '#fff', borderBottom: '1px solid #F3F4F6' }}>
                <TD>{g}</TD>
                <TD center bold>{c}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Table 4 ── */}
      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>
        Table 4 — Disposal Breakdown
      </h4>
      <div style={{ overflowX: 'auto', marginBottom: 28 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          {tableHead(['Within SLA', 'Beyond SLA', 'Total Disposed'])}
          <tbody>
            <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
              <TD bold color="#16A34A">138 (97.2%)</TD>
              <TD bold color="#DC2626">4 (2.8%)</TD>
              <TD bold>142</TD>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid #E5E7EB' }}>
        <button style={{
          background: '#0A1628', color: '#fff', border: 'none',
          borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
        }}>
          ↓ Download PDF
        </button>
        <button style={{
          background: '#16A34A', color: '#fff', border: 'none',
          borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
        }}>
          ↓ Download Excel
        </button>
        <button
          onClick={onSubmit}
          style={{
            background: submitted ? '#F0FDF4' : 'none',
            color: submitted ? '#16A34A' : '#00B4A6',
            border: `1.5px solid ${submitted ? '#86EFAC' : '#00B4A6'}`,
            borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}
        >
          {submitted ? '✓ Submitted to RBI' : 'Mark as Submitted to RBI'}
        </button>
      </div>
    </div>
  );
}
