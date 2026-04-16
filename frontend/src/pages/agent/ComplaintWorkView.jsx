// frontend/src/pages/agent/ComplaintWorkView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
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
  { path: '/agent/queue',       label: 'My Queue' },
  { path: '/agent/all',         label: 'All Complaints' },
  { path: '/agent/escalations', label: 'Escalations', badge: 2 },
  { path: '/agent/performance', label: 'My Performance' },
];

export default function ComplaintWorkView() {
  const { id }    = useParams();
  const { token, user } = useAuth();
  const navigate  = useNavigate();

  const [c, setC]             = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [draft, setDraft]     = useState('');
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
      toast.success('Response sent successfully');
      setTimeout(() => navigate('/agent/queue'), 1200);
    } catch (err) {
      toast.error(err.message || 'Failed to send response. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleOverride(label, value) {
    toast(`Classification overridden: ${label} -> ${value}`, { icon: '✏️' });
  }

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      <SidebarNav items={AGENT_NAV} />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner label="Loading complaint..." />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      <SidebarNav items={AGENT_NAV} />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#FEF2F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p style={{ color: '#991B1B', fontSize: 15, fontWeight: 500 }}>{error}</p>
        <button
          onClick={() => navigate('/agent/queue')}
          style={{
            background: '#00C6B5',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 24px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Queue
        </button>
      </div>
    </div>
  );

  const tier = SLA_TIERS[c.sla_tier] || SLA_TIERS.P3;
  const t    = slaCountdown(c.sla_deadline);
  const isUrgent = c.sla_tier === 'P1' || c.sla_tier === 'P2';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
      <SidebarNav items={AGENT_NAV} />

      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{
          background: '#fff',
          borderBottom: '1px solid #E2E8F0',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          flexShrink: 0,
        }}>
          <button
            onClick={() => navigate('/agent/queue')}
            style={{
              background: 'none',
              border: 'none',
              color: '#00C6B5',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Queue
          </button>
          
          <div style={{ width: 1, height: 20, background: '#E2E8F0' }} />
          
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontWeight: 700,
            fontSize: 16,
            color: '#0B1629',
          }}>
            {c.reference_number}
          </span>
          
          <span style={{
            background: tier.bg,
            color: tier.color,
            borderRadius: 8,
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 700,
          }}>
            {c.sla_tier}
          </span>
          
          <span style={{
            background: 'linear-gradient(135deg, #00C6B5, #009E90)',
            color: '#fff',
            borderRadius: 8,
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 600,
          }}>
            {c.product_category}
          </span>
          
          {c.escalation_threat_detected && (
            <span style={{
              background: '#FEE2E2',
              color: '#DC2626',
              borderRadius: 8,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              </svg>
              ESCALATION RISK
            </span>
          )}
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ color: t.color, fontWeight: 700, fontSize: 14 }}>{t.label}</span>
          </div>
        </div>

        {/* 3-column body */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '28% 44% 28%', gap: 0 }}>

          {/* LEFT: Complaint Info */}
          <div style={{ overflowY: 'auto', padding: '20px 18px', borderRight: '1px solid #E2E8F0', background: '#fff' }}>
            <div style={{
              background: '#F8FAFC',
              borderRadius: 14,
              padding: 18,
              marginBottom: 16,
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0B1629', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C6B5" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                Complaint Details
              </h4>
              {[
                ['Reference', c.reference_number],
                ['Customer', c.customer_name],
                ['Account', c.customer_account],
                ['Mobile', c.customer_mobile],
                ['Filed', fmtDateTime(c.filed_at)],
                ['SLA Deadline', fmtDateTime(c.sla_deadline)],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #E2E8F0',
                  fontSize: 13,
                }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>{k}</span>
                  <span style={{
                    color: '#0B1629',
                    fontFamily: k === 'Reference' ? "'DM Mono', monospace" : 'inherit',
                    fontWeight: k === 'Reference' ? 600 : 400,
                  }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              background: '#F8FAFC',
              borderRadius: 14,
              padding: 18,
              marginBottom: 16,
            }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0B1629', marginBottom: 10 }}>Original Complaint</h4>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>{c.complaint_text}</p>
            </div>

            {c.prev_complaints?.length > 0 && (
              <div style={{
                background: '#F8FAFC',
                borderRadius: 14,
                padding: 18,
                marginBottom: 16,
              }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0B1629', marginBottom: 10 }}>Previous Complaints</h4>
                {c.prev_complaints.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    padding: '8px 0',
                    borderBottom: '1px solid #E2E8F0',
                  }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", color: '#00C6B5', fontSize: 11 }}>{p.reference}</span>
                    <span style={{
                      color: p.status === 'Resolved' ? '#16A34A' : '#F59E0B',
                      fontWeight: 600,
                      fontSize: 11,
                    }}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <InternalNotes initialNotes={[{ at: c.filed_at, author: 'System', text: 'Complaint received and classified by AI pipeline.' }]} />
          </div>

          {/* CENTRE: AI Draft */}
          <div style={{ overflowY: 'auto', padding: '20px 18px', borderRight: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0B1629', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C6B5" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                <path d="M20 12a8 8 0 0 0-8-8v8h8z"/>
              </svg>
              AI-Generated Draft Response
            </h3>
            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 6px' }}>
              Grounded in: {c.ai_draft_policy_sources?.[0]?.doc_name || 'Bank Policy Documents'} &middot; Model: Llama 3.2 3B
            </p>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: '0 0 16px', lineHeight: 1.6 }}>
              The LLM was constrained to only use information from retrieved bank policy documents. (Layer 6 RAG)
            </p>

            {c.compliance_flagged && (
              <div style={{
                background: '#FFFBEB',
                border: '1px solid #FCD34D',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <p style={{ fontSize: 13, color: '#92400E', fontWeight: 600, margin: '0 0 4px' }}>
                    Compliance check flagged: {c.compliance_flag_reason}
                  </p>
                  <p style={{ fontSize: 12, color: '#B45309', margin: 0 }}>
                    Checked by DistilBERT compliance classifier (Layer 7)
                  </p>
                </div>
              </div>
            )}

            {c.is_duplicate && (
              <div style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 13, color: '#1E40AF', fontWeight: 600, margin: '0 0 8px' }}>Possible Duplicate Detected</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#475569' }}>Similarity:</span>
                  <div style={{ flex: 1, maxWidth: 100, height: 6, borderRadius: 3, background: '#DBEAFE', overflow: 'hidden' }}>
                    <div style={{ width: `${(c.duplicate_similarity_score || 0.87) * 100}%`, height: '100%', background: '#3B82F6', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>{Math.round((c.duplicate_similarity_score || 0.87) * 100)}%</span>
                </div>
                <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>FAISS cosine similarity on all-MiniLM-L6-v2 embeddings (Layer 3)</p>
              </div>
            )}

            <AIDraftEditor
              complaint={c}
              draft={draft}
              setDraft={setDraft}
              onDraftChange={() => {}}
            />

            <ClassificationPanel complaint={c} onOverride={handleOverride} />
          </div>

          {/* RIGHT: Context Panel */}
          <div style={{ overflowY: 'auto', padding: '20px 18px', background: '#fff' }}>
            <ContextPanel complaint={c} onUseResolution={text => setDraft(prev => text + '\n\n' + prev)} />
          </div>
        </div>

        {/* Fixed bottom action bar */}
        <div style={{
          background: '#fff',
          borderTop: '1px solid #E2E8F0',
          padding: '16px 24px',
          display: 'flex',
          gap: 12,
          flexShrink: 0,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setModal(true)}
            style={{
              background: '#00C6B5',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            Approve and Send
          </button>
          
          <button
            onClick={() => toast('Escalated to manager', { icon: '📤' })}
            style={{
              background: '#fff',
              border: '2px solid #F59E0B',
              color: '#D97706',
              borderRadius: 10,
              padding: '10px 18px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Escalate to Manager
          </button>
          
          <button
            onClick={() => toast('Marked as duplicate', { icon: '🔁' })}
            style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              borderRadius: 10,
              padding: '10px 18px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Close as Duplicate
          </button>
          
          <button
            onClick={() => toast('Info request sent to customer', { icon: '💬' })}
            style={{
              background: '#fff',
              border: '2px solid #3B82F6',
              color: '#2563EB',
              borderRadius: 10,
              padding: '10px 18px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
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
