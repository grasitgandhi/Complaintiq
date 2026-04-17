// frontend/src/components/customer/FileUploadArea.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 3;

export default function FileUploadArea({ files, setFiles }) {
  const { isDark } = useTheme();
  const [dragOver, setDragOver] = useState(false);

  function addFile(file) {
    if (!ACCEPTED.includes(file.type)) { toast.error('Only PDF, JPG, PNG accepted'); return; }
    if (file.size > MAX_SIZE) { toast.error('Max file size is 5 MB'); return; }
    if (files.length >= MAX_FILES) { toast.error('Max 3 files allowed'); return; }
    setFiles(f => [...f, { name: file.name, size: (file.size / 1024).toFixed(0) + ' KB' }]);
  }

  function removeFile(i) {
    setFiles(f => f.filter((_, j) => j !== i));
  }

  return (
    <div>
      <div
        onClick={() => document.getElementById('ciq-file-input').click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false);[...e.dataTransfer.files].forEach(addFile); }}
        style={{
          border: `2px dashed ${dragOver ? '#00B4A6' : (isDark ? '#334155' : '#D1D5DB')}`,
          borderRadius: 12, padding: '36px 24px', textAlign: 'center', cursor: 'pointer',
          background: dragOver ? (isDark ? 'rgba(0,180,166,0.12)' : '#F0FDFC') : (isDark ? '#0F172A' : '#F8F9FA'), transition: 'all 0.2s',
        }}
      >
        <input id="ciq-file-input" type="file" multiple hidden accept=".pdf,.jpg,.png"
          onChange={e => [...e.target.files].forEach(addFile)} />
        <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
        <p style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#E2E8F0' : '#374151', margin: 0 }}>Drag & drop or click to browse</p>
        <p style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#9CA3AF', marginTop: 4 }}>PDF, JPG, PNG · Max 3 files · Max 5 MB each</p>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: isDark ? '#111827' : '#F8F9FA', borderRadius: 10, padding: '10px 14px', border: isDark ? '1px solid #1F2937' : '1px solid transparent' }}>
              <span>📄</span>
              <span style={{ flex: 1, fontSize: 13, color: isDark ? '#E2E8F0' : '#374151' }}>{f.name}</span>
              <span style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#9CA3AF' }}>{f.size}</span>
              <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
