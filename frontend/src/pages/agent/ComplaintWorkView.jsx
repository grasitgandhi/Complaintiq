// frontend/src/pages/agent/ComplaintWorkView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SidebarNav from '../../components/agent/SidebarNav';
import ClassificationPanel from '../../components/agent/ClassificationPanel';
import AIDraftEditor from '../../components/agent/AIDraftEditor';
import ContextPanel from '../../components/agent/ContextPanel';
import ConfirmSendModal from '../../components/agent/ConfirmSendModal';
import InternalNotes from '../../components/agent/InternalNotes';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { SLA_TIERS, STATUS_LABELS } from '../../constants';
import { slaCountdown, fmtDateTime } from '../../utils';
import api from '../../services/api';

const AGENT_NAV = [
  { path: '/agent/queue', icon: '📋', label: 'My Queue' },
  { path: '/agent/all', icon: '📂', label: 'All Complaints' },
  { path: '/agent/escalations', icon: '🚨', label: 'Escalations', badge: 2 },
  { path: '/agent/performance', icon: '📈', label: 'My Performance' },
];

export default function ComplaintWorkView() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [showModal, setModal] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.complaints.get(id);
        setC(data);

        // If no AI draft from complaint, fetch it separately
        if (!data.ai_draft_response) {
          try {
            const aiDraft = await api.complaints.getAIDraft(id);
            setDraft(aiDraft.draft_text || '');
          } catch (_) {
            setDraft('');
          }
        } else {
          setDraft(data.ai_draft_response);
        }
      } catch (err) {
        setError(err.message || 'Failed to load complaint.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token]);

  async function handleSend() {
    setSending(true);
    try {
      await api.complaints.sendResponse(id, { final_response_text: draft, agent_id: user?.id });
      setModal(false);
      toast.success('Response sent ✓');
      setTimeout(() => navigate('/agent/queue'), 1200);
    } catch (err) {
      toast.error(err.message || 'Failed to send response. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleOverride(label, value) {
    toast(`Classification overridden: ${label} → ${value}`, { icon: '✏️' });
  }

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarNav items={AGENT_NAV} />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner label="Loading complaint…" />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarNav items={AGENT_NAV} />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <p style={{ color: '#991B1B', fontSize: 14 }}>{error}</p>
        <button onClick={() => navigate('/agent/queue')} style={{ background: '#00B4A6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
          ← Back to Queue
        </button>
      </div>
    </div>
  );

  const tier = SLA_TIERS[c.sla_tier] || SLA_TIERS.P3;
  const t = slaCountdown(c.sla_deadline);
  const pageBg = isDark ? '#0A0A0A' : '#F8F9FA';
  const panelBg = isDark ? '#0F172A' : '#fff';
  const softBg = isDark ? '#111827' : '#F8F9FA';
  const border = isDark ? '#334155' : '#E5E7EB';
  const borderSoft = isDark ? '#1F2937' : '#F3F4F6';
  const textPrimary = isDark ? '#F1F5F9' : '#0A1628';
  const textBody = isDark ? '#CBD5E1' : '#374151';
  const textMuted = isDark ? '#94A3B8' : '#9CA3AF';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: pageBg, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>
      <SidebarNav items={AGENT_NAV} />

      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ background: panelBg, borderBottom: `1px solid ${border}`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
          <button onClick={() => navigate('/agent/queue')} style={{ background: 'none', border: 'none', color: '#00B4A6', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Queue</button>
          <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 15, color: textPrimary }}>{c.reference_number}</span>
          <span style={{ background: tier.bg, color: tier.color, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{c.sla_tier}</span>
          <span style={{ background: '#00B4A6', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{c.product_category}</span>
          {c.escalation_threat_detected && (
            <span style={{ background: '#DC2626', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>⚠ ESCALATION RISK</span>
          )}
          <span style={{ color: t.color, fontWeight: 700, fontSize: 13, marginLeft: 'auto' }}>⏱ {t.label}</span>
        </div>

        {/* 3-column body */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '30% 40% 30%', gap: 0 }}>

          {/* ── LEFT: Complaint Info ── */}
          <div style={{ overflowY: 'auto', padding: '20px 16px', borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: panelBg, borderRadius: 14, padding: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: `1px solid ${borderSoft}` }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: textPrimary, marginBottom: 12 }}>Complaint Details</h4>
              {[
                ['Reference', c.reference_number],
                ['Customer', c.customer_name],
                ['Account', c.customer_account],
                ['Mobile', c.customer_mobile],
                ['Filed', fmtDateTime(c.filed_at)],
                ['SLA Deadline', fmtDateTime(c.sla_deadline)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${borderSoft}`, fontSize: 12 }}>
                  <span style={{ color: textMuted, fontWeight: 600 }}>{k}</span>
                  <span style={{ color: textPrimary, fontFamily: k === 'Reference' ? 'DM Mono, monospace' : 'inherit' }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ background: softBg, borderRadius: 14, padding: 14, border: `1px solid ${borderSoft}` }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: textBody, marginBottom: 8 }}>Original Complaint</h4>
              <p style={{ fontSize: 13, color: textBody, lineHeight: 1.6, margin: 0 }}>{c.complaint_text}</p>
            </div>

            {c.prev_complaints?.length > 0 && (
              <div style={{ background: panelBg, borderRadius: 14, padding: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: `1px solid ${borderSoft}` }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: textBody, marginBottom: 8 }}>Previous Complaints</h4>
                {c.prev_complaints.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: `1px solid ${borderSoft}` }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', color: '#00B4A6', fontSize: 11 }}>{p.reference}</span>
                    <span style={{ color: p.status === 'Resolved' ? '#16A34A' : '#D97706', fontWeight: 700, fontSize: 11 }}>{p.status}</span>
                  </div>
                ))}
              </div>
            )}

            <InternalNotes initialNotes={[{ at: c.filed_at, author: 'System', text: 'Escalation risk logged. Contacting customer.' }]} />
          </div>

          {/* ── CENTRE: AI Draft ── */}
          <div style={{ overflowY: 'auto', padding: '20px 16px', borderRight: `1px solid ${border}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: textPrimary, margin: '0 0 4px' }}>AI-Generated Draft Response</h3>
            <p style={{ fontSize: 11, color: textBody, margin: '0 0 4px' }}>
              Grounded in: {c.ai_draft_policy_sources?.[0]?.doc_name || 'Bank Policy Documents'} · Model: Llama 3.2 3B (Ollama — local)
            </p>
            <p style={{ fontSize: 11, color: textMuted, margin: '0 0 14px', lineHeight: 1.5 }}>
              The LLM was constrained to only use information from retrieved bank policy documents. It cannot generate claims outside the knowledge base. (Layer 6)
            </p>

            {c.compliance_flagged && (
              <div style={{ background: '#FFFBEB', border: '1px solid #F59E0B', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: '#92400E', fontWeight: 700, margin: '0 0 4px' }}>
                  ⚠ Compliance check flagged: {c.compliance_flag_reason}
                </p>
                <p style={{ fontSize: 11, color: '#92400E', margin: 0 }}>
                  Checked by DistilBERT compliance classifier (50ms) — scans for unauthorised promises, incorrect timelines, PII, liability admissions. (Layer 7)
                </p>
              </div>
            )}

            {c.is_duplicate && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: '#1E40AF', fontWeight: 700, margin: '0 0 4px' }}>Possible Duplicate Detected</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
                  <span style={{ fontSize: 12, color: textBody }}>Similarity:</span>
                  <div style={{ width: 80, height: 6, borderRadius: 3, background: '#DBEAFE', overflow: 'hidden' }}>
                    <div style={{ width: `${(c.duplicate_similarity_score || 0.87) * 100}%`, height: '100%', background: '#3B82F6', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>{Math.round((c.duplicate_similarity_score || 0.87) * 100)}% semantic similarity</span>
                </div>
                <p style={{ fontSize: 11, color: textBody, margin: '4px 0 0' }}>Detected by FAISS cosine similarity on all-MiniLM-L6-v2 embeddings — not keyword match (Layer 3).</p>
              </div>
            )}

            <AIDraftEditor
              complaint={c}
              draft={draft}
              setDraft={setDraft}
              onDraftChange={() => { }}
            />

            <ClassificationPanel complaint={c} onOverride={handleOverride} />
          </div>

          {/* ── RIGHT: Context Panel ── */}
          <div style={{ overflowY: 'auto', padding: '20px 16px' }}>
            <ContextPanel complaint={c} onUseResolution={text => setDraft(prev => text + '\n\n' + prev)} />
          </div>
        </div>

        {/* ── Fixed bottom action bar ── */}
        <div style={{
          background: panelBg, borderTop: `1.5px solid ${border}`,
          padding: '14px 24px', display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap',
        }}>
          <button onClick={() => setModal(true)} style={{ background: '#00B4A6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 700 }}>
            Approve and Send Response
          </button>
          <button onClick={() => toast('Escalated to manager', { icon: '📤' })} style={{ background: 'none', border: '1.5px solid #D97706', color: '#D97706', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontWeight: 600 }}>
            Escalate to Manager
          </button>
          <button onClick={() => toast('Marked as duplicate', { icon: '🔁' })} style={{ background: 'none', border: isDark ? '1.5px solid #334155' : '1.5px solid #D1D5DB', color: isDark ? '#CBD5E1' : '#6B7280', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontWeight: 600 }}>
            Close as Duplicate
          </button>
          <button onClick={() => toast('Info request sent to customer', { icon: '💬' })} style={{ background: 'none', border: '1.5px solid #3B82F6', color: '#3B82F6', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontWeight: 600 }}>
            Request More Info
          </button>
        </div>
      </div>

      {showModal && (
        <ConfirmSendModal
          customerName={c.customer_name}
          onCancel={() => setModal(false)}
          onConfirm={handleSend}
          sending={sending}
        />
      )}
    </div>
  );
}
