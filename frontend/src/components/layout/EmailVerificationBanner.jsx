import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function EmailVerificationBanner() {
  const { user, resendVerification } = useAuth();
  const [sending, setSending] = useState(false);

  if (!user || user.isEmailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerification();
      toast.success('Verification email sent — check your inbox');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: '10px 14px', marginBottom: 12, borderRadius: 14,
      background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <Mail size={16} color="var(--amber)" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>
          Please verify your email to secure your account.
        </p>
      </div>
      <button type="button" onClick={handleResend} disabled={sending}
        className="btn btn-ghost" style={{ flexShrink: 0, padding: '6px 12px', fontSize: 12 }}>
        {sending ? 'Sending…' : 'Resend'}
      </button>
    </div>
  );
}
