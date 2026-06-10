import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import api from '../api/axios';

function PasswordStrength({ pw }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(pw)).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'var(--rose)', 'var(--amber)', 'var(--blue)', 'var(--green)'];
  if (!pw) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= score ? colors[score] : 'var(--bg-4)', transition: 'background .3s' }} />
        ))}
      </div>
      <p style={{ fontSize: 10, color: colors[score], fontWeight: 700, margin: 0 }}>{labels[score]}</p>
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ fullName:'', username:'', email:'', password:'', confirm:'' });
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [avatar,  setAvatar]    = useState(null);
  const [preview, setPreview]   = useState('');
  const [checking, setChecking] = useState(false);
  const [usernameOk, setUsernameOk] = useState(null);

  const checkUsername = async (val) => {
    if (val.length < 3) { setUsernameOk(null); return; }
    setChecking(true);
    try {
      const { data } = await api.get(`/users/search?q=${val}`);
      setUsernameOk(!data.some(u => u.username.toLowerCase() === val.toLowerCase()));
    } catch { setUsernameOk(null); }
    finally { setChecking(false); }
  };

  const handleAvatarPick = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setAvatar(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.fullName);
      // Upload avatar if provided
      if (avatar) {
        try {
          const fd = new FormData();
          fd.append('profilePicture', avatar);
          await api.put('/users/profile/update', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } catch { /* non-critical */ }
      }
      toast.success('Welcome to ConnectSphere! 🎉');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--bg)', position: 'relative' }}>
      <div className="page-bg"><div className="dot-grid" /></div>

      <motion.div initial={{ opacity: 0, y: 22, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.36 }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        <div style={{
          background: 'rgba(10,15,26,0.92)', backdropFilter: 'blur(28px)',
          border: '1px solid var(--border-md)', borderRadius: 24, padding: '34px 30px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <motion.div whileHover={{ rotate: -6, scale: 1.08 }}
              style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px', background: 'linear-gradient(135deg, var(--violet), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px var(--violet-dim)' }}>
              <Zap size={24} color="#fff" strokeWidth={2.5} />
            </motion.div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--text-1)', marginBottom: 5 }}>Join ConnectSphere</h1>
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Create your free account</p>
          </div>

          {/* Avatar picker */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
            <label style={{ cursor: 'pointer', position: 'relative' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarPick} />
              {preview
                ? <img src={preview} style={{ width: 72, height: 72, borderRadius: 20, objectFit: 'cover', border: '2px solid var(--blue)' }} alt="" />
                : <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--bg-4)', border: '2px dashed var(--border-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Camera size={20} color="var(--text-3)" />
                    <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>Photo</span>
                  </div>
              }
              <div style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: 7, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={11} color="#fff" />
              </div>
            </label>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Full name */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type="text" required value={form.fullName} onChange={e => setForm({...form,fullName:e.target.value})}
                  placeholder="John Doe" className="input" style={{ paddingLeft: 36, fontSize: 13 }} />
              </div>
            </div>

            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 14, fontWeight: 600 }}>@</span>
                <input type="text" required value={form.username}
                  onChange={e => { const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''); setForm({...form,username:v}); checkUsername(v); }}
                  placeholder="yourhandle" className="input" style={{ paddingLeft: 30, fontSize: 13 }} />
                {checking && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--border-md)', borderTopColor: 'var(--blue)', animation: 'spin .6s linear infinite' }} />}
                {!checking && usernameOk === true  && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✅</span>}
                {!checking && usernameOk === false && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>❌</span>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})}
                  placeholder="you@example.com" className="input" style={{ paddingLeft: 36, fontSize: 13 }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({...form,password:e.target.value})}
                  placeholder="Min 6 characters" className="input" style={{ paddingLeft: 36, paddingRight: 38, fontSize: 13 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <PasswordStrength pw={form.password} />
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type="password" required value={form.confirm} onChange={e => setForm({...form,confirm:e.target.value})}
                  placeholder="Re-enter password" className="input"
                  style={{ paddingLeft: 36, fontSize: 13, borderColor: form.confirm && form.confirm !== form.password ? 'var(--rose)' : '' }} />
                {form.confirm && form.confirm === form.password && (
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>✅</span>
                )}
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 14, borderRadius: 13, marginTop: 4, background: 'linear-gradient(135deg, var(--violet), var(--blue))', opacity: loading ? 0.75 : 1 }}>
              {loading
                ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin .6s linear infinite' }} />
                : <>Create Account <ArrowRight size={15} /></>
              }
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 18, marginBottom: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}