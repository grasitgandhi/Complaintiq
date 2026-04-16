// frontend/src/utils/index.js
import { SLA_TIERS } from '../constants';

/** Format a date as "15 Mar 2026, 10:30 AM" */
export function fmtDateTime(date) {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Format a date as "15 Mar 2026" */
export function fmtDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** SLA countdown: returns { label, color, urgent } */
export function slaCountdown(deadline) {
  const diff = new Date(deadline) - Date.now();
  if (diff <= 0) return { label: 'Overdue', color: '#DC2626', urgent: true };
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(h / 24);
  if (h < 24) return { label: `${h}h remaining`, color: '#DC2626', urgent: true };
  if (d <= 3) return { label: `${d}d ${h % 24}h remaining`, color: '#D97706', urgent: false };
  return { label: `${d}d remaining`, color: '#16A34A', urgent: false };
}

/** Breach prob → plain-language risk level */
export function breachRiskLabel(prob) {
  if (prob > 0.6) return { label: 'High',   color: '#DC2626', bg: '#FEE2E2' };
  if (prob > 0.3) return { label: 'Medium', color: '#D97706', bg: '#FEF3C7' };
  return               { label: 'Low',    color: '#16A34A', bg: '#F0FDF4' };
}

/** Generate CIQ reference number */
export function genRef(count) {
  return `CIQ-${new Date().getFullYear()}-${String(count).padStart(6, '0')}`;
}

/** Indian mobile validation: 10 digits, starts with 6–9 */
export function isValidMobile(v) {
  return /^[6-9]\d{9}$/.test(v);
}

/** Mask account: show only last 4 digits */
export function maskAccount(num) {
  return `XXXX-XXXX-${String(num).slice(-4)}`;
}
