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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarNav items={MANAGER_NAV} />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner label="Loading analytics…" />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarNav items={MANAGER_NAV} />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <p style={{ color: '#991B1B', fontSize: 14 }}>{error}</p>
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'DM Sans', sans-serif" }}>
      <SidebarNav items={MANAGER_NAV} />

      <div style={{ marginLeft: 220, flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0A1628', marginBottom: 20 }}>Overview Dashboard</h2>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 16 }}>Daily Complaint Volume (Last 30 Days)</h4>
            <VolumeLineChart data={volume} />
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 16 }}>Complaints by Product Category</h4>
            <ProductDonutChart data={productData} />
          </div>
        </div>

        {/* Charts row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 16 }}>Sentiment by Product Category</h4>
            <SentimentBarChart data={sentimentData} />
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 16 }}>Top 5 Complaint Types by Volume</h4>
            <TopTypesChart data={top_types} />
          </div>
        </div>

        {/* SLA performance table */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', margin: 0 }}>SLA Performance by Tier</h4>
          </div>
          <SLATable />
        </div>
      </div>
    </div>
  );
}
