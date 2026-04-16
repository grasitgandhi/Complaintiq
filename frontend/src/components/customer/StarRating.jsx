// frontend/src/components/customer/StarRating.jsx
import { useState } from 'react';

export default function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          style={{
            fontSize: 30, background: 'none', border: 'none', cursor: 'pointer',
            opacity: s <= (hover || value) ? 1 : 0.25,
            transition: 'opacity 0.15s, transform 0.1s',
            transform: s <= (hover || value) ? 'scale(1.15)' : 'scale(1)',
          }}
        >⭐</button>
      ))}
    </div>
  );
}
