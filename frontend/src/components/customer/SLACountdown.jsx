// frontend/src/components/customer/SLACountdown.jsx
import { slaCountdown } from '../../utils';

export default function SLACountdown({ deadline, showDue = true }) {
  const t = slaCountdown(deadline);
  return (
    <span style={{ color: t.color, fontWeight: 600, fontSize: 13 }}>
      ⏱{' '}
      {showDue && `Due ${new Date(deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · `}
      {t.label}
    </span>
  );
}
