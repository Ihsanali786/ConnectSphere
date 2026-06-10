import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Users, MessageCircle, Heart, Shield, Sparkles, TrendingUp } from 'lucide-react';

const FEATURES = [
  { icon: Zap,           color: 'var(--amber)',  bg: 'rgba(245,166,35,0.1)',  title: 'Real-Time Everything',    desc: 'Likes, comments, and notifications delivered instantly via WebSockets.' },
  { icon: Users,         color: 'var(--blue)',   bg: 'var(--blue-dim)',       title: 'Build Your Community',    desc: 'Follow people, grow your audience, and discover creators you love.' },
  { icon: MessageCircle, color: 'var(--violet)', bg: 'var(--violet-dim)',     title: 'Rich Conversations',      desc: 'Threaded comments, nested replies, and reaction support.' },
  { icon: TrendingUp,    color: 'var(--green)',  bg: 'var(--green-dim)',      title: 'Trending Discovery',      desc: 'Algorithmically ranked hashtags and explore feed.' },
  { icon: Heart,         color: 'var(--rose)',   bg: 'var(--rose-dim)',       title: 'Engaging Interactions',   desc: 'Animated likes, bookmarks, and share with a click.' },
  { icon: Shield,        color: 'var(--green)',  bg: 'var(--green-dim)',      title: 'Secure by Design',        desc: 'JWT authentication, bcrypt hashing, and protected routes.' },
];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } };

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)', overflow: 'hidden', fontFamily: 'var(--font-body)' }}>
      {/* Ambient */}
      <div className="page-bg"><div className="dot-grid" /></div>

      {/* Navbar */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(5,8,15,0.88)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 32px',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px var(--blue-glow)' }}>
            <Zap size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, color: 'var(--text-1)' }}>
            Connect<span style={{ color: 'var(--blue)' }}>Sphere</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>
              Sign In
            </motion.button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              Get Started
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: 140, paddingBottom: 80, textAlign: 'center', padding: '140px 24px 80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 16px', borderRadius: 99,
            background: 'var(--blue-dim)', border: '1px solid rgba(79,142,247,0.25)',
            marginBottom: 28,
          }}>
            <Sparkles size={13} color="var(--amber)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.02em' }}>
              Now live — ConnectSphere v1.0
            </span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.6, ease: [0.16,1,0.3,1] }}
          style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 1.05, color: 'var(--text-1)', marginBottom: 20, letterSpacing: '-0.02em' }}>
          Connect.{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--blue), var(--violet), var(--rose))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Share.
          </span>
          {' '}Discover.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          style={{ fontSize: 'clamp(15px,2.5vw,19px)', color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.65 }}>
          Build meaningful connections, share your moments, and discover communities — all in real time.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <motion.button whileHover={{ scale: 1.04, boxShadow: '0 8px 32px var(--blue-glow)' }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-primary"
              style={{ padding: '13px 30px', fontSize: 15, borderRadius: 14 }}>
              Get Started Free <ArrowRight size={16} />
            </motion.button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="btn btn-ghost"
              style={{ padding: '13px 28px', fontSize: 15, borderRadius: 14 }}>
              Sign In
            </motion.button>
          </Link>
        </motion.div>

        {/* Social proof avatars */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28 }}>
          <div style={{ display: 'flex' }}>
            {['F','A','K','S','M'].map((l, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 9, marginLeft: i ? -8 : 0,
                border: '2px solid var(--bg)',
                background: `hsl(${i*60 + 200},65%,55%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-display)',
              }}>{l}</div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
            Join <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>thousands</span> already connected
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(26px,5vw,40px)', color: 'var(--text-1)', marginBottom: 10 }}>
            Everything you need
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            Built with modern tech for a real social networking experience
          </p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
            <motion.div key={title} variants={fadeUp}
              whileHover={{ y: -5, boxShadow: `0 16px 48px rgba(0,0,0,0.5), 0 0 24px ${color}20` }}
              style={{
                background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 18,
                padding: '22px', transition: 'all .25s',
              }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--text-1)', marginBottom: 6 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{
            maxWidth: 640, margin: '0 auto', textAlign: 'center',
            background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 28,
            padding: '56px 40px', position: 'relative', overflow: 'hidden',
          }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(79,142,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,var(--blue),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 20px var(--blue-glow)' }}>
              <Zap size={24} color="#fff" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, color: 'var(--text-1)', marginBottom: 10 }}>
              Ready to connect?
            </h2>
            <p style={{ color: 'var(--text-2)', marginBottom: 28, fontSize: 15 }}>
              Create your free account and start sharing today.
            </p>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <motion.button whileHover={{ scale: 1.04, boxShadow: '0 8px 32px var(--blue-glow)' }}
                whileTap={{ scale: 0.97 }} className="btn btn-primary"
                style={{ padding: '13px 36px', fontSize: 15, borderRadius: 14 }}>
                Create Free Account <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer style={{ textAlign: 'center', padding: '16px 0 32px', color: 'var(--text-3)', fontSize: 12, borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        © 2025 ConnectSphere · MERN Stack · Built with passion
      </footer>
    </div>
  );
}