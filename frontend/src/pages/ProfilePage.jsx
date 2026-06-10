import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Link as LinkIcon, Calendar, Edit3, CheckCircle, Grid, List, Camera, Save, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/post/PostCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me, updateUser } = useAuth();
  const [profile,   setProfile]   = useState(null);
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [following, setFollowing] = useState(false);
  const [editOpen,  setEditOpen]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [tab,       setTab]       = useState('posts');
  const [postsPage, setPostsPage] = useState(1);
  const [postsPages, setPostsPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [form, setForm] = useState({ fullName:'', bio:'', location:'', website:'' });

  // Photo upload states
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview,   setPhotoPreview]   = useState(null);
  const avatarFileRef = useRef();
  const coverFileRef  = useRef();

  const isOwn = me?.username === username;

  useEffect(() => {
    setLoading(true); setProfile(null); setPosts([]); setEditOpen(false); setTab('posts'); setPostsPage(1);
    api.get(`/users/${username}?page=1&limit=10`)
      .then(({ data }) => {
        setProfile(data.user); setPosts(data.posts);
        setPostsPages(data.postsPages || 1);
        setFollowing(data.user.isFollowing ?? data.user.followers?.some((f) => f._id === me?._id));
        setForm({ fullName: data.user.fullName||'', bio: data.user.bio||'', location: data.user.location||'', website: data.user.website||'' });
      })
      .catch(() => toast.error('Profile not found'))
      .finally(() => setLoading(false));
  }, [username]);

  const loadMorePosts = async () => {
    const next = postsPage + 1;
    setLoadingMore(true);
    try {
      const { data } = await api.get(`/users/${username}?page=${next}&limit=10`);
      setPosts((prev) => [...prev, ...data.posts]);
      setPostsPage(next);
    } catch {
      toast.error('Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Profile photo upload ──────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Images only'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return; }

    // Instant local preview
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setUploadingPhoto(true);

    try {
      const fd = new FormData();
      fd.append('profilePicture', file);
      const { data } = await api.put('/users/profile/update', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(p => ({ ...p, profilePicture: data.profilePicture }));
      updateUser({ profilePicture: data.profilePicture });
      setPhotoPreview(null);
      toast.success('Profile photo updated! 📸');
    } catch {
      setPhotoPreview(null);
      toast.error('Upload failed — try again');
    } finally {
      setUploadingPhoto(false);
      URL.revokeObjectURL(preview);
    }
  };

  // ── Cover photo upload ─────────────────────────────────────────────────────
  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const toastId = toast.loading('Uploading cover…');
    try {
      const fd = new FormData();
      fd.append('coverPhoto', file);
      const { data } = await api.put('/users/profile/update', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(p => ({ ...p, coverPhoto: data.coverPhoto }));
      updateUser({ coverPhoto: data.coverPhoto });
      toast.success('Cover updated!', { id: toastId });
    } catch {
      toast.error('Upload failed', { id: toastId });
    }
  };

  const handleFollow = async () => {
    try {
      const { data } = await api.put(`/users/follow/${profile._id}`);
      setFollowing(data.isFollowing);
      setProfile(p => ({
        ...p,
        followers: data.isFollowing
          ? [...p.followers, { _id: me._id }]
          : p.followers.filter(f => f._id !== me._id),
      }));
      toast.success(data.isFollowing ? 'Following! 🎉' : 'Unfollowed');
    } catch { toast.error('Failed'); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile/update', form);
      setProfile(p => ({ ...p, ...data }));
      updateUser(data);
      setEditOpen(false);
      toast.success('Profile updated ✨');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ paddingTop: 16 }}>
      <div className="skeleton" style={{ height: 150, borderRadius: 20, margin: '0 0 12px' }} />
      {Array(2).fill(0).map((_,i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)' }}>Profile not found</div>
  );

  const currentAvatar = photoPreview || profile.profilePicture;
  const mediaPosts = posts.filter(p => p.image);

  return (
    <div style={{ paddingTop: 0 }}>
      {/* ── Cover Banner ─────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 150, borderRadius: '0 0 0 0', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(79,142,247,0.4) 0%, rgba(155,116,247,0.3) 50%, rgba(247,96,122,0.25) 100%)' }}>
        {profile.coverPhoto && (
          <img src={profile.coverPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(5,8,15,0.7))' }} />

        {isOwn && (
          <>
            <input ref={coverFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
            <motion.button whileTap={{ scale: 0.92 }}
              onClick={() => coverFileRef.current?.click()}
              style={{
                position: 'absolute', top: 10, right: 10,
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 10,
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                backdropFilter: 'blur(8px)',
              }}>
              <Camera size={13} /> Change Cover
            </motion.button>
          </>
        )}
      </div>

      {/* ── Profile header ───────────────────────────────────── */}
      <div style={{ padding: '0 16px', marginTop: -52, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          {/* Avatar with click-to-change */}
          <div style={{ position: 'relative' }} className="photo-wrapper">
            {currentAvatar
              ? <img src={currentAvatar} style={{
                  width: 88, height: 88, borderRadius: 20, objectFit: 'cover',
                  border: '3.5px solid var(--bg)', display: 'block',
                  filter: uploadingPhoto ? 'brightness(0.6)' : 'none',
                  transition: 'filter .2s',
                }} alt="" />
              : <div style={{ width: 88, height: 88, borderRadius: 20, border: '3.5px solid var(--bg)',
                  background: 'linear-gradient(135deg,var(--blue),var(--violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>
                  {profile.username?.[0]?.toUpperCase()}
                </div>
            }

            {uploadingPhoto && (
              <div style={{ position: 'absolute', inset: 3, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' }} />
              </div>
            )}

            {isOwn && !uploadingPhoto && (
              <>
                <input ref={avatarFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                <div className="photo-overlay" style={{ borderRadius: 17 }}
                  onClick={() => avatarFileRef.current?.click()}>
                  <Camera size={22} color="#fff" />
                </div>
              </>
            )}
          </div>

          {/* Follow / Edit buttons */}
          <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
            {isOwn ? (
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setEditOpen(!editOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                  borderRadius: 12, border: '1.5px solid var(--border-md)',
                  background: editOpen ? 'var(--bg-3)' : 'transparent',
                  color: 'var(--text-1)', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'all .18s',
                }}>
                <Edit3 size={13} /> Edit Profile
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleFollow}
                style={{
                  padding: '8px 22px', borderRadius: 12, cursor: 'pointer',
                  background: following ? 'var(--bg-3)' : 'linear-gradient(135deg, var(--blue), #3060d8)',
                  color: 'var(--text-1)', fontSize: 13, fontWeight: 800,
                  fontFamily: 'var(--font-body)',
                  border: following ? '1.5px solid var(--border-md)' : 'none',
                  boxShadow: following ? 'none' : '0 2px 16px var(--blue-glow)',
                  transition: 'all .18s',
                }}>
                {following ? 'Following' : 'Follow'}
              </motion.button>
            )}
          </div>
        </div>

        {/* Name, bio, meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>
            {profile.fullName || profile.username}
          </h1>
          {profile.isVerified && <CheckCircle size={17} className="verified" />}
        </div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-3)' }}>@{profile.username}</p>
        {profile.bio && (
          <p style={{ margin: '0 0 10px', fontSize: 14, color: '#9aabcc', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
            {profile.bio}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          {profile.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-3)' }}>
              <MapPin size={12} />{profile.location}
            </span>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}>
              <LinkIcon size={12} />{profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-3)' }}>
            <Calendar size={12} />Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month:'long', year:'numeric' })}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { v: profile.followingCount ?? profile.following?.length ?? 0, l: 'Following' },
            { v: profile.followerCount ?? profile.followers?.length ?? 0, l: 'Followers' },
            { v: posts.length, l: 'Posts' },
          ].map(({ v, l }) => (
            <div key={l} style={{
              padding: '8px 14px', borderRadius: 12,
              background: 'var(--bg-3)', border: '1px solid var(--border)',
              textAlign: 'center', minWidth: 72,
            }}>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 16, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>{v}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Edit form ─────────────────────────────────────────── */}
      <AnimatePresence>
        {editOpen && isOwn && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{
              margin: '0 0 12px',
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 18, overflow: 'hidden',
            }}>
            <div style={{ padding: '16px 16px 14px' }}>
              <p style={{ margin: '0 0 14px', fontWeight: 800, fontSize: 15, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>
                Edit Profile
              </p>
              {[
                { k: 'fullName', l: 'Full Name',  ph: 'Your display name' },
                { k: 'bio',      l: 'Bio',        ph: 'Tell people about yourself', multi: true },
                { k: 'location', l: 'Location',   ph: 'City, Country' },
                { k: 'website',  l: 'Website',    ph: 'https://yoursite.com' },
              ].map(({ k, l, ph, multi }) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{l}</label>
                  {multi
                    ? <textarea value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} placeholder={ph} rows={2}
                        className="input" style={{ resize: 'none' }} />
                    : <input value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} placeholder={ph}
                        className="input" />
                  }
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                  className="btn btn-primary" style={{ flex: 1 }}>
                  {saving ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin .6s linear infinite' }} /> : <><Save size={13} /> Save Changes</>}
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEditOpen(false)}
                  className="btn btn-ghost">
                  <X size={13} /> Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
        {[{ id:'posts',icon:List,label:'Posts'},{id:'media',icon:Grid,label:'Media'}].map(({ id, icon: Ic, label }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)',
              color: tab === id ? 'var(--blue)' : 'var(--text-3)',
              position: 'relative',
              transition: 'color .18s',
            }}>
            <Ic size={14} />{label}
            {tab === id && (
              <motion.div layoutId="profileTab" style={{
                position: 'absolute', bottom: -1, left: 0, right: 0,
                height: 2, borderRadius: 1,
                background: 'linear-gradient(90deg, var(--blue), var(--violet))',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>
          <p style={{ fontWeight: 800, color: 'var(--text-1)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>No posts yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {isOwn ? 'Share your first post!' : `${profile.username} hasn't posted yet`}
          </p>
        </div>
      ) : tab === 'media' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, marginTop: 4 }}>
          {mediaPosts.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 6, cursor: 'pointer' }}>
              <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                alt="" />
            </motion.div>
          ))}
        </div>
      ) : (
        posts.map(p => (
          <PostCard key={p._id} post={p}
            onLike={async id => {
              const { data } = await api.put(`/posts/${id}/like`);
              setPosts(pr => pr.map(x => x._id===id ? {...x,likes:data.likes} : x));
            }}
            onDelete={async id => {
              await api.delete(`/posts/${id}`);
              setPosts(pr => pr.filter(x => x._id!==id));
              toast.success('Post deleted');
            }}
          />
        ))
      )}

      {tab === 'posts' && postsPage < postsPages && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <button type="button" onClick={loadMorePosts} disabled={loadingMore} className="btn btn-ghost" style={{ width: '100%', maxWidth: 260 }}>
            {loadingMore ? 'Loading…' : 'Load more posts'}
          </button>
        </div>
      )}
    </div>
  );
}