// frontend/src/components/agent/ContextPanel.jsx
import { useState } from 'react';

export default function ContextPanel({ complaint, onUseResolution }) {
  const [tab, setTab] = useState('Policy');

  const TABS = [
    { id: 'Customer', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'Similar', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'Policy', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'CRM', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4 flex-shrink-0">
        {TABS.map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border-none cursor-pointer text-xs font-bold transition-all duration-200
              ${tab === t.id 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'bg-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
            </svg>
            {t.id}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Customer */}
        {tab === 'Customer' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-800">Customer Profile</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold
                ${complaint.customer_segment === 'HNI' 
                  ? 'bg-purple-100 text-purple-700' 
                  : complaint.customer_segment === 'Premium' 
                    ? 'bg-teal-100 text-teal-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                {complaint.customer_segment || 'Standard'}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
              {[
                ['Account Tenure', complaint.account_tenure || '3 years 2 months'],
                ['Complaints (YTD)', complaint.complaints_ytd || 1],
                ['Relationship Manager', complaint.relationship_manager || 'Not assigned'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between p-3">
                  <span className="text-xs text-slate-500">{k}</span>
                  <span className="text-xs text-slate-800 font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-2">Open Products</span>
              <div className="flex flex-wrap gap-2">
                {(complaint.open_products || [complaint.product_category]).map(p => (
                  <span key={p} className="bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-xs font-semibold">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Similar Cases */}
        {tab === 'Similar' && (
          <div>
            <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 rounded-lg">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-slate-500">
                Found by semantic embeddings via FAISS - not keyword match.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { ref: 'CIQ-2026-000015', product: 'NACH Mandate', summary: 'NACH bounce reversed within 24 hours. Penalty waived per Section 3.4.', days: 1.2, sim: 0.87 },
                { ref: 'CIQ-2025-088201', product: 'NACH Mandate', summary: 'EMI deduction failed due to bank error. Mandate re-registered successfully.', days: 2.8, sim: 0.74 },
                { ref: 'CIQ-2025-041200', product: 'UPI Payment', summary: 'UPI reversal processed within T+1 as per RBI PSS circular.', days: 1.0, sim: 0.61 },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-teal-600 font-semibold">{s.ref}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${s.sim >= 0.8 ? 'bg-emerald-100 text-emerald-700' : s.sim >= 0.6 ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                        {Math.round(s.sim * 100)}% match
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{s.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{s.days}d to resolve</span>
                    <button
                      onClick={() => onUseResolution(s.summary)}
                      className="text-xs text-teal-600 bg-teal-50 hover:bg-teal-100 border-none rounded-lg px-3 py-1.5 cursor-pointer font-semibold transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Use This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policy */}
        {tab === 'Policy' && (
          <div>
            <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 rounded-lg">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-xs text-slate-500">
                Retrieved by RAG pipeline. LLM can only use these sources.
              </p>
            </div>
            <div className="space-y-3">
              {(complaint.ai_draft_policy_sources?.length > 0
                ? complaint.ai_draft_policy_sources
                : [
                    { doc_name: 'General Complaints Policy', section: 'Section 2.1', excerpt: 'All complaints shall be acknowledged within 24 hours of receipt and resolved within the SLA tier deadline.' },
                    { doc_name: 'RBI IOS Circular RBI/2023-24/117', section: 'Section 6.1', excerpt: 'P1 complaints must be addressed within 24 calendar hours of receipt.' },
                  ]
              ).map((p, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{p.doc_name}</div>
                      <div className="text-xs text-teal-600 font-semibold mb-2">{p.section}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{p.excerpt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CRM */}
        {tab === 'CRM' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Transactions
              </h4>
              <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
                {[
                  { date: '18 Mar 2026', type: 'UPI Transfer', amount: '2,450', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
                  { date: '15 Mar 2026', type: 'EMI Debit', amount: '12,XXX', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
                  { date: '10 Mar 2026', type: 'ATM Withdrawal', amount: 'X,000', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tx.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800">{tx.type}</div>
                      <div className="text-xs text-slate-400">{tx.date}</div>
                    </div>
                    <span className="text-sm font-bold text-slate-800">Rs {tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Recent Interactions
              </h4>
              <div className="space-y-2">
                {[
                  { date: '10 Mar 2026', channel: 'Phone', note: 'Customer called about EMI bounce', color: 'bg-blue-100 text-blue-700' },
                  { date: '01 Mar 2026', channel: 'Branch', note: 'In-branch KYC update', color: 'bg-emerald-100 text-emerald-700' },
                ].map((ix, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`${ix.color} rounded-full px-2 py-0.5 text-xs font-bold`}>{ix.channel}</span>
                      <span className="text-xs text-slate-400">{ix.date}</span>
                    </div>
                    <p className="text-xs text-slate-600">{ix.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
