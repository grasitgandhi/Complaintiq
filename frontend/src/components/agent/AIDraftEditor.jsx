// frontend/src/components/agent/AIDraftEditor.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../constants';

export default function AIDraftEditor({ complaint, draft, setDraft, onDraftChange }) {
  const { token } = useAuth();
  const [streaming, setStreaming] = useState(false);
  const [charCount, setCharCount] = useState(draft?.length || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef();

  useEffect(() => { setCharCount(draft?.length || 0); }, [draft]);

  async function regenerate() {
    setStreaming(true);
    setDraft('');
    setSaveSuccess(false);
    let fetched = '';

    try {
      const res = await axios.get(`${API_BASE}/complaints/${complaint.id}/ai-draft`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetched = res.data.draft_text;
    } catch (_) {
      // Mock streaming for demo
      fetched = complaint.ai_draft_response ||
        `Dear Customer,\n\nThank you for bringing this to our attention. We have reviewed your ${complaint.product_category} complaint and are taking immediate action as per our internal policy.\n\nYour complaint reference ${complaint.reference_number} has been escalated to our specialist team. We will resolve this within the stipulated RBI IOS SLA timeline.\n\nFor updates, please contact us at 1800-1234 (toll-free).\n\nYours sincerely,\nComplaintIQ Resolution Team`;
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

  async function handleSaveDraft() {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }

  function handleCopy() {
    if (draft) {
      navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Highlight policy citations ([Doc Name, Section X.X]) in teal
  function renderHighlighted(text) {
    if (!text) return null;
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((p, i) =>
      /^\[.+\]$/.test(p)
        ? <mark key={i} title={`Source: ${p.slice(1, -1)}`} className="bg-teal-100 text-teal-700 px-1 rounded cursor-help font-medium">{p}</mark>
        : p
    );
  }

  return (
    <div className="space-y-4">
      {/* Streaming state: animated typing dots */}
      {streaming ? (
        <div className="min-h-[200px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-200">
          <div className="whitespace-pre-wrap">
            {draft && renderHighlighted(draft)}
            <span className="inline-block w-0.5 h-4 bg-teal-500 ml-0.5 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => { setDraft(e.target.value); setCharCount(e.target.value.length); onDraftChange?.(); }}
            rows={10}
            placeholder="AI-generated draft will appear here..."
            className="w-full p-4 rounded-xl border-2 border-slate-200 text-sm resize-y leading-relaxed focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 bg-white"
          />
          {saveSuccess && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </div>
          )}
        </div>
      )}

      {/* Char counter */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">
          {charCount > 500 ? (
            <span className="text-amber-500 font-medium">Consider shorter response ({charCount} chars)</span>
          ) : (
            `${charCount} characters`
          )}
        </span>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          AI powered by GPT-4
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        <button 
          onClick={regenerate} 
          disabled={streaming} 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
            ${streaming 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]'
            }`}
        >
          <svg className={`w-4 h-4 ${streaming ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {streaming ? 'Generating...' : 'Regenerate'}
        </button>
        
        <button 
          onClick={handleSaveDraft}
          disabled={isSaving || !draft}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200
            ${isSaving || !draft
              ? 'border-slate-200 text-slate-400 cursor-not-allowed'
              : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]'
            }`}
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </>
          )}
        </button>

        <button 
          onClick={handleCopy}
          disabled={!draft}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ml-auto
            ${!draft 
              ? 'text-slate-300 cursor-not-allowed' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
