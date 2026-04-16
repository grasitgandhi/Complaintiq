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
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setError(''); setLoading(true);
    const result = await login(email, password);
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
    setError('');
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Left Panel */}
      <div style={{
        width: '45%',
        background: 'linear-gradient(180deg, #0B1629 0%, #1A2F50 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative gradient orb */}
        <div style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 198, 181, 0.15) 0%, transparent 70%)',
          bottom: -100,
          right: -100,
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #00C6B5, #009E90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 4px 20px rgba(0, 198, 181, 0.3)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>
            Complaint<span style={{ color: '#00C6B5' }}>IQ</span>
          </span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#94A3B8', marginBottom: 40, lineHeight: 1.6 }}>
          Unified AI Complaint Dashboard<br />for Indian Banking
        </h2>

        {/* Feature cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>, label: '10M+ RBI complaints/yr', color: '#00C6B5' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, label: 'P1-P4 IOS SLA tiers enforced', color: '#F59E0B' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, label: 'DPDPA-compliant architecture', color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: '14px 18px',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.2s ease',
            }}>
              <div style={{ color: s.color }}>{s.icon}</div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Architecture note */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.8 }}>
            Runs fully on-premise with zero cloud dependency<br />
            <span style={{ color: '#475569' }}>XGBoost classification | LLM narration | Deterministic audit trail</span>
          </p>
          <p style={{ fontSize: 12, color: '#475569', marginTop: 16 }}>
            PSBs Hackathon 2026 | Team Hack-it-Out | SPIT Mumbai
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: 1,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 72px',
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0B1629', marginBottom: 8 }}>Welcome back</h1>
        <p style={{ fontSize: 15, color: '#64748B', marginBottom: 40 }}>Sign in to your ComplaintIQ account</p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  borderRadius: 12,
                  border: `2px solid ${error ? '#EF4444' : '#E2E8F0'}`,
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 44px',
                  borderRadius: 12,
                  border: `2px solid ${error ? '#EF4444' : '#E2E8F0'}`,
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: 4,
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 10,
              marginBottom: 16,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ color: '#DC2626', fontSize: 13, fontWeight: 500 }}>{error}</span>
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              background: loading ? '#99E8E3' : 'linear-gradient(135deg, #00C6B5, #009E90)',
              color: '#fff',
              border: 'none',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 8,
              boxShadow: loading ? 'none' : '0 4px 14px rgba(0, 198, 181, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading && (
              <div style={{
                width: 18,
                height: 18,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            )}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>Demo Access</span>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
        </div>

        {/* Demo buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { role: 'customer', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: 'Login as Customer', sub: 'demo@customer.com', color: '#00C6B5' },
            { role: 'agent', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>, label: 'Login as Bank Agent', sub: 'priya@sbibank.com', color: '#3B82F6' },
            { role: 'manager', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>, label: 'Login as Compliance Manager', sub: 'sunita@sbibank.com', color: '#8B5CF6' },
          ].map(d => (
            <button
              key={d.role}
              onClick={() => prefill(d.role)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                borderRadius: 12,
                border: '2px solid #E2E8F0',
                background: '#FAFAFA',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = d.color;
                e.currentTarget.style.background = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.background = '#FAFAFA';
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${d.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: d.color,
              }}>
                {d.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1629' }}>{d.label}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{d.sub}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={{ marginLeft: 'auto' }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          ))}
        </div>

        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 20, textAlign: 'center' }}>
          All demo passwords: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#374151', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontWeight: 500 }}>demo123</span>
        </p>
      </div>
    </div>
  );
}
