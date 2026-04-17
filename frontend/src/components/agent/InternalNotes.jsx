// frontend/src/components/agent/InternalNotes.jsx
import { useState } from 'react';
import { fmtDateTime } from '../../utils';
import { useTheme } from '../../context/ThemeContext';

export default function InternalNotes({ initialNotes = [] }) {
  const { isDark } = useTheme();
  const [notes, setNotes] = useState(initialNotes);
  const [text, setText] = useState('');

  function addNote() {
    if (!text.trim()) return;
    setNotes(n => [...n, { at: new Date().toISOString(), author: 'Agent', text: text.trim() }]);
    setText('');
  }

  return (
    <div style={{ background: isDark ? '#0F172A' : '#fff', borderRadius: 14, padding: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: isDark ? '1px solid #1F2937' : '1px solid transparent' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h4 style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#CBD5E1' : '#374151', margin: 0 }}>Internal Notes</h4>
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>Visible to team only — not sent to customer</span>
      </div>

      {notes.map((n, i) => (
        <div key={i} style={{ background: isDark ? '#111827' : '#F8F9FA', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{n.author} · {fmtDateTime(n.at)}</div>
          <div style={{ fontSize: 12, color: isDark ? '#E2E8F0' : '#374151', marginTop: 2 }}>{n.text}</div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNote()}
          placeholder="Add a note…"
          style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: isDark ? '1.5px solid #334155' : '1.5px solid #E5E7EB', fontSize: 12, outline: 'none', background: isDark ? '#0B1220' : '#fff', color: isDark ? '#E2E8F0' : '#0F172A' }}
        />
        <button onClick={addNote} style={{ background: '#0A1628', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          Add
        </button>
      </div>
    </div>
  );
}
