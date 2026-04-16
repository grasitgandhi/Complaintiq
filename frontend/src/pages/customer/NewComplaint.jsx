// frontend/src/pages/customer/NewComplaint.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StepProgressBar from '../../components/customer/StepProgressBar';
import FileUploadArea from '../../components/customer/FileUploadArea';
import { PRODUCT_CATEGORIES, LANGUAGES } from '../../constants';
import { isValidMobile } from '../../utils';
import api from '../../services/api';

const STEPS = ['Your Details', 'Complaint', 'Documents', 'Review'];

const ESCALATION_PHRASES = [
  'report to rbi', 'banking ombudsman', 'consumer court', 'rbi ombudsman',
  'rbi ko', 'shikayat karunga', 'rbi mein shikayat',
  'rbi kku', 'ombudsman paas',
  'rbi kade', 'tक्रार',
  'rbi te', 'অভিযোগ',
  'rbi ne', 'ombudsman',
  'sebi', 'file complaint with rbi',
];

function detectEscalation(text) {
  const t = text.toLowerCase();
  return ESCALATION_PHRASES.some(p => t.includes(p));
}

export default function NewComplaint() {
  const navigate  = useNavigate();

  const [step, setStep]       = useState(0);
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    account: '', mobile: '', email: '', lang: 'English',
    product: '', desc: '', date: '', ref: '',
    files: [],
    confirmed: false,
  });

  const escalation = detectEscalation(form.desc);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  // Validation
  function validate() {
    const e = {};
    if (step === 0) {
      if (!form.account)                 e.account = 'Account number is required.';
      else if (form.account.length > 20) e.account = 'Max 20 characters.';
      if (!form.mobile)                  e.mobile  = 'Mobile number is required.';
      else if (!isValidMobile(form.mobile)) e.mobile = 'Enter valid 10-digit mobile starting with 6-9.';
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format.';
    }
    if (step === 1) {
      if (!form.product)                              e.product = 'Please select a product.';
      if (!form.desc || form.desc.length < 30)        e.desc    = 'Description must be at least 30 characters.';
      if (!form.date)                                 e.date    = 'Incident date is required.';
      else if (new Date(form.date) > new Date())      e.date    = 'Incident date cannot be in the future.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() { if (validate()) setStep(s => s + 1); }
  function back() { setStep(s => s - 1); setErrors({}); }

  // Submit
  async function handleSubmit() {
    setSubmitting(true);
    const payload = {
      customer_account:      form.account,
      customer_mobile:       form.mobile,
      customer_email:        form.email,
      preferred_language:    form.lang,
      product_category:      form.product,
      complaint_text:        form.desc,
      incident_date:         form.date,
      transaction_reference: form.ref,
    };
    try {
      const result = await api.complaints.create(payload);
      navigate('/customer/success', { state: result });
    } catch (err) {
      toast.error(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    fontSize: 15,
    border: `2px solid ${hasError ? '#EF4444' : '#E2E8F0'}`,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'inherit',
  });

  const labelStyle = {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 8,
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
      <StepProgressBar steps={STEPS} current={step} />

      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 40,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        marginTop: 24,
      }}>

        {/* STEP 0: Your Details */}
        {step === 0 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0B1629', marginBottom: 8 }}>
              Your Details
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>
              Please provide your account information to file a complaint
            </p>

            {[
              { key: 'account', label: 'Account Number', type: 'text', placeholder: 'Enter your bank account number', max: 20, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { key: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile starting with 6-9', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
              { key: 'email', label: 'Email Address (Optional)', type: 'email', placeholder: 'your@email.com', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 24 }}>
                <label style={labelStyle}>{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    {f.icon}
                  </div>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    maxLength={f.max}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={{ ...inputStyle(errors[f.key]), paddingLeft: 48 }}
                  />
                </div>
                {errors[f.key] && (
                  <p style={{ color: '#EF4444', fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errors[f.key]}
                  </p>
                )}
              </div>
            ))}

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Preferred Language</label>
              <select
                value={form.lang}
                onChange={e => set('lang', e.target.value)}
                style={inputStyle(false)}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* STEP 1: Complaint Details */}
        {step === 1 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0B1629', marginBottom: 8 }}>
              Complaint Details
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>
              Describe your issue in detail so we can help you better
            </p>

            {/* Product category */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Product Category *</label>
              <select
                value={form.product}
                onChange={e => set('product', e.target.value)}
                style={inputStyle(errors.product)}
              >
                <option value="">Select a product</option>
                {PRODUCT_CATEGORIES.map(p => <option key={p}>{p}</option>)}
              </select>
              {errors.product && (
                <p style={{ color: '#EF4444', fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.product}
                </p>
              )}
              {form.product === 'NACH Mandate' && (
                <div style={{ fontSize: 13, color: '#64748B', background: '#F8FAFC', borderRadius: 10, padding: '10px 14px', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C6B5" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  National Automated Clearing House - handles EMI and recurring payments
                </div>
              )}
              {form.product === 'PMJDY Account' && (
                <div style={{ fontSize: 13, color: '#64748B', background: '#F8FAFC', borderRadius: 10, padding: '10px 14px', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C6B5" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Pradhan Mantri Jan-Dhan Yojana - government basic savings accounts
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Complaint Description *</label>
              <textarea
                value={form.desc}
                onChange={e => set('desc', e.target.value)}
                placeholder="Describe your complaint in detail (minimum 30 characters)..."
                maxLength={500}
                rows={5}
                style={{
                  ...inputStyle(errors.desc),
                  resize: 'vertical',
                  lineHeight: 1.6,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                {errors.desc ? (
                  <p style={{ color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errors.desc}
                  </p>
                ) : <span />}
                <span style={{ fontSize: 13, color: form.desc.length >= 450 ? '#F59E0B' : '#94A3B8', fontWeight: 500 }}>
                  {form.desc.length} / 500
                </span>
              </div>

              {escalation && (
                <div style={{
                  background: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  borderRadius: 12,
                  padding: '14px 18px',
                  marginTop: 16,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: 14, color: '#92400E', fontWeight: 600, margin: 0 }}>
                      Escalation Detected
                    </p>
                    <p style={{ fontSize: 13, color: '#B45309', margin: '4px 0 0' }}>
                      Your complaint mentions a regulatory body. This will be treated as P1 Priority and assigned to a senior agent within one hour.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={labelStyle}>Date of Incident *</label>
                <input
                  type="date"
                  value={form.date}
                  max={today}
                  onChange={e => set('date', e.target.value)}
                  style={inputStyle(errors.date)}
                />
                {errors.date && (
                  <p style={{ color: '#EF4444', fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errors.date}
                  </p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Transaction Reference (Optional)</label>
                <input
                  type="text"
                  value={form.ref}
                  onChange={e => set('ref', e.target.value)}
                  placeholder="e.g. UPI/2026/03/15/4821"
                  style={inputStyle(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Documents */}
        {step === 2 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0B1629', marginBottom: 8 }}>
              Supporting Documents
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>
              Upload any screenshots, statements, or transaction proofs that support your complaint.
            </p>
            <FileUploadArea files={form.files} setFiles={v => set('files', v)} />
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0B1629', marginBottom: 8 }}>
              Review & Submit
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 32 }}>
              Please review your complaint details before submitting
            </p>

            {[
              {
                heading: 'Your Details',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
                rows: [
                  ['Account Number', form.account],
                  ['Mobile', form.mobile],
                  ['Email', form.email || '-'],
                  ['Preferred Language', form.lang],
                ],
              },
              {
                heading: 'Complaint Details',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
                rows: [
                  ['Product', form.product],
                  ['Description', form.desc],
                  ['Incident Date', form.date],
                  ['Transaction Ref', form.ref || '-'],
                ],
              },
              {
                heading: 'Documents',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
                rows: form.files.length > 0
                  ? form.files.map((f, i) => [`File ${i + 1}`, `${f.name} (${f.size})`])
                  : [['Files', 'None attached']],
              },
            ].map(sec => (
              <div key={sec.heading} style={{ marginBottom: 24 }}>
                <div style={{
                  background: '#0B1629',
                  color: '#fff',
                  padding: '12px 18px',
                  borderRadius: '12px 12px 0 0',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  {sec.icon}
                  {sec.heading}
                </div>
                <div style={{ border: '2px solid #E2E8F0', borderTop: 'none', borderRadius: '0 0 12px 12px' }}>
                  {sec.rows.map(([k, v]) => (
                    <div key={k} style={{
                      display: 'grid',
                      gridTemplateColumns: '160px 1fr',
                      padding: '12px 18px',
                      borderBottom: '1px solid #F1F5F9',
                    }}>
                      <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{k}</span>
                      <span style={{ fontSize: 14, color: '#0B1629', wordBreak: 'break-word' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: 'pointer',
              marginTop: 24,
              padding: 16,
              background: form.confirmed ? '#E6FAF8' : '#F8FAFC',
              borderRadius: 12,
              border: `2px solid ${form.confirmed ? '#00C6B5' : '#E2E8F0'}`,
              transition: 'all 0.2s ease',
            }}>
              <input
                type="checkbox"
                checked={form.confirmed}
                onChange={e => set('confirmed', e.target.checked)}
                style={{
                  width: 20,
                  height: 20,
                  marginTop: 2,
                  accentColor: '#00C6B5',
                }}
              />
              <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                I confirm that the information provided is accurate and complete to the best of my knowledge.
              </span>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
          {step > 0 ? (
            <button
              onClick={back}
              style={{
                background: '#F1F5F9',
                color: '#374151',
                border: 'none',
                borderRadius: 12,
                padding: '14px 28px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={next}
              style={{
                background: '#0B1629',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 32px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!form.confirmed || submitting}
              style={{
                background: form.confirmed && !submitting ? 'linear-gradient(135deg, #00C6B5, #009E90)' : '#E2E8F0',
                color: form.confirmed && !submitting ? '#fff' : '#94A3B8',
                border: 'none',
                borderRadius: 12,
                padding: '14px 32px',
                cursor: form.confirmed && !submitting ? 'pointer' : 'not-allowed',
                fontWeight: 700,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: form.confirmed && !submitting ? '0 4px 14px rgba(0, 198, 181, 0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width: 18,
                    height: 18,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Submitting...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                  Submit Complaint
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
