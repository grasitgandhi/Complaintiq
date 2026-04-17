// frontend/src/pages/customer/TrackComplaint.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatusStepper from '../../components/customer/StatusStepper';
import SLACountdown from '../../components/customer/SLACountdown';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { SLA_TIERS, STATUS_LABELS } from '../../constants';
import { fmtDate, breachRiskLabel } from '../../utils';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export default function TrackComplaint() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.complaints.list();
        setComplaints(data);
      } catch (err) {
        setError(err.message || 'Failed to load complaints.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [token]);

  const shown = search
    ? complaints.filter(c =>
      (c.reference_number || '').toLowerCase().includes(search.toLowerCase())
    )
    : complaints;

  if (loading) return <LoadingSpinner label={t('Loading your complaints…')} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-slate-50 dark:bg-[#010409] min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{t('Track My Complaints')}</h2>
        <p className="text-sm text-slate-700 dark:text-slate-300">{t('Complaints filed under your account · {count} total').replace('{count}', complaints.length)}</p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200 text-sm mb-5">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('Filter by reference number (e.g. CIQ-2026-000001)')}
          className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-white dark:bg-[#161B22] text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
          >
            {t('Clear')}
          </button>
        )}
      </div>

      {/* Empty state */}
      {shown.length === 0 && !search && !error && (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg font-semibold mb-2">{t('No complaints filed yet')}</p>
          <p className="text-sm mb-6">{t('Use the button below to file your first complaint.')}</p>
          <button
            onClick={() => navigate('/customer/new')}
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-200"
          >
            {t('File a Complaint')}
          </button>
        </div>
      )}

      {search && shown.length === 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200 text-sm">
          {t('No complaint matching')} <strong>{search}</strong> {t('found in your account.')}
        </div>
      )}

      {/* Complaint cards */}
      <div className="space-y-4">
        {shown.map(c => {
          const tier = SLA_TIERS[c.sla_tier] || SLA_TIERS.P3;
          const risk = breachRiskLabel(c.sla_breach_probability || 0);
          return (
            <div
              key={c.id}
              className="bg-white dark:bg-[#161B22] rounded-lg p-5 shadow-md dark:shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-200"
              style={{ borderLeftWidth: '4px', borderLeftColor: tier.color }}
            >
              {/* Top row */}
              <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                <div>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-4">{c.reference_number}</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="bg-teal-600 text-white rounded-full px-3 py-1 text-xs font-semibold">{c.product_category}</span>
                    <span title="P1=24hr · P2=48hr · P3=5 business days · P4=10 business days (RBI IOS)" style={{ background: tier.bg, color: tier.color }} className="rounded-full px-3 py-1 text-xs font-semibold cursor-help">
                      {c.sla_tier}
                    </span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full px-3 py-1 text-xs font-semibold">{STATUS_LABELS[c.status]}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-600 dark:text-slate-300">Filed {fmtDate(c.filed_at)}</div>
                  <SLACountdown deadline={c.sla_deadline} />
                  {(c.sla_tier === 'P1' || c.sla_tier === 'P2') && (
                    <div className="mt-1">
                      <span style={{ background: risk.bg, color: risk.color }} className="rounded-full px-3 py-1 text-xs font-semibold">
                        Risk: {risk.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status stepper */}
              <StatusStepper status={c.status} />

              {/* Snippet + button */}
              <div className="flex justify-between items-center mt-4 gap-3">
                <p className="text-sm text-slate-700 dark:text-slate-300 m-0 flex-1">
                  {c.complaint_text?.slice(0, 100)}…
                </p>
                <button
                  onClick={() => navigate(`/customer/complaint/${c.id}`)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 ring-1 ring-slate-900/5 dark:ring-slate-200/10 transition-colors duration-200 whitespace-nowrap"
                >
                  {t('View Details →')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
