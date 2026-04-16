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

  // ── Validation ────────────────────────────────────────────────────────────
  function validate() {
    const e = {};
    if (step === 0) {
      if (!form.account)                 e.account = 'Account number is required.';
      else if (form.account.length > 20) e.account = 'Max 20 characters.';
      if (!form.mobile)                  e.mobile  = 'Mobile number is required.';
      else if (!isValidMobile(form.mobile)) e.mobile = 'Enter valid 10-digit mobile starting with 6–9.';
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

  // ── Submit ────────────────────────────────────────────────────────────────
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

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px' }}>
      <StepProgressBar steps={STEPS} current={step} />

      <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 1px 8px rgba(0,0,0,0.07)' }}>

        {/* ── STEP 0: Your Details ── */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0A1628', marginBottom: 24 }}>
              Your Details
            </h2>

            {[
              { key: 'account', label: 'Account Number', type: 'text', placeholder: 'Your bank account number', max: 20 },
              { key: 'mobile',  label: 'Mobile Number',  type: 'tel',  placeholder: '10-digit number starting with 6–9' },
              { key: 'email',   label: 'Email Address (Optional)', type: 'email', placeholder: 'your@email.com' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  type={f.type} value={form[f.key]} maxLength={f.max}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                    border: `1.5px solid ${errors[f.key] ? '#DC2626' : '#D1D5DB'}`,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                {errors[f.key] && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>{errors[f.key]}</p>}
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Preferred Language
              </label>
              <select value={form.lang} onChange={e => set('lang', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #D1D5DB', fontSize: 14 }}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ── STEP 1: Complaint Details ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0A1628', marginBottom: 24 }}>
              Complaint Details
            </h2>

            {/* Product category */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Product Category *
              </label>
              <select value={form.product} onChange={e => set('product', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${errors.product ? '#DC2626' : '#D1D5DB'}`, fontSize: 14 }}>
                <option value="">Select a product</option>
                {PRODUCT_CATEGORIES.map(p => <option key={p}>{p}</option>)}
              </select>
              {errors.product && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>{errors.product}</p>}
              {form.product === 'NACH Mandate' && (
                <p style={{ fontSize: 12, color: '#6B7280', background: '#F8F9FA', borderRadius: 8, padding: '6px 10px', marginTop: 6 }}>
                  ℹ National Automated Clearing House — handles EMI and recurring payments
                </p>
              )}
              {form.product === 'PMJDY Account' && (
                <p style={{ fontSize: 12, color: '#6B7280', background: '#F8F9FA', borderRadius: 8, padding: '6px 10px', marginTop: 6 }}>
                  ℹ Pradhan Mantri Jan-Dhan Yojana — government basic savings accounts
                </p>
              )}
            </div>

            {/* Description with live char counter */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Complaint Description *
              </label>
              <textarea
                value={form.desc}
                onChange={e => set('desc', e.target.value)}
                placeholder="Describe your complaint in detail (minimum 30 characters)…"
                maxLength={500} rows={5}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                  border: `1.5px solid ${errors.desc ? '#DC2626' : '#D1D5DB'}`,
                  resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.desc
                  ? <p style={{ color: '#DC2626', fontSize: 12, margin: 0 }}>{errors.desc}</p>
                  : <span />}
                <span style={{ fontSize: 12, color: form.desc.length >= 450 ? '#D97706' : '#9CA3AF' }}>
                  {form.desc.length} / 500
                </span>
              </div>

              {escalation && (
                <div style={{ background: '#FFFBEB', border: '1px solid #F59E0B', borderRadius: 10, padding: '12px 16px', marginTop: 10 }}>
                  <p style={{ fontSize: 13, color: '#92400E', fontWeight: 600, margin: 0 }}>
                    ⚠ Your complaint mentions a regulatory body. We will treat this as P1 Priority and assign it to a senior agent within the next hour.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Date of Incident *
                </label>
                <input type="date" value={form.date} max={today}
                  onChange={e => set('date', e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${errors.date ? '#DC2626' : '#D1D5DB'}`, fontSize: 14, boxSizing: 'border-box' }} />
                {errors.date && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>{errors.date}</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Transaction Reference (Optional)
                </label>
                <input type="text" value={form.ref}
                  onChange={e => set('ref', e.target.value)}
                  placeholder="e.g. UPI/2026/03/15/4821"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #D1D5DB', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Documents ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0A1628', marginBottom: 8 }}>
              Supporting Documents
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
              Upload any screenshots, statements, or transaction proofs that support your complaint.
            </p>
            <FileUploadArea files={form.files} setFiles={v => set('files', v)} />
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0A1628', marginBottom: 24 }}>
              Review & Submit
            </h2>
            {[
              {
                heading: 'Your Details',
                rows: [
                  ['Account Number', form.account],
                  ['Mobile',         form.mobile],
                  ['Email',          form.email || '—'],
                  ['Preferred Language', form.lang],
                ],
              },
              {
                heading: 'Complaint Details',
                rows: [
                  ['Product',        form.product],
                  ['Description',    form.desc],
                  ['Incident Date',  form.date],
                  ['Transaction Ref',form.ref || '—'],
                ],
              },
              {
                heading: 'Documents',
                rows: form.files.length > 0
                  ? form.files.map((f, i) => [`File ${i + 1}`, `${f.name} (${f.size})`])
                  : [['Files', 'None attached']],
              },
            ].map(sec => (
              <div key={sec.heading} style={{ marginBottom: 20 }}>
                <div style={{ background: '#0A1628', color: '#fff', padding: '8px 14px', borderRadius: '10px 10px 0 0', fontSize: 13, fontWeight: 700 }}>
                  {sec.heading}
                </div>
                <div style={{ border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
                  {sec.rows.map(([k, v]) => (
                    <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '10px 14px', borderBottom: '1px solid #F3F4F6' }}>
                      <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>{k}</span>
                      <span style={{ fontSize: 13, color: '#0A1628', wordBreak: 'break-word' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 20 }}>
              <input type="checkbox" checked={form.confirmed} onChange={e => set('confirmed', e.target.checked)} style={{ marginTop: 2 }} />
              <span style={{ fontSize: 13, color: '#374151' }}>
                I confirm the information provided is accurate and complete
              </span>
            </label>
          </div>
        )}

        {/* ── Navigation ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          {step > 0
            ? <button onClick={back} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
            : <div />}

          {step < 3
            ? <button onClick={next} style={{ background: '#0A1628', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', cursor: 'pointer', fontWeight: 700 }}>Next →</button>
            : (
              <button
                onClick={handleSubmit}
                disabled={!form.confirmed || submitting}
                style={{
                  background: form.confirmed && !submitting ? '#00B4A6' : '#E5E7EB',
                  color:      form.confirmed && !submitting ? '#fff'    : '#9CA3AF',
                  border: 'none', borderRadius: 10, padding: '10px 28px',
                  cursor: form.confirmed && !submitting ? 'pointer' : 'not-allowed', fontWeight: 700,
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Complaint'}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
