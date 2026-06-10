import { motion } from 'framer-motion';
import { Heart, MessageCircle, UserPlus, Reply } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';

const config = {
  like:    { icon: Heart,          color: '#fb7185', bg: 'rgba(244,63,94,0.1)',   label: 'liked your post' },
  comment: { icon: MessageCircle,  color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  label: 'commented on your post' },
  follow:  { icon: UserPlus,       color: '#34d399', bg: 'rgba(16,185,129,0.1)',  label: 'followed you' },
  reply:   { icon: Reply,          color: '#a78bfa', bg: 'rgba(139,92,246,0.1)',  label: 'replied to your comment' },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function NotificationItem({ notification, index = 0 }) {
  const cfg = config[notification.type] || config.like;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer"
      style={{
        background: !notification.read ? 'rgba(59,130,246,0.04)' : 'transparent',
        border: `1px solid ${!notification.read ? 'rgba(59,130,246,0.08)' : 'transparent'}`,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = !notification.read ? 'rgba(59,130,246,0.04)' : 'transparent'}>

      <div className="relative flex-shrink-0">
        <Link to={`/profile/${notification.sender?.username}`}>
          <Avatar user={notification.sender} size="sm" />
        </Link>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: cfg.bg, border: '2px solid var(--bg-base)' }}>
          <Icon size={10} style={{ color: cfg.color }} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
          <Link to={`/profile/${notification.sender?.username}`}
            className="font-semibold text-white hover:text-blue-400 transition-colors">
            @{notification.sender?.username}
          </Link>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{cfg.label}</span>
        </p>
        {notification.post?.content && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            "{notification.post.content.slice(0, 60)}{notification.post.content.length > 60 ? '...' : ''}"
          </p>
        )}
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {!notification.read && (
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
          style={{ background: '#3b82f6', boxShadow: '0 0 6px rgba(59,130,246,0.6)' }} />
      )}
    </motion.div>
  );
}