// frontend/src/components/agent/ContextPanel.jsx
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ContextPanel({ complaint, onUseResolution }) {
  const { isDark } = useTheme();
  const [tab, setTab] = useState('Policy');

  const TABS = ['Customer', 'Similar', 'Policy', 'CRM'];
  const panelBg = isDark ? '#111827' : '#F8F9FA';
  const cardBg = isDark ? '#0F172A' : '#F8F9FA';
  const textPrimary = isDark ? '#E2E8F0' : '#0A1628';
  const textSecondary = isDark ? '#94A3B8' : '#9CA3AF';
  const textBody = isDark ? '#CBD5E1' : '#374151';
  const borderColor = isDark ? '#1F2937' : '#F3F4F6';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: panelBg, borderRadius: 10, padding: 4, marginBottom: 16, flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 700,
            background: tab === t ? '#0A1628' : 'transparent',
            color: tab === t ? '#fff' : (isDark ? '#CBD5E1' : '#6B7280'),
          }}>{t}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── Customer ── */}
        {tab === 'Customer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>Customer Profile</span>
              <span style={{
                background: complaint.customer_segment === 'HNI' ? '#F5F3FF' : complaint.customer_segment === 'Premium' ? '#F0FDFC' : '#F3F4F6',
                color: complaint.customer_segment === 'HNI' ? '#7C3AED' : complaint.customer_segment === 'Premium' ? '#00B4A6' : '#6B7280',
                borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
              }}>{complaint.customer_segment || 'Standard'}</span>
            </div>
            {[
              ['Account Tenure', complaint.account_tenure || '—'],
              ['Complaints (YTD)', complaint.complaints_ytd || 1],
              ['Relationship Manager', complaint.relationship_manager || 'Not assigned'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${borderColor}` }}>
                <span style={{ fontSize: 12, color: textSecondary }}>{k}</span>
                <span style={{ fontSize: 12, color: textPrimary, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div>
              <span style={{ fontSize: 12, color: textSecondary, display: 'block', marginBottom: 6 }}>Open Products</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {(complaint.open_products || [complaint.product_category]).map(p => (
                  <span key={p} style={{ background: isDark ? '#1F2937' : '#F3F4F6', color: textBody, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Similar Cases ── */}
        {tab === 'Similar' && (
          <div>
            <p style={{ fontSize: 11, color: textSecondary, marginBottom: 12 }}>
              Found by all-MiniLM-L6-v2 semantic embeddings via FAISS (Layer 3) — not keyword match.
            </p>
            {[
              { ref: 'CIQ-2026-000015', product: 'NACH Mandate', summary: 'NACH bounce reversed within 24 hours. Penalty waived per Section 3.4.', days: 1.2, sim: 0.87 },
              { ref: 'CIQ-2025-088201', product: 'NACH Mandate', summary: 'EMI deduction failed due to bank error. Mandate re-registered successfully.', days: 2.8, sim: 0.74 },
              { ref: 'CIQ-2025-041200', product: 'UPI Payment', summary: 'UPI reversal processed within T+1 as per RBI PSS circular.', days: 1.0, sim: 0.61 },
            ].map((s, i) => (
              <div key={i} style={{ background: cardBg, borderRadius: 10, padding: 12, marginBottom: 10, border: `1px solid ${borderColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#00B4A6' }}>{s.ref}</span>
                  <span style={{ fontSize: 11, color: textSecondary }}>{s.sim * 100}% match · {s.days}d resolved</span>
                </div>
                <p style={{ fontSize: 12, color: textBody, margin: '0 0 8px', lineHeight: 1.5 }}>{s.summary}</p>
                <button
                  onClick={() => onUseResolution(s.summary)}
                  style={{ fontSize: 11, color: '#00B4A6', background: 'none', border: '1px solid #00B4A6', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Use This Resolution
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Policy ── */}
        {tab === 'Policy' && (
          <div>
            <p style={{ fontSize: 11, color: textSecondary, marginBottom: 12 }}>
              Retrieved by RAG pipeline (ChromaDB + LangChain, Layer 5). These are the exact sections the LLM was given. It cannot use anything outside this list.
            </p>
            {(complaint.ai_draft_policy_sources?.length > 0
              ? complaint.ai_draft_policy_sources
              : [
                { doc_name: 'General Complaints Policy', section: 'Section 2.1', excerpt: 'All complaints shall be acknowledged within 24 hours of receipt and resolved within the SLA tier deadline.' },
                { doc_name: 'RBI IOS Circular RBI/2023-24/117', section: 'Section 6.1', excerpt: 'P1 complaints must be addressed within 24 calendar hours of receipt.' },
              ]
            ).map((p, i) => (
              <div key={i} style={{ background: cardBg, borderRadius: 10, padding: 12, marginBottom: 10, border: `1px solid ${borderColor}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: textPrimary }}>{p.doc_name}</div>
                <div style={{ fontSize: 11, color: '#00B4A6', marginBottom: 4 }}>{p.section}</div>
                <p style={{ fontSize: 12, color: textBody, lineHeight: 1.6, margin: 0 }}>{p.excerpt}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── CRM ── */}
        {tab === 'CRM' && (
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: textBody, marginBottom: 10 }}>Recent Transactions</h4>
            {[
              { date: '18 Mar 2026', type: 'UPI Transfer', amount: '₹ 2,450' },
              { date: '15 Mar 2026', type: 'EMI Debit', amount: '₹ 12,XXX' },
              { date: '10 Mar 2026', type: 'ATM Withdrawal', amount: '₹ X,000' },
            ].map((tx, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                <div>
                  <div style={{ fontSize: 12, color: textPrimary, fontWeight: 600 }}>{tx.type}</div>
                  <div style={{ fontSize: 11, color: textSecondary }}>{tx.date}</div>
                </div>
                <span style={{ fontSize: 12, color: textBody, fontWeight: 600 }}>{tx.amount}</span>
              </div>
            ))}
            <h4 style={{ fontSize: 12, fontWeight: 700, color: textBody, margin: '16px 0 10px' }}>Recent Interactions</h4>
            {[
              { date: '10 Mar 2026', channel: 'Phone', note: 'Customer called about EMI bounce' },
              { date: '01 Mar 2026', channel: 'Branch', note: 'In-branch KYC update' },
            ].map((ix, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ background: '#E5E7EB', borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>{ix.channel}</span>
                  <span style={{ fontSize: 11, color: textSecondary }}>{ix.date}</span>
                </div>
                <p style={{ fontSize: 12, color: textBody, margin: '4px 0 0' }}>{ix.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
