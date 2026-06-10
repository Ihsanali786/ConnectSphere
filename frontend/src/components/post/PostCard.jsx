import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Trash2, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import toast from 'react-hot-toast';

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Av({ user, size = 38, r = 11 }) {
  if (!user) return null;
  if (user.profilePicture)
    return <img src={user.profilePicture} style={{ width: size, height: size, borderRadius: r, objectFit: 'cover', flexShrink: 0 }} alt="" />;
  return (
    <div style={{ width: size, height: size, borderRadius: r, flexShrink: 0,
      background: 'linear-gradient(135deg,var(--blue),var(--violet))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 900, fontSize: size * 0.36, fontFamily: 'var(--font-display)' }}>
      {user.username?.[0]?.toUpperCase()}
    </div>
  );
}

export default function PostCard({ post, onLike, onDelete, isSaved: isSavedProp }) {
  const { user, updateUser } = useAuth();
  const isBookmarked = (id) =>
    user?.bookmarks?.some((b) => (b._id || b).toString() === id.toString());

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]   = useState(post.comments || []);
  const [cmtText,  setCmtText]    = useState('');
  const [sending,  setSending]    = useState(false);
  const [saved,    setSaved]      = useState(isSavedProp ?? post.isSaved ?? isBookmarked(post._id));
  const [menu,     setMenu]       = useState(false);
  const [hearts,   setHearts]     = useState([]);
  const [imgLoaded, setImgLoaded] = useState(false);

  const liked = post.isLiked ?? post.likes?.some(
    (id) => (id._id || id).toString() === user?._id?.toString()
  );
  const isOwner = post.author?._id === user?._id;

  useEffect(() => {
    setSaved(isSavedProp ?? post.isSaved ?? isBookmarked(post._id));
  }, [post._id, post.isSaved, isSavedProp, user?.bookmarks]);

  const doLike = useCallback(() => {
    const id = Date.now();
    setHearts(h => [...h, id]);
    setTimeout(() => setHearts(h => h.filter(x => x !== id)), 800);
    onLike?.(post._id);
  }, [post._id, onLike]);

  const doSave = async () => {
    try {
      const { data } = await api.put(`/posts/${post._id}/save`);
      setSaved(data.isSaved);
      const nextBookmarks = data.isSaved
        ? [...(user?.bookmarks || []), post._id]
        : (user?.bookmarks || []).filter(
            (b) => (b._id || b).toString() !== post._id.toString()
          );
      updateUser({ bookmarks: nextBookmarks });
      toast.success(data.isSaved ? 'Saved to bookmarks!' : 'Unsaved');
    } catch { toast.error('Failed'); }
  };

  const doComment = async () => {
    if (!cmtText.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await api.post(`/comments/${post._id}`, { content: cmtText });
      setComments(p => [...p, data]);
      setCmtText('');
    } catch { toast.error('Failed to comment'); }
    finally { setSending(false); }
  };

  const doShare = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/home`);
    toast.success('Link copied!');
  };

  const renderText = (txt) => txt.split(/(\s+)/).map((w, i) =>
    w.startsWith('#')
      ? <span key={i} style={{ color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}>{w}</span>
      : w.startsWith('@')
      ? <span key={i} style={{ color: 'var(--violet)', fontWeight: 600, cursor: 'pointer' }}>{w}</span>
      : w
  );

  // Detect if attached media is video
  const isVideo = post.image && (
    post.image.includes('/video/') || post.image.match(/\.(mp4|webm|mov|avi)(\?|$)/i)
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      layout
      style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        marginBottom: 10,
        overflow: 'hidden',
        transition: 'border-color .2s, box-shadow .2s, transform .2s',
        position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-md)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 14px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to={`/profile/${post.author?.username}`} style={{ flexShrink: 0 }}>
            <Av user={post.author} />
          </Link>
          <div>
            <Link to={`/profile/${post.author?.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>
                {post.author?.fullName || post.author?.username}
              </span>
              {post.author?.isVerified && <CheckCircle size={13} className="verified" />}
            </Link>
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>
              @{post.author?.username} · {timeAgo(post.createdAt)}
              {post.isEdited && ' · edited'}
            </p>
          </div>
        </div>

        {isOwner && (
          <div style={{ position: 'relative' }}>
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => setMenu(!menu)}
              style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MoreHorizontal size={16} />
            </motion.button>

            <AnimatePresence>
              {menu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.88, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', right: 0, top: 36, zIndex: 20,
                      background: 'rgba(8,12,22,0.98)', backdropFilter: 'blur(20px)',
                      border: '1px solid var(--border-md)', borderRadius: 12, padding: 5,
                      minWidth: 140, boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
                    }}
                  >
                    <button onClick={() => { onDelete?.(post._id); setMenu(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--rose)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-dim)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 size={14} /> Delete Post
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Text content */}
      {post.content && (
        <div style={{ padding: '0 14px 10px' }}>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: '#c5d0e8', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)' }}>
            {renderText(post.content)}
          </p>
        </div>
      )}

      {/* Media */}
      {post.image && (
        <div style={{ position: 'relative', background: 'var(--bg)' }}>
          {/* Skeleton while loading */}
          {!imgLoaded && !isVideo && (
            <div className="skeleton" style={{ width: '100%', height: 260 }} />
          )}
          {isVideo
            ? <video src={post.image} controls playsInline
                style={{ width: '100%', maxHeight: 480, display: 'block', background: '#000' }} />
            : <img src={post.image} alt="Post media" loading="lazy"
                onLoad={() => setImgLoaded(true)}
                style={{
                  width: '100%', maxHeight: 480, objectFit: 'cover', display: imgLoaded ? 'block' : 'none',
                  transition: 'transform .4s',
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.012)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
          }
          {/* Floating hearts overlay */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {hearts.map(id => (
              <div key={id} style={{
                position: 'absolute', left: '50%', top: '40%',
                transform: 'translateX(-50%)',
                fontSize: 40, lineHeight: 1,
                animation: 'floatHeart 0.8s ease-out forwards',
              }}>❤️</div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px', borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {/* Like */}
          <motion.button whileTap={{ scale: 0.8 }} onClick={doLike}
            className="action-btn"
            style={{ color: liked ? 'var(--rose)' : 'var(--text-2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--rose-dim)'; e.currentTarget.style.color = 'var(--rose)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = liked ? 'var(--rose)' : 'var(--text-2)'; }}
          >
            <motion.div animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart size={17} fill={liked ? 'var(--rose)' : 'none'} />
            </motion.div>
            <span>{post.likeCount ?? post.likes?.length ?? 0}</span>
          </motion.button>

          {/* Comment */}
          <motion.button whileTap={{ scale: 0.85 }}
            className="action-btn"
            onClick={() => setShowComments(!showComments)}
            style={{ color: showComments ? 'var(--blue)' : 'var(--text-2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-dim)'; e.currentTarget.style.color = 'var(--blue)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = showComments ? 'var(--blue)' : 'var(--text-2)'; }}
          >
            <MessageCircle size={17} />
            <span>{comments.length}</span>
          </motion.button>

          {/* Share */}
          <motion.button whileTap={{ scale: 0.85 }}
            className="action-btn"
            onClick={doShare}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--violet-dim)'; e.currentTarget.style.color = 'var(--violet)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
          >
            <Share2 size={17} />
          </motion.button>
        </div>

        {/* Bookmark */}
        <motion.button whileTap={{ scale: 0.82 }} onClick={doSave}
          className="action-btn"
          style={{ color: saved ? 'var(--blue)' : 'var(--text-2)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-dim)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Bookmark size={17} fill={saved ? 'var(--blue)' : 'none'} />
        </motion.button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div style={{ maxHeight: 220, overflowY: 'auto', padding: '10px 12px 6px' }}>
              {comments.length === 0
                ? <p style={{ color: 'var(--text-3)', fontSize: 12, textAlign: 'center', padding: '6px 0' }}>No comments yet. Be first!</p>
                : comments.map((c, i) => (
                  <motion.div key={c._id || i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.035 }}
                    style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Av user={c.user} size={28} r={8} />
                    <div style={{ flex: 1, background: 'var(--bg-3)', borderRadius: 10, padding: '7px 10px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>@{c.user?.username} </span>
                      <span style={{ fontSize: 12, color: 'var(--text-1)' }}>{c.content}</span>
                    </div>
                  </motion.div>
                ))
              }
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '8px 12px 12px', alignItems: 'center' }}>
              <Av user={user} size={28} r={8} />
              <input value={cmtText}
                onChange={e => setCmtText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && doComment()}
                placeholder="Add a comment…"
                className="input"
                style={{ flex: 1, padding: '8px 12px', fontSize: 12, borderRadius: 10 }}
              />
              <motion.button whileTap={{ scale: 0.9 }} onClick={doComment}
                disabled={!cmtText.trim() || sending}
                style={{
                  width: 32, height: 32, borderRadius: 9, border: 'none', cursor: cmtText.trim() ? 'pointer' : 'not-allowed',
                  background: cmtText.trim() ? 'var(--blue)' : 'var(--bg-4)',
                  color: cmtText.trim() ? '#fff' : 'var(--text-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .15s', flexShrink: 0,
                }}>
                {sending
                  ? <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin .6s linear infinite' }} />
                  : <Send size={13} />
                }
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}