import { motion } from 'framer-motion';
import { MessageCircle, Zap } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: 'linear-gradient(180deg,#3b82f6,#8b5cf6)' }} />
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f1f5f9', fontFamily: 'Syne, sans-serif' }}>Messages</h1>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <div style={{ width: 96, height: 96, borderRadius: 28, background: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.15)' }}>
            <MessageCircle size={38} color="#60a5fa" />
          </div>
          <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ position: 'absolute', inset: -4, borderRadius: 32, border: '2px solid rgba(59,130,246,0.3)' }} />
        </div>
        <h3 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800, color: '#f1f5f9', fontFamily: 'Syne, sans-serif' }}>Direct Messages</h3>
        <p style={{ margin: '0 0 20px', color: '#475569', fontSize: 14, maxWidth: 280, lineHeight: 1.6 }}>Real-time private messaging is coming soon. Follow people and connect!</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <Zap size={13} color="#fbbf24" /><span style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24' }}>Coming soon</span>
        </div>
      </motion.div>
    </div>
  );
}