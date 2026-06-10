import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Zap } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Check your email for a reset link');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--bg)', position: 'relative' }}>
      <div className="page-bg"><div className="dot-grid" /></div>
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'rgba(10,15,26,0.92)', backdropFilter: 'blur(28px)', border: '1px solid var(--border-md)', borderRadius: 24, padding: '36px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px', background: 'linear-gradient(135deg, var(--blue), var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} color="#fff" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--text-1)', marginBottom: 5 }}>Forgot password?</h1>
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>{sent ? 'If an account exists, we sent a reset link.' : 'Enter your email to receive a reset link'}</p>
          </div>

          {!sent && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input" style={{ paddingLeft: 38 }} />
                </div>
              </div>
              <motion.button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                {loading ? 'Sending…' : <>Send Reset Link <ArrowRight size={15} /></>}
              </motion.button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 18 }}>
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' }}>Back to sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
