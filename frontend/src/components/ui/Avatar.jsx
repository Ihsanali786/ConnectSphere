import { useState } from 'react';

const SZ = {
  xs:  { s: 24, r: 6,  f: 9 },
  sm:  { s: 32, r: 9,  f: 12 },
  md:  { s: 40, r: 11, f: 15 },
  lg:  { s: 56, r: 14, f: 20 },
  xl:  { s: 80, r: 18, f: 28 },
  '2xl':{ s: 108, r: 22, f: 36 },
};

export default function Avatar({ user, size = 'md', ring = false, style: extraStyle = {}, className = '', onClick }) {
  const [err, setErr] = useState(false);
  const { s, r, f } = SZ[size] || SZ.md;

  const base = {
    width: s, height: s, borderRadius: r, flexShrink: 0,
    outline: ring ? '2.5px solid var(--blue)' : 'none',
    outlineOffset: ring ? 2 : 0,
    cursor: onClick ? 'pointer' : 'default',
    ...extraStyle,
  };

  if (user?.profilePicture && !err) {
    return <img src={user.profilePicture} alt={user?.username}
      onError={() => setErr(true)}
      onClick={onClick}
      style={{ ...base, objectFit: 'cover' }}
      className={className}
    />;
  }

  return (
    <div style={{
      ...base,
      background: 'linear-gradient(135deg, var(--blue), var(--violet))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 900, fontSize: f,
      fontFamily: 'var(--font-display)',
    }} className={className} onClick={onClick}>
      {user?.username?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase() || '?'}
    </div>
  );
}