import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import SidebarNav from '../../components/agent/SidebarNav';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { slaCountdown } from '../../utils';
import { STATUS_LABELS } from '../../constants';
import api from '../../services/api';

const AGENT_NAV = [
    { path: '/agent/queue', icon: '📋', label: 'My Queue' },
    { path: '/agent/all', icon: '📂', label: 'All Complaints' },
    { path: '/agent/escalations', icon: '🚨', label: 'Escalations' },
    { path: '/agent/performance', icon: '📈', label: 'My Performance' },
];

function isOpenStatus(status) {
    return status !== 'Resolved' && status !== 'Closed';
}

function severityFromEscalation(c) {
    if (c.escalation_threat_detected) return { label: 'Regulatory', color: '#DC2626', bg: '#FEE2E2' };
    if ((c.sla_breach_probability || 0) >= 0.7) return { label: 'High SLA Risk', color: '#B45309', bg: '#FEF3C7' };
    return { label: 'Monitor', color: '#0F766E', bg: '#CCFBF1' };
}

export default function Escalations() {
    const { user, token } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const all = await api.complaints.list({ agent_id: 'me' });
                setComplaints(Array.isArray(all) ? all : []);
            } catch (err) {
                toast.error(err.message || t('Failed to load escalations.'));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [token]);

    const escalations = useMemo(() => {
        const mine = complaints.filter(c => !user?.id || !c.assigned_agent_id || Number(c.assigned_agent_id) === Number(user.id));
        return mine
            .filter(c => isOpenStatus(c.status))
            .filter(c => c.escalation_threat_detected || (c.sla_breach_probability || 0) >= 0.6)
            .sort((a, b) => new Date(a.sla_deadline || 0) - new Date(b.sla_deadline || 0));
    }, [complaints, user]);

    if (loading) {
        return (
            <div className="flex min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
                <SidebarNav items={AGENT_NAV} />
                <div className="ml-[220px] flex-1 flex items-center justify-center">
                    <LoadingSpinner label={t('Loading escalations...')} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
            <SidebarNav items={AGENT_NAV} />

            <div className="ml-[220px] flex-1 p-6 sm:p-7 overflow-y-auto">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('Escalations')}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                    {t('Complaints with regulatory-risk language or high SLA breach probability.')}
                </p>

                <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-[13px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900">
                                {['Reference', 'Severity', 'Status', 'SLA Remaining', 'Risk', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">{t(h)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {escalations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                                        {t('No escalations at the moment.')}
                                    </td>
                                </tr>
                            )}
                            {escalations.map(c => {
                                const sev = severityFromEscalation(c);
                                const t = slaCountdown(c.sla_deadline);
                                const riskPct = Math.round((c.sla_breach_probability || 0) * 100);
                                return (
                                    <tr key={c.id} className="border-t border-slate-100 dark:border-slate-800">
                                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">{c.reference_number}</td>
                                        <td className="px-4 py-3">
                                            <span style={{ background: sev.bg, color: sev.color, borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                                                {sev.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{STATUS_LABELS[c.status] || c.status}</td>
                                        <td className="px-4 py-3 font-semibold" style={{ color: t.color }}>{t.label}</td>
                                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{riskPct}%</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => navigate(`/agent/complaint/${c.id || c.reference_number}`)}
                                                className="rounded-md px-3 py-1.5 text-xs font-semibold bg-[#00B4A6] text-white hover:bg-[#009E90] transition-colors"
                                            >
                                                {t('Open')}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
