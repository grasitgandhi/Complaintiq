// frontend/src/pages/manager/RBIReports.jsx
import { useState } from 'react';
import SidebarNav from '../../components/agent/SidebarNav';
import api from '../../services/api';

const MANAGER_NAV = [
  { path: '/manager/overview', icon: '📊', label: 'Overview' },
  { path: '/manager/sla', icon: '⏱', label: 'SLA Monitor' },
  { path: '/manager/reports', icon: '📄', label: 'RBI Reports' },
  { path: '/manager/agents', icon: '👥', label: 'Agent Performance' },
];

const HISTORY = [
  { month: 'February 2026', generated: '01 Mar 2026', submitted: '03 Mar 2026', status: 'Submitted' },
  { month: 'January 2026', generated: '01 Feb 2026', submitted: '02 Feb 2026', status: 'Submitted' },
  { month: 'December 2025', generated: '01 Jan 2026', submitted: '04 Jan 2026', status: 'Submitted' },
];

export default function RBIReports() {
  const [month, setMonth] = useState('March 2026');
  const [bankName, setBankName] = useState('State Bank of India');
  const [reportType, setType] = useState('Monthly Summary');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  async function doGenerate() {
    setLoading(true);
    setError(null);
    setReportData(null);
    setSubmitted(false);
    try {
      const data = await api.analytics.monthlyReport();
      setReportData(data);
    } catch (err) {
      setError(err.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Safely derive rows and totals from live data
  const productRows = reportData?.by_category || [];
  const channelRows = reportData?.by_channel || [];
  const topGroundRows = Array.isArray(reportData?.top_grounds)
    ? reportData.top_grounds
      .map((row, idx) => {
        if (Array.isArray(row)) {
          return { ground: row[0] ?? `Ground ${idx + 1}`, count: row[1] ?? 0 };
        }
        return {
          ground: row?.ground ?? row?.name ?? `Ground ${idx + 1}`,
          count: row?.count ?? row?.value ?? 0,
        };
      })
      .filter((r) => r.ground)
    : [];
  const totals = productRows.reduce(
    (a, r) => ({
      recv: a.recv + (r.received || 0),
      prev: a.prev + (r.pending_prev || 0),
      disp: a.disp + (r.disposed || 0),
      end: a.end + (r.pending_end || 0),
    }),
    { recv: 0, prev: 0, disp: 0, end: 0 }
  );

  const generated = !!reportData;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif" }}>
      <SidebarNav items={MANAGER_NAV} />

      <div style={{ marginLeft: 220, flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0A1628', marginBottom: 2 }}>RBI Monthly Complaint Report — Auto-Generated</h2>
          <p style={{ fontSize: 13, color: '#6B7280' }}>Reserve Bank of India · Integrated Ombudsman Scheme · {month}</p>
        </div>

        {/* Value callout banner */}
        <div style={{ background: '#00B4A6', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>⏱</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
              This report previously required 40–60 staff hours/month to compile manually.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
              ComplaintIQ generates it from live data in under 2 minutes.
            </p>
          </div>
        </div>

        {/* Configuration card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0A1628', marginBottom: 20 }}>Generate Report</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Month</label>
              <select value={month} onChange={e => setMonth(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #D1D5DB', fontSize: 13 }}>
                <option>March 2026</option><option>February 2026</option><option>January 2026</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Bank Name</label>
              <input value={bankName} onChange={e => setBankName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Report Type</label>
              <select value={reportType} onChange={e => setType(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #D1D5DB', fontSize: 13 }}>
                <option>Monthly Summary</option>
                <option>Ombudsman Referral List</option>
                <option>Category-wise Analysis</option>
              </select>
            </div>
          </div>

          <button onClick={doGenerate} disabled={loading} style={{
            background: loading ? '#99E8E3' : '#00B4A6', color: '#fff', border: 'none',
            borderRadius: 12, padding: '12px 28px', cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: 14,
          }}>
            {loading ? '⏳ Generating…' : 'Generate Report'}
          </button>

          {/* Error message */}
          {error && (
            <div style={{ marginTop: 16, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', color: '#991B1B', fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        {/* Report preview */}
        {generated && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 24, border: '1px solid #E5E7EB' }}>
            {/* Formal header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0A1628', paddingBottom: 20, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0A1628', letterSpacing: 0.5 }}>
                RBI MONTHLY COMPLAINT REPORT
              </h2>
              <p style={{ fontSize: 14, color: '#374151', margin: '4px 0' }}>{bankName} · {month}</p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
                Prepared under RBI/2023-24/117 · Integrated Ombudsman Scheme
              </p>
            </div>

            {/* Table 1 — Category Summary */}
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>
              Table 1 — Category-wise Complaint Summary
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#0A1628', color: '#fff' }}>
                    {['Category', 'Received', 'Pending (Prev Month)', 'Disposed', 'Pending (Month End)'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF' }}>No category data available.</td>
                    </tr>
                  ) : productRows.map((r, i) => (
                    <tr key={r.category} style={{ background: i % 2 === 0 ? '#F8F9FA' : '#fff', borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '7px 12px' }}>{r.category}</td>
                      <td style={{ padding: '7px 12px', textAlign: 'center' }}>{r.received}</td>
                      <td style={{ padding: '7px 12px', textAlign: 'center' }}>{r.pending_prev}</td>
                      <td style={{ padding: '7px 12px', textAlign: 'center' }}>{r.disposed}</td>
                      <td style={{ padding: '7px 12px', textAlign: 'center' }}>{r.pending_end}</td>
                    </tr>
                  ))}
                  {productRows.length > 0 && (
                    <tr style={{ background: '#0A1628', color: '#fff', fontWeight: 700 }}>
                      <td style={{ padding: '8px 12px' }}>Total</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{totals.recv}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{totals.prev}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{totals.disp}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{totals.end}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table 2 — Mode of Receipt */}
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>
              Table 2 — Mode of Receipt
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#0A1628', color: '#fff' }}>
                    {['Channel', 'Count', '%'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {channelRows.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF' }}>No channel data available.</td>
                    </tr>
                  ) : channelRows.map((r, i) => (
                    <tr key={r.channel} style={{ background: i % 2 === 0 ? '#F8F9FA' : '#fff', borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '7px 12px' }}>{r.channel}</td>
                      <td style={{ padding: '7px 12px', textAlign: 'center' }}>{r.count}</td>
                      <td style={{ padding: '7px 12px', textAlign: 'center' }}>{r.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table 3 — Top Complaint Grounds (static from report data if available) */}
            {topGroundRows.length > 0 && (
              <>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>
                  Table 3 — Top 10 Grounds of Complaints
                </h4>
                <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#0A1628', color: '#fff' }}>
                        {['Ground', 'Count'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topGroundRows.map((row, i) => (
                        <tr key={`${row.ground}-${i}`} style={{ background: i % 2 === 0 ? '#F8F9FA' : '#fff', borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '7px 12px' }}>{row.ground}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'center', fontWeight: 700 }}>{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Table 4 — Disposal Breakdown */}
            {reportData?.disposal && (
              <>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 10 }}>
                  Table 4 — Disposal Breakdown
                </h4>
                <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#0A1628', color: '#fff' }}>
                        {['Within SLA', 'Beyond SLA', 'Total Disposed'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '8px 12px', color: '#16A34A', fontWeight: 700 }}>{reportData.disposal.within_sla}</td>
                        <td style={{ padding: '8px 12px', color: '#DC2626', fontWeight: 700 }}>{reportData.disposal.beyond_sla}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{reportData.disposal.total}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button style={{ background: '#0A1628', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                ↓ Download PDF
              </button>
              <button style={{ background: '#16A34A', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                ↓ Download Excel
              </button>
              <button onClick={() => setSubmitted(true)} style={{
                background: submitted ? '#F0FDF4' : 'none',
                color: submitted ? '#16A34A' : '#00B4A6',
                border: `1.5px solid ${submitted ? '#86EFAC' : '#00B4A6'}`,
                borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              }}>
                {submitted ? '✓ Submitted to RBI' : 'Mark as Submitted to RBI'}
              </button>
            </div>
          </div>
        )}

        {/* Submission history */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0A1628', margin: 0 }}>Submission History</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                {['Month', 'Generated On', 'Submitted On', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6B7280', fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600 }}>{h.month}</td>
                  <td style={{ padding: '10px 16px', color: '#6B7280' }}>{h.generated}</td>
                  <td style={{ padding: '10px 16px', color: '#6B7280' }}>{h.submitted}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ background: '#F0FDF4', color: '#16A34A', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
                      ✓ {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
