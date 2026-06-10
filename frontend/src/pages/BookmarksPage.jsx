import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import PostCard from '../components/post/PostCard';
import SkeletonCard from '../components/ui/SkeletonCard';

export default function BookmarksPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me/bookmarks');
        setPosts(data.posts || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ padding: '0 16px 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg,#3b82f6,#8b5cf6)' }} />
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>Saved Posts</h1>
      </div>
      {!loading && <p style={{ padding: '0 16px 12px', margin: 0, fontSize: 12, color: '#334155' }}>{posts.length} saved</p>}

      {loading ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
      : posts.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '80px 32px' }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>🔖</div>
          <h3 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)' }}>No saved posts</h3>
          <p style={{ color: '#475569', fontSize: 13 }}>Tap the bookmark on any post to save it here</p>
        </motion.div>
      ) : posts.map((p) => (
        <PostCard key={p._id} post={p} isSaved
          onLike={async (id) => {
            const { data } = await api.put(`/posts/${id}/like`);
            setPosts((pr) => pr.map((x) => (x._id === id ? { ...x, likes: data.likes } : x)));
          }}
        />
      ))}
    </div>
  );
}
