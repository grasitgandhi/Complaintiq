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
    <div className="max-w-2xl mx-auto px-4 py-8 bg-slate-50 dark:bg-[#010409] min-h-screen">
      <StepProgressBar steps={STEPS} current={step} />

      <div className="bg-white dark:bg-[#161B22] rounded-2xl p-8 shadow-xl dark:shadow-2xl border border-slate-100 dark:border-slate-800">

        {/* ── STEP 0: Your Details ── */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Your Details</h2>

            {[
              { key: 'account', label: 'Account Number', type: 'text', placeholder: 'Your bank account number', max: 20 },
              { key: 'mobile',  label: 'Mobile Number',  type: 'tel',  placeholder: '10-digit number starting with 6–9' },
              { key: 'email',   label: 'Email Address (Optional)', type: 'email', placeholder: 'your@email.com' },
            ].map(f => (
              <div key={f.key} className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  maxLength={f.max}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border ${ errors[f.key] ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200`}
                />
                {errors[f.key] && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors[f.key]}</p>}
              </div>
            ))}

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Preferred Language
              </label>
              <select
                value={form.lang}
                onChange={e => set('lang', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200"
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ── STEP 1: Complaint Details ── */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Complaint Details</h2>

            {/* Product category */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Product Category *
              </label>
              <select
                value={form.product}
                onChange={e => set('product', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-white border ${ errors.product ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200`}
              >
                <option value="">Select a product</option>
                {PRODUCT_CATEGORIES.map(p => <option key={p}>{p}</option>)}
              </select>
              {errors.product && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.product}</p>}
              {form.product === 'NACH Mandate' && (
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg p-2 mt-2">
                  ℹ National Automated Clearing House — handles EMI and recurring payments
                </p>
              )}
              {form.product === 'PMJDY Account' && (
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg p-2 mt-2">
                  ℹ Pradhan Mantri Jan-Dhan Yojana — government basic savings accounts
                </p>
              )}
            </div>

            {/* Description with live char counter */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Complaint Description *
              </label>
              <textarea
                value={form.desc}
                onChange={e => set('desc', e.target.value)}
                placeholder="Describe your complaint in detail (minimum 30 characters)…"
                maxLength={500}
                rows={5}
                className={`w-full px-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border ${ errors.desc ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200`}
              />
              <div className="flex justify-between mt-1">
                {errors.desc ? (
                  <p className="text-red-600 dark:text-red-400 text-xs">{errors.desc}</p>
                ) : (
                  <span />
                )}
                <span className={`text-xs ${ form.desc.length >= 450 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-600'}`}>
                  {form.desc.length} / 500
                </span>
              </div>

              {escalation && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
                  <p className="text-sm text-amber-900 dark:text-amber-100 font-semibold m-0">
                    ⚠ Your complaint mentions a regulatory body. We will treat this as P1 Priority and assign it to a senior agent within the next hour.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Date of Incident *
                </label>
                <input
                  type="date"
                  value={form.date}
                  max={today}
                  onChange={e => set('date', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-white border ${ errors.date ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200`}
                />
                {errors.date && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Transaction Reference (Optional)
                </label>
                <input
                  type="text"
                  value={form.ref}
                  onChange={e => set('ref', e.target.value)}
                  placeholder="e.g. UPI/2026/03/15/4821"
                  className="w-full px-4 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Documents ── */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Supporting Documents</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Upload any screenshots, statements, or transaction proofs that support your complaint.
            </p>
            <FileUploadArea files={form.files} setFiles={v => set('files', v)} />
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Review & Submit</h2>
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
              <div key={sec.heading} className="mb-5">
                <div className="bg-slate-900 dark:bg-slate-900 text-white px-4 py-2 rounded-t-lg text-sm font-semibold">
                  {sec.heading}
                </div>
                <div className="border border-t-0 border-slate-200 dark:border-slate-700 rounded-b-lg dark:bg-[#0D1117]">
                  {sec.rows.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-48 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{k}</span>
                      <span className="text-sm text-slate-900 dark:text-slate-100 break-words">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <label className="flex items-start gap-3 cursor-pointer mt-6">
              <input
                type="checkbox"
                checked={form.confirmed}
                onChange={e => set('confirmed', e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                I confirm the information provided is accurate and complete
              </span>
            </label>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={back}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={next}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-slate-900 dark:bg-slate-900 text-white hover:bg-slate-800 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!form.confirmed || submitting}
              className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${ form.confirmed && !submitting
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'}`}
            >
              {submitting ? 'Submitting…' : 'Submit Complaint'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
