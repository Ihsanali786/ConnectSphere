import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Bell, Mail, Bookmark, User, Settings, LogOut, Zap, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const NAV = [
  { icon: Home,     label: 'Home',         path: '/home' },
  { icon: Compass,  label: 'Explore',      path: '/explore' },
  { icon: Bell,     label: 'Notifications',path: '/notifications' },
  { icon: Mail,     label: 'Messages',     path: '/messages' },
  { icon: Bookmark, label: 'Bookmarks',    path: '/bookmarks' },
  { icon: User,     label: 'Profile',      path: '__profile__' },
  { icon: Settings, label: 'Settings',     path: '/settings' },
];

export default function LeftSidebar({ mode = 'desktop', onClose }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const getPath = (p) => p === '__profile__' ? `/profile/${user?.username}` : p;
  const isActive = (p) => pathname === getPath(p);

  const handleLogout = async () => {
    onClose?.();
    await logout();
    toast.success('Logged out 👋');
    navigate('/');
  };

  return (
    <aside
      className={mode === 'desktop' ? 'desktop-sidebar' : ''}
      style={{
        width: 256, height: '100vh', display: 'flex', flexDirection: 'column',
        background: 'rgba(5,8,15,0.94)',
        backdropFilter: 'blur(32px)',
        borderRight: '1px solid var(--border)',
        boxShadow: '4px 0 40px rgba(0,0,0,0.5)',
        overflowY: 'auto', overflowX: 'hidden',
        ...(mode === 'desktop' ? { position: 'fixed', top: 0, left: 0, zIndex: 40 } : {}),
      }}
    >
      {/* Logo */}
      <div style={{ padding: '22px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/home" onClick={onClose} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--blue), var(--violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--blue-glow)', flexShrink: 0,
          }}>
            <Zap size={19} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 19, color: 'var(--text-1)' }}>
            Connect<span style={{ color: 'var(--blue)' }}>Sphere</span>
          </span>
        </Link>
        {mode === 'mobile' && (
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-md)',
            background: 'var(--bg-3)', cursor: 'pointer', color: 'var(--text-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '6px 10px' }}>
        {NAV.map((item, i) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          const to = getPath(item.path);
          return (
            <motion.div key={item.label}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.035, duration: 0.28 }}>
              <Link to={to} onClick={onClose} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '10px 13px', borderRadius: 12,
                  background: active ? 'linear-gradient(135deg, rgba(79,142,247,0.16), rgba(155,116,247,0.08))' : 'transparent',
                  border: active ? '1px solid rgba(79,142,247,0.22)' : '1px solid transparent',
                  cursor: 'pointer', position: 'relative',
                  transition: 'all .18s',
                }}
                onMouseEnter={e => !active && (e.currentTarget.style.background = 'var(--bg-3)')}
                onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
                >
                  {active && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 22, borderRadius: '0 3px 3px 0',
                      background: 'linear-gradient(180deg, var(--blue), var(--violet))',
                    }} />
                  )}
                  <Icon size={19} strokeWidth={active ? 2.5 : 2}
                    color={active ? 'var(--blue)' : 'var(--text-2)'} />
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? 'var(--text-1)' : 'var(--text-2)',
                  }}>{item.label}</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div style={{ padding: '10px 10px 20px', borderTop: '1px solid var(--border)' }}>
          <Link to={`/profile/${user.username}`} onClick={onClose} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 12, marginBottom: 4, cursor: 'pointer',
              transition: 'background .18s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {user.profilePicture
                  ? <img src={user.profilePicture} style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} alt="" />
                  : <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff', fontFamily: 'var(--font-display)' }}>
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                }
                <div className="online-ring" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }}>
                  {user.fullName || user.username}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>@{user.username}</p>
              </div>
            </div>
          </Link>

          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '9px 12px', borderRadius: 10,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 500,
            transition: 'all .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--rose)'; e.currentTarget.style.background = 'var(--rose-dim)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </aside>
  );
}