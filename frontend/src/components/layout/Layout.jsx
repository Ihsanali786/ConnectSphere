import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';
import EmailVerificationBanner from './EmailVerificationBanner';

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const open  = useCallback(() => setDrawerOpen(true),  []);
  const close = useCallback(() => setDrawerOpen(false), []);

  return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)', position: 'relative' }}>
      {/* ambient bg */}
      <div className="page-bg"><div className="dot-grid" /></div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '100svh' }}>
        {/* Desktop sidebar — always mounted, CSS hides on mobile */}
        <LeftSidebar mode="desktop" onClose={close} />

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div key="bd"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={close}
                style={{
                  position: 'fixed', inset: 0, zIndex: 99,
                  background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                }}
              />
              <motion.div key="dr"
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                style={{ position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 100 }}
              >
                <LeftSidebar mode="mobile" onClose={close} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Feed */}
        <main className="main-content" style={{ flex: 1 }}>
          <div className="feed-inner">
            <EmailVerificationBanner />
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16,1,0.3,1] }}>
                <Outlet context={{ openSidebar: open }} />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNav onMenuOpen={open} />
    </div>
  );
}