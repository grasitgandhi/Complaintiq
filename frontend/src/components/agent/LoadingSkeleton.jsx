// frontend/src/components/agent/LoadingSkeleton.jsx
function SkeletonBox({ w = '100%', h = 16, mb = 0 }) {
  return (
    <div className="shimmer" style={{ width: w, height: h, marginBottom: mb, borderRadius: 6 }} />
  );
}

export function ComplaintCardSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex', gap: 0, overflow: 'hidden' }}>
      <div style={{ width: 4, background: '#E5E7EB', flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '0 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <SkeletonBox w="180px" h={18} />
          <SkeletonBox w="80px" h={18} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <SkeletonBox w="80px" h={22} />
          <SkeletonBox w="60px" h={22} />
          <SkeletonBox w="70px" h={22} />
        </div>
        <SkeletonBox w="100%" h={14} mb={6} />
        <SkeletonBox w="60%" h={14} />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ count = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => <ComplaintCardSkeleton key={i} />)}
    </div>
  );
}
