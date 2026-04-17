// frontend/src/pages/manager/ManagerOverview.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SidebarNav from '../../components/agent/SidebarNav';
import StatCard from '../../components/manager/StatCard';
import SLATable from '../../components/manager/SLATable';
import { VolumeLineChart, ProductDonutChart, SentimentBarChart, TopTypesChart } from '../../components/shared/Charts';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import api from '../../services/api';

const MANAGER_NAV = [
  { path: '/manager/overview', icon: '📊', label: 'Overview' },
  { path: '/manager/sla',      icon: '⏱',  label: 'SLA Monitor' },
  { path: '/manager/reports',  icon: '📄',  label: 'RBI Reports' },
  { path: '/manager/agents',   icon: '👥',  label: 'Agent Performance' },
];

export default function ManagerOverview() {
  const { token }   = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [summary, volume, byProduct, sentiment] = await Promise.all([
          api.analytics.summary(),
          api.analytics.volume(),
          api.analytics.byProduct(),
          api.analytics.sentiment(),
        ]);

        setData({ summary, volume, by_product: byProduct, sentiment });
      } catch (err) {
        setError(err.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
      <SidebarNav items={MANAGER_NAV} />
      <div className="ml-[220px] flex-1 flex items-center justify-center">
        <LoadingSpinner label="Loading analytics…" />
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
      <SidebarNav items={MANAGER_NAV} />
      <div className="ml-[220px] flex-1 flex items-center justify-center flex-col gap-3">
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      </div>
    </div>
  );

  const { summary, volume, by_product, sentiment } = data;

  // Map by_product to { product, count } shape for donut chart
  const productData = (by_product || []).map(p => ({ product: p.product, count: p.count }));

  // Map sentiment to { product, frustrated, neutral, satisfied } for bar chart
  const sentimentData = (sentiment || []).map(s => ({
    product: s.product,
    frustrated: s.frustrated,
    neutral: s.neutral,
    satisfied: s.satisfied,
  }));

  // Derive top_types from by_product if a separate endpoint is not available
  const top_types = (by_product || [])
    .slice(0, 5)
    .map(p => ({ type: p.product, count: p.count }));

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
      <SidebarNav items={MANAGER_NAV} />

      <div className="ml-[220px] flex-1 p-6 sm:p-7 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Overview Dashboard</h2>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5 mb-6">
          <StatCard label="Total Open" value={summary.open} color="#00B4A6" sub="Complaints" />
          <StatCard label="SLA Breach Rate" value={`${summary.breach_rate}%`} color={summary.breach_rate > 5 ? '#DC2626' : '#16A34A'}
            sub="This month" tooltip="RBI IOS threshold — regulatory penalties above 5%" />
          <StatCard label="Avg Resolution" value={`${summary.avg_resolution}d`} color="#0A1628"
            sub="↓ 0.3d vs last month" subColor="#16A34A" />
          <StatCard label="AI Automation" value={`${summary.ai_automation}%`} color="#7C3AED"
            sub="No-edit approvals" tooltip="Industry benchmark: NatWest Cora+ achieved 49% no-edit rate at 11.2M conversations (H1 2025)" />
          <StatCard label="CSAT Score" value={`${summary.csat}/5`} color="#F59E0B" sub="Last 30 days" />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-md">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Daily Complaint Volume (Last 30 Days)</h4>
            <VolumeLineChart data={volume} />
          </div>
          <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-md">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Complaints by Product Category</h4>
            <ProductDonutChart data={productData} />
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-md">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Sentiment by Product Category</h4>
            <SentimentBarChart data={sentimentData} />
          </div>
          <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-md">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-4">Top 5 Complaint Types by Volume</h4>
            <TopTypesChart data={top_types} />
          </div>
        </div>

        {/* SLA performance table */}
        <div className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white m-0">SLA Performance by Tier</h4>
          </div>
          <SLATable />
        </div>
      </div>
    </div>
  );
}
