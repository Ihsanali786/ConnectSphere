import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, X, Send, Smile, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MAX_CHARS = 2000;

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent]   = useState('');
  const [media,   setMedia]     = useState(null); // { file, preview, type }
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const fileRef = useRef();
  const textRef = useRef();
  const submittingRef = useRef(false);

  const remaining = MAX_CHARS - content.length;
  const canPost = (content.trim() || media) && remaining >= 0 && !loading;

  const pickMedia = (file) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isImage && !isVideo) { toast.error('Only images and videos allowed'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('File must be under 50MB'); return; }
    setMedia({ file, preview: URL.createObjectURL(file), type: isVideo ? 'video' : 'image' });
  };

  const handleFileInput = (e) => pickMedia(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    pickMedia(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const removeMedia = () => {
    if (media?.preview) URL.revokeObjectURL(media.preview);
    setMedia(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!canPost) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setUploadPct(0);
    try {
      const fd = new FormData();
      if (content) fd.append('content', content);
      if (media?.file) fd.append('image', media.file); // backend field name is 'image'

      const { data } = await api.post('/posts/create', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setUploadPct(pct);
        },
      });

      setContent(''); removeMedia(); setFocused(false); setUploadPct(0);
      onPostCreated?.(data);
      toast.success('Posted! 🚀');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
      setUploadPct(0);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const AvatarEl = () => (
    user?.profilePicture
      ? <img src={user.profilePicture} style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} alt="" />
      : <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,var(--blue),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        margin: '0 0 12px',
        background: dragOver ? 'rgba(79,142,247,0.06)' : 'var(--bg-2)',
        border: `1.5px solid ${focused ? 'var(--blue)' : dragOver ? 'var(--blue)' : 'var(--border)'}`,
        borderRadius: 20,
        boxShadow: focused ? '0 0 0 3px var(--blue-dim)' : '0 4px 24px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        transition: 'border-color .18s, box-shadow .18s, background .18s',
      }}
    >
      {/* Upload progress bar */}
      <AnimatePresence>
        {loading && uploadPct > 0 && uploadPct < 100 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="progress-bar" style={{ borderRadius: 0 }}>
              <div className="progress-bar-fill" style={{ width: `${uploadPct}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ padding: '14px 14px 8px', display: 'flex', gap: 11 }}>
        <AvatarEl />
        <div style={{ flex: 1 }}>
          <textarea
            ref={textRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
            placeholder={focused ? "What's happening?" : `Share something, ${user?.fullName?.split(' ')[0] || user?.username}…`}
            rows={focused || content ? 3 : 1}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-1)', fontSize: 15, lineHeight: 1.55, resize: 'none',
              fontFamily: 'var(--font-body)', caretColor: 'var(--blue)',
              transition: 'rows .2s',
            }}
          />

          {/* Media preview */}
          <AnimatePresence>
            {media && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', position: 'relative' }}
              >
                {media.type === 'video'
                  ? <video src={media.preview} controls style={{ width: '100%', maxHeight: 300, borderRadius: 12, display: 'block', background: '#000' }} />
                  : <img src={media.preview} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block', borderRadius: 12 }} />
                }
                <button onClick={removeMedia} style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.75)', border: 'none', cursor: 'pointer',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <X size={13} />
                </button>
                <div style={{
                  position: 'absolute', bottom: 8, left: 8,
                  background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '2px 8px',
                  fontSize: 11, color: '#fff', fontFamily: 'var(--font-body)',
                }}>
                  {media.type === 'video' ? '🎬 Video' : '🖼 Photo'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag hint */}
          {!media && (focused || dragOver) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}>
              {dragOver ? '📥 Drop to attach media' : 'Drag & drop a photo or video, or click the icons below'}
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <AnimatePresence>
        {(focused || content || media) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              padding: '10px 14px 14px',
              borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: 4 }}>
              <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileInput} />
              {[
                { icon: Image, color: 'var(--blue)',   label: 'Photo', action: () => { if (fileRef.current) { fileRef.current.accept = 'image/*'; fileRef.current.click(); } } },
                { icon: Video, color: 'var(--green)',  label: 'Video', action: () => { if (fileRef.current) { fileRef.current.accept = 'video/*'; fileRef.current.click(); } } },
                { icon: Smile, color: 'var(--amber)',  label: 'Emoji', action: () => {} },
                { icon: MapPin,color: 'var(--violet)', label: 'Location', action: () => {} },
              ].map(({ icon: Ic, color, label, action }) => (
                <motion.button key={label} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
                  onClick={action} title={label}
                  style={{
                    width: 34, height: 34, borderRadius: 9, border: 'none',
                    background: 'var(--bg-3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-3)', transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.background = `${color}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'var(--bg-3)'; }}
                >
                  <Ic size={16} />
                </motion.button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Character counter ring */}
              {content.length > MAX_CHARS * 0.6 && (
                <svg width="26" height="26" viewBox="0 0 26 26" style={{ flexShrink: 0 }}>
                  <circle cx="13" cy="13" r="10" fill="none" stroke="var(--border-md)" strokeWidth="2.5" />
                  <circle cx="13" cy="13" r="10" fill="none"
                    stroke={remaining < 0 ? 'var(--rose)' : remaining < 50 ? 'var(--amber)' : 'var(--blue)'}
                    strokeWidth="2.5"
                    strokeDasharray={`${2 * Math.PI * 10}`}
                    strokeDashoffset={`${2 * Math.PI * 10 * (1 - Math.min(content.length / MAX_CHARS, 1))}`}
                    strokeLinecap="round"
                    transform="rotate(-90 13 13)"
                    style={{ transition: 'stroke-dashoffset .15s, stroke .15s' }}
                  />
                  {remaining <= 50 && (
                    <text x="13" y="17" textAnchor="middle" fontSize="8" fill={remaining < 0 ? 'var(--rose)' : 'var(--text-2)'}
                      fontFamily="var(--font-body)" fontWeight="700">
                      {remaining}
                    </text>
                  )}
                </svg>
              )}

              <motion.button
                whileHover={canPost ? { scale: 1.03 } : {}}
                whileTap={canPost ? { scale: 0.97 } : {}}
                onClick={handleSubmit}
                disabled={!canPost}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 12, border: 'none',
                  background: canPost ? 'linear-gradient(135deg, var(--blue), #3060d8)' : 'var(--bg-4)',
                  color: canPost ? '#fff' : 'var(--text-3)',
                  fontSize: 13, fontWeight: 700, cursor: canPost ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-body)',
                  boxShadow: canPost ? '0 2px 16px var(--blue-glow)' : 'none',
                  transition: 'all .18s',
                }}
              >
                {loading
                  ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin .6s linear infinite' }} />
                  : <><Send size={13} /> Post</>
                }
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
