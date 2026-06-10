import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Bell, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const TABS = [
  { icon: Home,    path: '/home',          label: 'Home' },
  { icon: Compass, path: '/explore',       label: 'Explore' },
  { icon: Bell,    path: '/notifications', label: 'Alerts' },
  { icon: Mail,    path: '/messages',      label: 'DMs' },
];

export default function MobileBottomNav({ onMenuOpen }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      {TABS.map(({ icon: Icon, path, label }) => {
        const active = pathname === path;
        return (
          <Link key={path} to={path} style={{ textDecoration: 'none' }}>
            <motion.div whileTap={{ scale: 0.82 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 14px' }}>
              <div style={{ position: 'relative' }}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8}
                  color={active ? 'var(--blue)' : 'var(--text-3)'} />
                {active && (
                  <motion.div layoutId="bnav-dot" style={{
                    position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: '50%', background: 'var(--blue)',
                    boxShadow: '0 0 6px var(--blue)',
                  }} />
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? 'var(--blue)' : 'var(--text-3)', fontFamily: 'var(--font-body)' }}>
                {label}
              </span>
            </motion.div>
          </Link>
        );
      })}

      {user && (
        <Link to={`/profile/${user.username}`} style={{ textDecoration: 'none' }}>
          <motion.div whileTap={{ scale: 0.82 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 14px' }}>
            {user.profilePicture
              ? <img src={user.profilePicture} style={{ width: 25, height: 25, borderRadius: 7, objectFit: 'cover', outline: pathname.startsWith('/profile') ? '2px solid var(--blue)' : 'none', outlineOffset: 2 }} alt="" />
              : <div style={{ width: 25, height: 25, borderRadius: 7, background: 'linear-gradient(135deg,var(--blue),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
            }
            <span style={{ fontSize: 10, fontWeight: 600, color: pathname.startsWith('/profile') ? 'var(--blue)' : 'var(--text-3)', fontFamily: 'var(--font-body)' }}>Me</span>
          </motion.div>
        </Link>
      )}
    </nav>
  );
}