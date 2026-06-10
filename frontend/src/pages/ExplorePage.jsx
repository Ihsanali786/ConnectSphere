import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/post/PostCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';

export default function ExplorePage() {
  const [posts,    setPosts]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [q,        setQ]       = useState('');
  const [results,  setResults] = useState([]);
  const [srching,  setSrching] = useState(false);
  const [open,     setOpen]    = useState(false);

  useEffect(() => {
    api.get('/posts/explore').then(({ data }) => setPosts(data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    setSrching(true);
    const t = setTimeout(async () => {
      try { const { data } = await api.get(`/users/search?q=${q}`); setResults(data); }
      finally { setSrching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const likePost = async (id) => {
    try {
      const { data } = await api.put(`/posts/${id}/like`);
      setPosts(p => p.map(x => x._id === id ? { ...x, likes: data.likes } : x));
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg,#3b82f6,#8b5cf6)' }} />
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f1f5f9', fontFamily: 'Syne, sans-serif' }}>Explore</h1>
      </div>

      {/* Search */}
      <div style={{ padding: '0 16px 14px', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input
            value={q} onChange={e => { setQ(e.target.value); setOpen(true); }}
            onFocus={(e) => { setOpen(true); e.target.style.borderColor = 'rgba(59,130,246,0.4)'; }}
            onBlur={(e) => { setTimeout(() => setOpen(false), 200); e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            placeholder="Search people, hashtags…"
            style={{
              width: '100%', background: 'rgba(15,24,36,0.9)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '11px 40px 11px 40px', color: '#e2e8f0', fontSize: 14, outline: 'none',
              fontFamily: 'DM Sans, sans-serif', backdropFilter: 'blur(12px)', boxSizing: 'border-box',
            }}
          />
          {q && <button onClick={() => setQ('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}><X size={14} /></button>}
        </div>

        <AnimatePresence>
          {open && q && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                position: 'absolute', top: '100%', left: 16, right: 16, zIndex: 50,
                background: 'rgba(10,18,32,0.98)', backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
                boxShadow: '0 16px 48px rgba(0,0,0,0.7)', overflow: 'hidden',
              }}
            >
              {srching ? (
                <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10, color: '#475569', fontSize: 13 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', animation: 'spin 0.7s linear infinite' }} />
                  Searching…
                </div>
              ) : results.length === 0 ? (
                <div style={{ padding: 16, color: '#475569', fontSize: 13 }}>No users found for "{q}"</div>
              ) : results.map((u, i) => (
                <Link key={u._id} to={`/profile/${u.username}`} style={{ textDecoration: 'none' }}>
                  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Avatar user={u} size="sm" />
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{u.fullName || u.username}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>@{u.username} · {u.followerCount ?? u.followers?.length ?? 0} followers</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? Array(4).fill(0).map((_,i) => <SkeletonCard key={i} />)
               : posts.map(p => <PostCard key={p._id} post={p} onLike={likePost} />)}
    </div>
  );
}