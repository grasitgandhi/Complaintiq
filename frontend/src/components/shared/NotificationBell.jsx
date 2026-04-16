// frontend/src/components/shared/NotificationBell.jsx
import { useState } from 'react';

const DEMO_NOTIFICATIONS = [
  { id: 1, text: '⚠ New P1 complaint: CIQ-2026-000002 — ESCALATION RISK', time: '2 min ago', unread: true },
  { id: 2, text: 'SLA breach risk: CIQ-2026-000041 (72% AI probability)',   time: '18 min ago', unread: true },
  { id: 3, text: 'Complaint CIQ-2026-000015 resolved by Arjun Nair',        time: '1 hr ago',  unread: false },
  { id: 4, text: 'New P2 complaint assigned: CIQ-2026-000044',              time: '2 hr ago',  unread: false },
  { id: 5, text: 'RBI monthly report due in 3 days',                        time: '4 hr ago',  unread: false },
];

export default function NotificationBell() {
  const [open, setOpen]         = useState(false);
  const [notifs, setNotifs]     = useState(DEMO_NOTIFICATIONS);
  const unreadCount             = notifs.filter(n => n.unread).length;

  function markAllRead() {
    setNotifs(n => n.map(x => ({ ...x, unread: false })));
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
      >
        <span style={{ fontSize: 20 }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: '#DC2626', color: '#fff',
            borderRadius: 10, fontSize: 10, fontWeight: 700,
            padding: '1px 5px', minWidth: 16, textAlign: 'center',
          }}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
          {/* Dropdown */}
          <div style={{
            position: 'absolute', right: 0, top: '110%', width: 340,
            background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            zIndex: 99, border: '1px solid #E5E7EB', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0A1628' }}>Notifications</span>
              <button onClick={markAllRead} style={{ fontSize: 11, color: '#00B4A6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>
            </div>
            {notifs.map(n => (
              <div key={n.id} style={{
                padding: '12px 16px', borderBottom: '1px solid #F9FAFB',
                background: n.unread ? '#F0FDFC' : '#fff',
              }}>
                <p style={{ fontSize: 12, color: '#0A1628', margin: 0, lineHeight: 1.5 }}>{n.text}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '3px 0 0' }}>{n.time}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
