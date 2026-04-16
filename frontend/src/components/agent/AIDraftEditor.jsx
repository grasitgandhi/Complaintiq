// frontend/src/components/agent/AIDraftEditor.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../constants';

export default function AIDraftEditor({ complaint, draft, setDraft, onDraftChange }) {
  const { token }      = useAuth();
  const [streaming, setStreaming] = useState(false);
  const [charCount, setCharCount] = useState(draft?.length || 0);
  const textareaRef = useRef();

  useEffect(() => { setCharCount(draft?.length || 0); }, [draft]);

  async function regenerate() {
    setStreaming(true);
    setDraft('');
    let fetched = '';

    try {
      const res = await axios.get(`${API_BASE}/complaints/${complaint.id}/ai-draft`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetched = res.data.draft_text;
    } catch (_) {
      // Mock streaming for demo
      fetched = complaint.ai_draft_response ||
        `Dear Customer, Thank you for bringing this to our attention. We have reviewed your ${complaint.product_category} complaint and are taking immediate action as per our internal policy. Your complaint reference ${complaint.reference_number} has been escalated to our specialist team. We will resolve this within the stipulated RBI IOS SLA timeline. For updates, please contact us at 1800-1234 (toll-free). Yours sincerely, ComplaintIQ Resolution Team.`;
    }

    // Simulate word-by-word streaming at 15ms intervals
    const words = fetched.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      if (i >= words.length) {
        clearInterval(interval);
        setStreaming(false);
        return;
      }
      setDraft(prev => (prev ? prev + ' ' : '') + words[i]);
      i++;
    }, 15);
  }

  // Highlight policy citations ([Doc Name, Section X.X]) in yellow
  function renderHighlighted(text) {
    if (!text) return null;
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((p, i) =>
      /^\[.+\]$/.test(p)
        ? <mark key={i} title={`Source: ${p.slice(1, -1)}`} style={{ background: '#FEF08A', borderRadius: 3, cursor: 'help' }}>{p}</mark>
        : p
    );
  }

  return (
    <div>
      {/* Streaming state: animated typing dots */}
      {streaming ? (
        <div style={{ minHeight: 180, background: '#F8F9FA', borderRadius: 10, padding: '14px', fontSize: 13, color: '#374151', lineHeight: 1.7, border: '1.5px solid #E5E7EB' }}>
          {draft && renderHighlighted(draft)}
          <span style={{ display: 'inline-block', width: 2, height: 14, background: '#00B4A6', marginLeft: 2, animation: 'blink-cursor 0.7s infinite' }} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={e => { setDraft(e.target.value); setCharCount(e.target.value.length); onDraftChange?.(); }}
          rows={10}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 13, resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box' }}
        />
      )}

      {/* Char counter */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{charCount} chars</span>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <button onClick={regenerate} disabled={streaming} style={{
          background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8,
          padding: '7px 14px', cursor: streaming ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600,
        }}>
          ↺ Regenerate Draft
        </button>
        <button style={{ background: 'none', border: '1.5px solid #E5E7EB', color: '#374151', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          Save Draft
        </button>
      </div>
    </div>
  );
}
