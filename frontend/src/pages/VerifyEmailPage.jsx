import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  const [status, setStatus] = useState(token ? 'loading' : 'error');

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await api.post('/auth/verify-email', { token });
        await loadUser();
        setStatus('success');
        toast.success('Email verified!');
      } catch (err) {
        setStatus('error');
        toast.error(err.response?.data?.message || 'Verification failed');
      }
    })();
  }, [token, loadUser]);

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--bg)', position: 'relative' }}>
      <div className="page-bg"><div className="dot-grid" /></div>
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'rgba(10,15,26,0.92)', backdropFilter: 'blur(28px)', border: '1px solid var(--border-md)', borderRadius: 24, padding: '48px 32px' }}>
          {status === 'loading' && <p style={{ color: 'var(--text-2)' }}>Verifying your email…</p>}
          {status === 'success' && (
            <>
              <CheckCircle size={48} color="var(--green)" style={{ marginBottom: 16 }} />
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--text-1)', marginBottom: 8 }}>Email verified!</h1>
              <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 20 }}>Your account is fully activated.</p>
              <Link to="/home" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go to Home</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <Zap size={40} color="var(--rose)" style={{ marginBottom: 16 }} />
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--text-1)', marginBottom: 8 }}>Verification failed</h1>
              <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 20 }}>The link may be invalid or expired.</p>
              <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700 }}>Sign in to resend</Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
