// frontend/src/pages/manager/RBIReports.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import SidebarNav from '../../components/agent/SidebarNav';
import { useLanguage } from '../../context/LanguageContext';
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
  const { t } = useLanguage();
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
      setError(err.message || t('Failed to generate report. Please try again.'));
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

  function reportFileBaseName() {
    return `${bankName}_${month}_${reportType}`
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');
  }

  function requireGeneratedReport() {
    if (!generated || !reportData) {
      toast.error(t('Generate report before downloading.'));
      return false;
    }
    return true;
  }

  function downloadExcel() {
    if (!requireGeneratedReport()) return;

    const rows = [];
    rows.push([t('RBI MONTHLY COMPLAINT REPORT')]);
    rows.push([bankName, month]);
    rows.push([]);

    rows.push([t('Table 1 — Category-wise Complaint Summary')]);
    rows.push([t('Category'), t('Received'), t('Pending (Prev Month)'), t('Disposed'), t('Pending (Month End)')]);
    if (productRows.length === 0) {
      rows.push([t('No category data available.')]);
    } else {
      productRows.forEach((r) => rows.push([r.category, r.received, r.pending_prev, r.disposed, r.pending_end]));
      rows.push([t('Total'), totals.recv, totals.prev, totals.disp, totals.end]);
    }
    rows.push([]);

    rows.push([t('Table 2 — Mode of Receipt')]);
    rows.push([t('Channel'), t('Count'), '%']);
    if (channelRows.length === 0) {
      rows.push([t('No channel data available.')]);
    } else {
      channelRows.forEach((r) => rows.push([r.channel, r.count, `${r.pct}%`]));
    }
    rows.push([]);

    if (topGroundRows.length > 0) {
      rows.push([t('Table 3 — Top 10 Grounds of Complaints')]);
      rows.push([t('Ground'), t('Count')]);
      topGroundRows.forEach((r) => rows.push([r.ground, r.count]));
      rows.push([]);
    }

    if (reportData?.disposal) {
      rows.push([t('Table 4 — Disposal Breakdown')]);
      rows.push([t('Within SLA'), t('Beyond SLA'), t('Total Disposed')]);
      rows.push([reportData.disposal.within_sla, reportData.disposal.beyond_sla, reportData.disposal.total]);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'RBI Report');
    XLSX.writeFile(wb, `${reportFileBaseName()}.xlsx`);
  }

  function downloadPdf() {
    if (!requireGeneratedReport()) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(14);
    doc.text(t('RBI MONTHLY COMPLAINT REPORT'), pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`${bankName} · ${month}`, pageWidth / 2, 58, { align: 'center' });

    let y = 76;

    doc.setFontSize(11);
    doc.text(t('Table 1 — Category-wise Complaint Summary'), 40, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [[t('Category'), t('Received'), t('Pending (Prev Month)'), t('Disposed'), t('Pending (Month End)')]],
      body: productRows.length === 0
        ? [[t('No category data available.'), '', '', '', '']]
        : [
          ...productRows.map((r) => [r.category, r.received, r.pending_prev, r.disposed, r.pending_end]),
          [t('Total'), totals.recv, totals.prev, totals.disp, totals.end],
        ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
    });

    y = (doc.lastAutoTable?.finalY || y) + 20;
    doc.setFontSize(11);
    doc.text(t('Table 2 — Mode of Receipt'), 40, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [[t('Channel'), t('Count'), '%']],
      body: channelRows.length === 0
        ? [[t('No channel data available.'), '', '']]
        : channelRows.map((r) => [r.channel, r.count, `${r.pct}%`]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] },
    });

    y = (doc.lastAutoTable?.finalY || y) + 20;

    if (topGroundRows.length > 0) {
      if (y > 700) {
        doc.addPage();
        y = 40;
      }
      doc.setFontSize(11);
      doc.text(t('Table 3 — Top 10 Grounds of Complaints'), 40, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [[t('Ground'), t('Count')]],
        body: topGroundRows.map((r) => [r.ground, r.count]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [15, 23, 42] },
      });
      y = (doc.lastAutoTable?.finalY || y) + 20;
    }

    if (reportData?.disposal) {
      if (y > 700) {
        doc.addPage();
        y = 40;
      }
      doc.setFontSize(11);
      doc.text(t('Table 4 — Disposal Breakdown'), 40, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [[t('Within SLA'), t('Beyond SLA'), t('Total Disposed')]],
        body: [[reportData.disposal.within_sla, reportData.disposal.beyond_sla, reportData.disposal.total]],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [15, 23, 42] },
      });
    }

    doc.save(`${reportFileBaseName()}.pdf`);
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
      <SidebarNav items={MANAGER_NAV} />

      <div className="ml-[220px] flex-1 p-6 sm:p-7 overflow-y-auto">
        {/* Page header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('RBI Monthly Complaint Report — Auto-Generated')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Reserve Bank of India · Integrated Ombudsman Scheme · {month}</p>
        </div>

        {/* Value callout banner */}
        <div className="bg-[#00B4A6] rounded-2xl px-5 py-4 mb-6 flex gap-3 items-start">
          <span className="text-2xl flex-shrink-0">⏱</span>
          <div>
            <p className="text-sm font-bold text-white m-0 mb-1">
              {t('This report previously required 40–60 staff hours/month to compile manually.')}
            </p>
            <p className="text-xs text-white/80 m-0">
              {t('ComplaintIQ generates it from live data in under 2 minutes.')}
            </p>
          </div>
        </div>

        {/* Configuration card */}
        <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-md mb-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">{t('Generate Report')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Month</label>
              <select value={month} onChange={e => setMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-slate-900 dark:text-white">
                <option>March 2026</option><option>February 2026</option><option>January 2026</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Bank Name</label>
              <input value={bankName} onChange={e => setBankName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Report Type</label>
              <select value={reportType} onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1117] text-sm text-slate-900 dark:text-white">
                <option>Monthly Summary</option>
                <option>Ombudsman Referral List</option>
                <option>Category-wise Analysis</option>
              </select>
            </div>
          </div>

          <button
            onClick={doGenerate}
            disabled={loading}
            className="rounded-lg px-6 py-3 font-bold text-sm bg-[#00B4A6] text-white hover:bg-[#009E90] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00B4A6]/60 transition-colors"
          >
            {loading ? t('⏳ Generating…') : t('Generate Report')}
          </button>

          {/* Error message */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Report preview */}
        {generated && (
          <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm dark:shadow-md mb-6">
            {/* Formal header */}
            <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-5 mb-6">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-wide">
                RBI MONTHLY COMPLAINT REPORT
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 my-1">{bankName} · {month}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
                Prepared under RBI/2023-24/117 · Integrated Ombudsman Scheme
              </p>
            </div>

            {/* Table 1 — Category Summary */}
            <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-2.5">
              Table 1 — Category-wise Complaint Summary
            </h4>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 dark:bg-[#0D1117] text-white">
                    {['Category', 'Received', 'Pending (Prev Month)', 'Disposed', 'Pending (Month End)'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold border-b border-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-5 text-center text-slate-400">No category data available.</td>
                    </tr>
                  ) : productRows.map((r, i) => (
                    <tr key={r.category} className={`${i % 2 === 0 ? 'bg-slate-50 dark:bg-[#1A202C]' : 'bg-white dark:bg-[#161B22]'} border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300`}>
                      <td className="px-3 py-2">{r.category}</td>
                      <td className="px-3 py-2 text-center">{r.received}</td>
                      <td className="px-3 py-2 text-center">{r.pending_prev}</td>
                      <td className="px-3 py-2 text-center">{r.disposed}</td>
                      <td className="px-3 py-2 text-center">{r.pending_end}</td>
                    </tr>
                  ))}
                  {productRows.length > 0 && (
                    <tr className="bg-slate-900 dark:bg-[#0D1117] text-white font-bold">
                      <td className="px-3 py-2 border-t border-slate-700">Total</td>
                      <td className="px-3 py-2 text-center border-t border-slate-700">{totals.recv}</td>
                      <td className="px-3 py-2 text-center border-t border-slate-700">{totals.prev}</td>
                      <td className="px-3 py-2 text-center border-t border-slate-700">{totals.disp}</td>
                      <td className="px-3 py-2 text-center border-t border-slate-700">{totals.end}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table 2 — Mode of Receipt */}
            <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-2.5">
              Table 2 — Mode of Receipt
            </h4>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 dark:bg-[#0D1117] text-white">
                    {['Channel', 'Count', '%'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold border-b border-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {channelRows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-5 text-center text-slate-400">No channel data available.</td>
                    </tr>
                  ) : channelRows.map((r, i) => (
                    <tr key={r.channel} className={`${i % 2 === 0 ? 'bg-slate-50 dark:bg-[#1A202C]' : 'bg-white dark:bg-[#161B22]'} border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300`}>
                      <td className="px-3 py-2">{r.channel}</td>
                      <td className="px-3 py-2 text-center">{r.count}</td>
                      <td className="px-3 py-2 text-center">{r.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table 3 — Top Complaint Grounds (static from report data if available) */}
            {topGroundRows.length > 0 && (
              <>
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-2.5">
                  {t('Table 3 — Top 10 Grounds of Complaints')}
                </h4>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 dark:bg-[#0D1117] text-white">
                        {['Ground', 'Count'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold border-b border-slate-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topGroundRows.map((row, i) => (
                        <tr key={`${row.ground}-${i}`} className={`${i % 2 === 0 ? 'bg-slate-50 dark:bg-[#1A202C]' : 'bg-white dark:bg-[#161B22]'} border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300`}>
                          <td className="px-3 py-2">{row.ground}</td>
                          <td className="px-3 py-2 text-center font-bold text-slate-900 dark:text-white">{row.count}</td>
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
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-2.5">
                  Table 4 — Disposal Breakdown
                </h4>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 dark:bg-[#0D1117] text-white">
                        {['Within SLA', 'Beyond SLA', 'Total Disposed'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold border-b border-slate-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        <td className="px-3 py-2 text-green-600 dark:text-green-400 font-bold">{reportData.disposal.within_sla}</td>
                        <td className="px-3 py-2 text-red-600 dark:text-red-400 font-bold">{reportData.disposal.beyond_sla}</td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{reportData.disposal.total}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button onClick={downloadPdf} className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg px-5 py-2.5 font-semibold text-[13px] transition-colors">
                {t('↓ Download PDF')}
              </button>
              <button onClick={downloadExcel} className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-5 py-2.5 font-semibold text-[13px] transition-colors">
                {t('↓ Download Excel')}
              </button>
              <button onClick={() => setSubmitted(true)} className={`
                ${submitted
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-[1.5px] border-green-300 dark:border-green-800'
                  : 'bg-transparent text-teal-600 dark:text-teal-400 border-[1.5px] border-teal-500 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                } rounded-lg px-5 py-2.5 font-semibold text-[13px] transition-colors
              `}>
                {submitted ? t('✓ Submitted to RBI') : t('Mark as Submitted to RBI')}
              </button>
            </div>
          </div>
        )}

        {/* Submission history */}
        <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">Submission History</h3>
          </div>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                {['Month', 'Generated On', 'Submitted On', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((h, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-slate-100">{h.month}</td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{h.generated}</td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{h.submitted}</td>
                  <td className="px-4 py-2.5">
                    <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full px-2.5 py-0.5 text-xs font-bold">
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
