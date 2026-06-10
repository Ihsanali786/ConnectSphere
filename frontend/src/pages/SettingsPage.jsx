import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Palette, LogOut, ChevronRight, Lock, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SECTIONS = [
  { title: 'Account', items: [
    { id: 'profile', icon: User,   label: 'Edit Profile',     desc: 'Name, bio, photo',    color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
    { id: 'password', icon: Lock,   label: 'Change Password',  desc: 'Update security',     color: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
    { id: 'linked', icon: Globe,  label: 'Linked Accounts',  desc: 'Connect socials',     color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
  ]},
  { title: 'Preferences', items: [
    { id: 'notifications', icon: Bell,    label: 'Notifications',   desc: 'Alerts & emails',     color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    { id: 'appearance', icon: Palette, label: 'Appearance',      desc: 'Theme & layout',      color: '#fb7185', bg: 'rgba(244,63,94,0.1)' },
  ]},
  { title: 'Privacy', items: [
    { id: 'privacy', icon: Shield,  label: 'Privacy Settings', desc: 'Control your data',  color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
  ]},
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const doLogout = async () => {
    await logout(); toast.success('Logged out 👋'); navigate('/');
  };

  const handleItemClick = (id) => {
    if (id === 'password') setShowPasswordForm((v) => !v);
    else if (id === 'profile') navigate(`/profile/${user?.username}`);
    else toast('Coming soon');
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.next.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setPwSaving(true);
    try {
      await api.patch('/auth/password', { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwForm({ current: '', next: '', confirm: '' });
      setShowPasswordForm(false);
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div style={{ paddingTop: 16, paddingBottom: 40 }}>
      <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg,#3b82f6,#8b5cf6)' }} />
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>Settings</h1>
      </div>

      <div style={{ margin: '0 16px 20px', background: 'rgba(15,24,36,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar user={user} size="lg" ring />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#f1f5f9', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName || user?.username}</p>
          <p style={{ margin: '2px 0', fontSize: 12, color: '#475569' }}>@{user?.username}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#334155' }}>{user?.email}</p>
        </div>
      </div>

      <AnimatePresence>
        {showPasswordForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={changePassword}
            style={{ margin: '0 16px 16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, overflow: 'hidden' }}>
            <p style={{ margin: '0 0 12px', fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>Change Password</p>
            {['current', 'next', 'confirm'].map((key) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <input type="password" required className="input" placeholder={key === 'current' ? 'Current password' : key === 'next' ? 'New password' : 'Confirm new password'}
                  value={pwForm[key]} onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })} minLength={key === 'current' ? undefined : 8} />
              </div>
            ))}
            <button type="submit" disabled={pwSaving} className="btn btn-primary" style={{ width: '100%' }}>
              {pwSaving ? 'Saving…' : 'Update Password'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div style={{ padding: '0 16px' }}>
        {SECTIONS.map(({ title, items }) => (
          <div key={title} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, paddingLeft: 4 }}>{title}</p>
            <div style={{ background: 'rgba(15,24,36,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
              {items.map(({ id, icon: Ic, label, desc, color, bg }, i) => (
                <motion.div key={label} whileHover={{ x: 2 }} onClick={() => handleItemClick(id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer', borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ic size={16} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{label}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>{desc}</p>
                  </div>
                  <ChevronRight size={15} color="#334155" />
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        <motion.button whileTap={{ scale: 0.98 }} onClick={doLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 16, border: '1px solid rgba(244,63,94,0.2)', background: 'rgba(244,63,94,0.06)', cursor: 'pointer', marginBottom: 24, boxSizing: 'border-box' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={16} color="#fb7185" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fb7185' }}>Sign Out</p>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(251,113,133,0.5)' }}>End your current session</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
