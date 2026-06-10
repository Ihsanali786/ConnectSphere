const Bone = ({ w = '100%', h = 12, r = 6, mb = 0 }) => (
  <div className="skeleton" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
);

export default function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 20, padding: '14px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <Bone w={40} h={40} r={11} />
        <div style={{ flex: 1 }}>
          <Bone w="50%" h={13} mb={6} r={6} />
          <Bone w="32%" h={10} r={5} />
        </div>
      </div>
      <Bone h={13} mb={7} /><Bone w="82%" h={13} mb={7} /><Bone w="60%" h={13} mb={14} />
      <Bone h={220} r={12} mb={12} />
      <div style={{ display: 'flex', gap: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
        <Bone w={60} h={30} r={9} /><Bone w={60} h={30} r={9} /><Bone w={44} h={30} r={9} />
      </div>
    </div>
  );
}