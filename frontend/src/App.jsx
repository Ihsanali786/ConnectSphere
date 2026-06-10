import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));

function Spinner() {
  return (
    <div style={{
      minHeight: '100vh', background: '#070b14',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#475569', fontSize: '14px' }}>Loading ConnectSphere…</p>
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Navigate to="/home" replace /> : children;
}

function Lazy({ children }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Public><Lazy><LandingPage /></Lazy></Public>} />
      <Route path="/login" element={<Public><Lazy><LoginPage /></Lazy></Public>} />
      <Route path="/register" element={<Public><Lazy><RegisterPage /></Lazy></Public>} />
      <Route path="/forgot-password" element={<Public><Lazy><ForgotPasswordPage /></Lazy></Public>} />
      <Route path="/reset-password" element={<Public><Lazy><ResetPasswordPage /></Lazy></Public>} />
      <Route path="/verify-email" element={<Lazy><VerifyEmailPage /></Lazy>} />

      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/home" element={<Lazy><HomePage /></Lazy>} />
        <Route path="/explore" element={<Lazy><ExplorePage /></Lazy>} />
        <Route path="/notifications" element={<Lazy><NotificationsPage /></Lazy>} />
        <Route path="/messages" element={<Lazy><MessagesPage /></Lazy>} />
        <Route path="/bookmarks" element={<Lazy><BookmarksPage /></Lazy>} />
        <Route path="/settings" element={<Lazy><SettingsPage /></Lazy>} />
        <Route path="/profile/:username" element={<Lazy><ProfilePage /></Lazy>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
