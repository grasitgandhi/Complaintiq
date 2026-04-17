import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import SidebarNav from '../../components/agent/SidebarNav';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import api from '../../services/api';

const AGENT_NAV = [
    { path: '/agent/queue', icon: '📋', label: 'My Queue' },
    { path: '/agent/all', icon: '📂', label: 'All Complaints' },
    { path: '/agent/escalations', icon: '🚨', label: 'Escalations' },
    { path: '/agent/performance', icon: '📈', label: 'My Performance' },
];

function MiniBar({ value, max, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 120, height: 8, borderRadius: 4, background: '#E5E7EB', overflow: 'hidden' }}>
                <div style={{ width: `${(value / Math.max(1, max)) * 100}%`, height: '100%', borderRadius: 4, background: color }} />
            </div>
            <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>{value}</span>
        </div>
    );
}

export default function MyPerformance() {
    const { user, token } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [row, setRow] = useState(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const data = await api.analytics.agentPerformance();
                const mine = (Array.isArray(data) ? data : []).find(r => Number(r.id) === Number(user?.id));
                setRow(mine || null);
            } catch (err) {
                toast.error(err.message || t('Failed to load performance.'));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [token, user]);

    const sentimentMax = useMemo(() => {
        if (!row?.sentiment) return 1;
        return Math.max(1, row.sentiment.frustrated, row.sentiment.neutral, row.sentiment.satisfied);
    }, [row]);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
                <SidebarNav items={AGENT_NAV} />
                <div className="ml-[220px] flex-1 flex items-center justify-center">
                    <LoadingSpinner label={t('Loading performance...')} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
            <SidebarNav items={AGENT_NAV} />

            <div className="ml-[220px] flex-1 p-6 sm:p-7 overflow-y-auto">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('My Performance')}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">{t('Live performance metrics for your assigned complaint work.')}</p>

                {!row && (
                    <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-sm text-slate-600 dark:text-slate-300">
                        {t('No performance data yet for this account.')}
                    </div>
                )}

                {row && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5 mb-6">
                            <Stat label={t('Assigned')} value={row.assigned} color="#0F172A" />
                            <Stat label={t('Resolved')} value={row.resolved} color="#16A34A" />
                            <Stat label={t('Avg Handle')} value={`${row.avg_handle_days}d`} color="#0369A1" />
                            <Stat label="CSAT" value={`${row.csat.toFixed(1)}★`} color="#D97706" />
                            <Stat label="SLA" value={`${row.sla_pct.toFixed(1)}%`} color="#7C3AED" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t('Complaints by Product')}</h4>
                                {row.by_product.length === 0 && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('No product data available.')}</p>
                                )}
                                {row.by_product.map((p) => (
                                    <div key={p.product} className="flex items-center justify-between gap-3 mb-3">
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{p.product}</span>
                                        <MiniBar value={p.count} max={Math.max(1, ...row.by_product.map(x => x.count))} color="#00B4A6" />
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{t('Customer Sentiment Breakdown')}</h4>
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{t('Frustrated')}</span>
                                    <MiniBar value={row.sentiment.frustrated} max={sentimentMax} color="#DC2626" />
                                </div>
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{t('Neutral')}</span>
                                    <MiniBar value={row.sentiment.neutral} max={sentimentMax} color="#64748B" />
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{t('Satisfied')}</span>
                                    <MiniBar value={row.sentiment.satisfied} max={sentimentMax} color="#16A34A" />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function Stat({ label, value, color }) {
    return (
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">{label}</div>
            <div style={{ color }} className="text-2xl font-extrabold">{value}</div>
        </div>
    );
}
