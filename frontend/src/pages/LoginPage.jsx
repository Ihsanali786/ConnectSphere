import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--bg)', position: 'relative' }}>
      <div className="page-bg"><div className="dot-grid" /></div>

      <motion.div initial={{ opacity: 0, y: 22, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.36, ease: [0.16,1,0.3,1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        <div style={{
          background: 'rgba(10,15,26,0.92)', backdropFilter: 'blur(28px)',
          border: '1px solid var(--border-md)', borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(79,142,247,0.05)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <motion.div whileHover={{ rotate: 8, scale: 1.08 }}
              style={{
                width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px',
                background: 'linear-gradient(135deg, var(--blue), var(--violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px var(--blue-glow)',
              }}>
              <Zap size={24} color="#fff" strokeWidth={2.5} />
            </motion.div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--text-1)', marginBottom: 5 }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Sign in to ConnectSphere</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="you@example.com" className="input" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="••••••••" className="input" style={{ paddingLeft: 38, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02, boxShadow: '0 6px 24px var(--blue-glow)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 14, borderRadius: 13, marginTop: 4, opacity: loading ? 0.75 : 1 }}>
              {loading
                ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin .6s linear infinite' }} />
                : <>Sign In <ArrowRight size={15} /></>
              }
            </motion.button>
          </form>

          <div style={{ margin: '18px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}