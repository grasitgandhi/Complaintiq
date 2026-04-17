// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS } from '../constants';

const ROLE_HOME = {
  customer: '/customer/track',
  agent:    '/agent/queue',
  manager:  '/manager/overview',
};

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setError(''); setLoading(true);
    const result = await login(email, password, selectedRole || undefined);
    setLoading(false);
    if (result.success) {
      navigate(ROLE_HOME[result.role] || '/login');
    } else {
      setError(result.error || 'Login failed.');
    }
  }

  function prefill(role) {
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
    setSelectedRole(role);
    setError('');
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* ── LEFT PANEL ── */}
      <div style={{
        width: '45%', background: '#0A1628', color: '#fff',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 56px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#00B4A6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚖️</div>
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
            Complaint<span style={{ color: '#00B4A6' }}>IQ</span>
          </span>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#94A3B8', marginBottom: 40, lineHeight: 1.5 }}>
          Unified AI Complaint Dashboard<br />for Indian Banking
        </h2>

        {/* Stat chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
          {[
            { icon: '📊', label: '10M+ RBI complaints/yr' },
            { icon: '⏱', label: 'P1–P4 IOS SLA tiers enforced' },
            { icon: '🔒', label: 'DPDPA-compliant architecture' },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#1E293B', borderRadius: 10, padding: '10px 14px',
            }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Architecture note */}
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: 24 }}>
          <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.8 }}>
            Runs fully on-premise · Zero cloud dependency · Zero token cost<br />
            <span style={{ color: '#334155' }}>XGBoost handles classification · LLM handles narration · Never mixed</span>
          </p>
          <p style={{ fontSize: 11, color: '#334155', marginTop: 12 }}>
            PSBs Hackathon 2026 · Team Hack-it-Out · SPIT Mumbai
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1, background: '#fff',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 64px',
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0A1628', marginBottom: 6 }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 36 }}>Sign in to your ComplaintIQ account</p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: `1.5px solid ${error ? '#DC2626' : '#D1D5DB'}`,
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: `1.5px solid ${error ? '#DC2626' : '#D1D5DB'}`,
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Inline error */}
          {error && <p style={{ color: '#DC2626', fontSize: 12, margin: '6px 0 12px' }}>{error}</p>}

          {/* Login button */}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 12,
            background: loading ? '#99E8E3' : '#00B4A6',
            color: '#fff', border: 'none', fontSize: 16, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
          }}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>— Demo Access —</span>
          <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
        </div>

        {/* Demo buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { role: 'customer', icon: '👤', label: 'Login as Customer',          sub: 'demo@customer.com' },
            { role: 'agent',    icon: '🎧', label: 'Login as Bank Agent',         sub: 'priya@sbibank.com' },
            { role: 'manager',  icon: '📊', label: 'Login as Compliance Manager', sub: 'sunita@sbibank.com' },
          ].map(d => (
            <button key={d.role} onClick={() => prefill(d.role)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 16px', borderRadius: 10,
              border: '1.5px solid #E5E7EB', background: '#F8F9FA',
              cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#00B4A6'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
            >
              <span style={{ fontSize: 20 }}>{d.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0A1628' }}>{d.label}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{d.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 14, textAlign: 'center' }}>
          All demo passwords: <strong style={{ color: '#374151' }}>demo123</strong>
        </p>
      </div>
    </div>
  );
}
