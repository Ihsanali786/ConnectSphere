import { useEffect, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useFeed } from '../hooks/useFeed';
import { useAuth } from '../hooks/useAuth';
import { SocketContext } from '../context/SocketContext';
import CreatePost from '../components/post/CreatePost';
import PostCard from '../components/post/PostCard';
import SkeletonCard from '../components/ui/SkeletonCard';

export default function HomePage() {
  const { user } = useAuth();
  const {
    posts, loading, isFetching, hasMore, page,
    fetchFeed, fetchNextPage, likePost, deletePost, addPost, patchPost, removePost,
  } = useFeed();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket || !posts.length) return;
    posts.forEach((p) => socket.emit('joinPost', p._id));
    return () => posts.forEach((p) => socket.emit('leavePost', p._id));
  }, [socket, posts]);

  useEffect(() => {
    if (!socket) return;

    const onLike = ({ postId, likes, likeCount }) => {
      patchPost(postId, (p) => ({
        ...p,
        likes,
        likeCount: likeCount ?? likes?.length ?? 0,
        isLiked: likes?.some((id) => (id._id || id).toString() === user?._id?.toString()),
      }));
    };
    const onDelete = (id) => removePost(id);
    const onNewPost = (post) => addPost(post);

    socket.on('postLiked', onLike);
    socket.on('postDeleted', onDelete);
    socket.on('newPost', onNewPost);

    return () => {
      socket.off('postLiked', onLike);
      socket.off('postDeleted', onDelete);
      socket.off('newPost', onNewPost);
    };
  }, [socket, user?._id, patchPost, addPost, removePost]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, var(--blue), var(--violet))' }} />
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>Home</h1>
        </div>
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => fetchFeed(1)}
          disabled={isFetching}
          style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border-md)', background: 'var(--bg-3)', cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={15} style={{ animation: isFetching ? 'spin .7s linear infinite' : 'none' }} />
        </motion.button>
      </div>

      <CreatePost onPostCreated={addPost} />

      <AnimatePresence mode="popLayout">
        {loading && page === 1
          ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : posts.length === 0
          ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 60, marginBottom: 14 }}>🌍</div>
              <h3 style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Your feed is empty</h3>
              <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Follow people on Explore to fill your feed</p>
            </motion.div>
          )
          : posts.map((p) => (
            <PostCard key={p._id} post={p} onLike={likePost} onDelete={deletePost} />
          ))
        }
      </AnimatePresence>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => fetchNextPage()} disabled={isFetching}
            className="btn btn-ghost" style={{ width: '100%', maxWidth: 260, padding: '10px' }}>
            {isFetching
              ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border-md)', borderTopColor: 'var(--blue)', animation: 'spin .6s linear infinite' }} />
              : 'Load more posts'
            }
          </motion.button>
        </div>
      )}
    </div>
  );
}
