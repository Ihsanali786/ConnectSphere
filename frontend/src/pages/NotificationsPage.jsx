import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { SocketContext } from '../context/SocketContext';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';

function ago(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`; return `${Math.floor(s / 86400)}d`;
}

const TYPE = {
  like:    { icon: Heart,         color: '#fb7185', bg: 'rgba(244,63,94,0.12)',   label: 'liked your post' },
  comment: { icon: MessageCircle, color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  label: 'commented on your post' },
  follow:  { icon: UserPlus,      color: '#34d399', bg: 'rgba(16,185,129,0.12)', label: 'started following you' },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    api.get('/notifications?page=1&limit=20')
      .then(({ data }) => {
        setNotifs(data.notifications || []);
        setHasMore((data.currentPage || 1) < (data.pages || 0));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (n) => setNotifs((p) => [n, ...p]);
    socket.on('newNotification', handler);
    return () => socket.off('newNotification', handler);
  }, [socket]);

  const markRead = async () => {
    try {
      await api.put('/notifications/mark-read');
      setNotifs((p) => p.map((n) => ({ ...n, read: true })));
      toast.success('All read ✓');
    } catch {}
  };

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    try {
      const { data } = await api.get(`/notifications?page=${next}&limit=20`);
      setNotifs((p) => [...p, ...(data.notifications || [])]);
      setPage(next);
      setHasMore((data.currentPage || next) < (data.pages || 0));
    } finally {
      setLoadingMore(false);
    }
  };

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg,#3b82f6,#8b5cf6)' }} />
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>Notifications</h1>
          {unread > 0 && <span style={{ background: '#f43f5e', color: 'white', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{unread}</span>}
        </div>
        {unread > 0 && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={markRead}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <CheckCheck size={13} /> Mark all read
          </motion.button>
        )}
      </div>

      <div style={{ padding: '0 16px' }}>
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: 12, marginBottom: 8, background: 'rgba(15,24,36,0.7)', borderRadius: 14 }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 12, marginBottom: 8, width: '60%' }} />
                <div className="skeleton" style={{ height: 10, width: '40%' }} />
              </div>
            </div>
          ))
        ) : notifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🔔</div>
            <h3 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>All quiet here</h3>
            <p style={{ color: '#475569', fontSize: 14 }}>Notifications appear when people interact with you</p>
          </div>
        ) : (
          <>
            <div style={{ background: 'rgba(15,24,36,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden' }}>
              <AnimatePresence>
                {notifs.map((n, i) => {
                  const cfg = TYPE[n.type] || TYPE.like;
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={n._id}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.4) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                        borderBottom: i < notifs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: !n.read ? 'rgba(59,130,246,0.04)' : 'transparent',
                      }}>
                      <div style={{ position: 'relative' }}>
                        <Avatar user={n.sender} size="sm" />
                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #070b14' }}>
                          <Icon size={9} color={cfg.color} />
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#e2e8f0', lineHeight: 1.4 }}>
                          <Link to={`/profile/${n.sender?.username}`} style={{ fontWeight: 700, color: 'white', textDecoration: 'none' }}>@{n.sender?.username}</Link>
                          {' '}<span style={{ color: '#94a3b8' }}>{cfg.label}</span>
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#475569' }}>{ago(n.createdAt)}</p>
                      </div>
                      {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                <button type="button" onClick={loadMore} disabled={loadingMore} className="btn btn-ghost" style={{ width: '100%' }}>
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
