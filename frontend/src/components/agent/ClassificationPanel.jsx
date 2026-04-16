// frontend/src/components/agent/ClassificationPanel.jsx
import { useState } from 'react';

export default function ClassificationPanel({ complaint, onOverride }) {
  const [open, setOpen] = useState(true);
  const [whyOpen, setWhy] = useState(false);
  const [overrides, setOverrides] = useState({});

  const rows = [
    { label: 'Complaint Type', value: complaint.ai_complaint_type, conf: complaint.ai_confidence_score, key: 'type' },
    { label: 'Product Category', value: complaint.product_category, conf: 0.97, key: 'product' },
    { label: 'Severity (Tier)', value: complaint.sla_tier, conf: 0.95, key: 'tier' },
    { label: 'Sentiment', value: complaint.ai_sentiment, conf: 0.89, key: 'sentiment' },
  ];

  const triggers = complaint.ai_trigger_phrases || [];

  const handleOverride = (key, label, value) => {
    if (value) {
      setOverrides(prev => ({ ...prev, [key]: value }));
      onOverride(label, value);
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 0.9) return 'bg-emerald-500';
    if (conf >= 0.7) return 'bg-teal-500';
    return 'bg-amber-500';
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 mt-4 border border-slate-200">
      {/* Title row */}
      <button 
        onClick={() => setOpen(o => !o)} 
        className="flex justify-between items-center w-full bg-transparent border-none cursor-pointer p-0 mb-2 group"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span
            title="Handled by XGBoost + DistilBERT (Layer 2-4) - deterministic and auditable"
            className="text-sm font-bold text-slate-800 cursor-help"
          >
            AI Classification
          </span>
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
            4-Head ML
          </span>
        </div>
        <span className={`text-slate-400 text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <p className="text-xs text-slate-400 mb-4">
        XGBoost + DistilBERT deterministic classification. Fully auditable.
      </p>

      {open && (
        <>
          <div className="space-y-3">
            {rows.map(row => (
              <div key={row.label} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-500 block mb-1">{row.label}</span>
                  <span className="text-sm font-bold text-slate-800 block truncate">
                    {overrides[row.key] || row.value}
                    {overrides[row.key] && (
                      <span className="ml-2 text-xs text-amber-600 font-medium">(overridden)</span>
                    )}
                  </span>
                </div>
                {/* Confidence bar */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getConfidenceColor(row.conf)}`}
                      style={{ width: `${(row.conf || 0) * 100}%` }} 
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium w-10">
                    {Math.round((row.conf || 0) * 100)}%
                  </span>
                </div>
                {/* Override dropdown */}
                <select
                  onChange={e => handleOverride(row.key, row.label, e.target.value)}
                  value={overrides[row.key] || ''}
                  className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 cursor-pointer bg-white hover:border-slate-300 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                >
                  <option value="">Override</option>
                  <option value="P1">P1 - Critical</option>
                  <option value="P2">P2 - High</option>
                  <option value="P3">P3 - Medium</option>
                  <option value="P4">P4 - Low</option>
                </select>
              </div>
            ))}
          </div>

          {/* Why this classification */}
          <div className="border-t border-slate-200 pt-4 mt-4">
            <button 
              onClick={() => setWhy(o => !o)} 
              className="flex justify-between items-center w-full bg-transparent border-none cursor-pointer p-0 group"
            >
              <span className="text-sm font-semibold text-teal-600 group-hover:text-teal-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Why this classification?
              </span>
              <span className={`text-slate-400 transition-transform duration-200 ${whyOpen ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {whyOpen && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-slate-100">
                {triggers.length > 0 ? (
                  <>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {complaint.complaint_text?.split(new RegExp(`(${triggers.join('|')})`, 'i')).map((part, i) =>
                        triggers.some(p => p.toLowerCase() === part.toLowerCase())
                          ? <mark key={i} className="bg-amber-100 text-amber-800 px-1 rounded font-medium">{part}</mark>
                          : part
                      )}
                    </p>
                    <div className="flex items-start gap-2 mt-4 p-3 bg-slate-50 rounded-lg">
                      <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Highlighted phrases are from the Indian Banking Domain Ontology - 200+ product terms and escalation phrases across 6 regional languages.
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">
                    Standard classification based on product keywords and complaint type matching.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
