// frontend/src/constants/index.js

export const SLA_TIERS = {
  P1: { label: 'P1', hours: 24,  color: '#DC2626', bg: '#FEE2E2', text: 'Critical — 24 hours' },
  P2: { label: 'P2', hours: 48,  color: '#EA580C', bg: '#FFEDD5', text: 'High — 48 hours' },
  P3: { label: 'P3', days: 5,   color: '#D97706', bg: '#FEF3C7', text: 'Standard — 5 business days' },
  P4: { label: 'P4', days: 10,  color: '#9CA3AF', bg: '#F3F4F6', text: 'Low — 10 business days' },
};

export const SENTIMENT_MAP = {
  VERY_FRUSTRATED: { label: 'Very Frustrated', bg: '#DC2626', color: '#fff' },
  FRUSTRATED:      { label: 'Frustrated',      bg: '#EA580C', color: '#fff' },
  NEUTRAL:         { label: 'Neutral',          bg: '#E5E7EB', color: '#374151' },
  SATISFIED:       { label: 'Satisfied',        bg: '#16A34A', color: '#fff' },
};

export const PRODUCT_CATEGORIES = [
  'UPI Payment',
  'NACH Mandate',
  'Savings Account',
  'Home Loan',
  'Credit Card',
  'Fixed Deposit',
  'NRE Account',
  'PMJDY Account',
  'Net Banking',
  'Other',
];

export const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Marathi', 'Bengali', 'Gujarati'];

export const STATUS_LABELS = {
  New:              'New',
  InProgress:       'In Progress',
  AwaitingCustomer: 'Awaiting Customer',
  DraftReady:       'Draft Ready',
  Resolved:         'Resolved',
  Closed:           'Closed',
};

export const DEMO_CREDENTIALS = {
  customer: { email: 'demo@customer.com', password: 'demo123' },
  agent:    { email: 'priya@sbibank.com',  password: 'demo123' },
  manager:  { email: 'sunita@sbibank.com', password: 'demo123' },
};

export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
