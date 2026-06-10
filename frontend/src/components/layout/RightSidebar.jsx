import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Users, UserPlus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useSuggestedUsers, useTrendingHashtags } from '../../hooks/useSidebarData';
import { queryKeys } from '../../lib/queryKeys';

export default function RightSidebar() {
  const queryClient = useQueryClient();
  const { data: trending = [], isLoading: trendingLoading } = useTrendingHashtags();
  const { data: suggested = [], isLoading: suggestedLoading } = useSuggestedUsers();

  const followMutation = useMutation({
    mutationFn: (id) => api.put(`/users/follow/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData(queryKeys.suggested, (old) =>
        (old || []).filter((u) => u._id !== id)
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.feed });
      toast.success('Following! 🎉');
    },
    onError: () => toast.error('Failed'),
  });

  const Widget = ({ title, icon: Icon, iconColor, children }) => (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
      style={{
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '16px', marginBottom: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={iconColor} />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--text-1)' }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );

  return (
    <aside className="right-sidebar">
      <div style={{ paddingTop: 20 }}>
        <Widget title="Trending" icon={Flame} iconColor="var(--amber)">
          {trendingLoading ? Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div className="skeleton" style={{ height: 10, width: 55, marginBottom: 5 }} />
              <div className="skeleton" style={{ height: 13, width: 100 }} />
            </div>
          )) : trending.length === 0
            ? <p style={{ color: 'var(--text-3)', fontSize: 12 }}>No trends yet — start posting!</p>
            : trending.slice(0, 6).map((tag, i) => (
              <motion.div key={tag._id} whileHover={{ x: 4 }}
                style={{
                  padding: '8px 0',
                  borderBottom: i < 5 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                }}>
                <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '0 0 2px' }}>#{i + 1} Trending</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 1px', fontFamily: 'var(--font-display)' }}>
                  {tag._id}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>{tag.count} posts</p>
              </motion.div>
            ))
          }
        </Widget>

        <Widget title="Who to Follow" icon={Users} iconColor="var(--violet)">
          {suggestedLoading ? Array(3).fill(0).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 5 }} />
                <div className="skeleton" style={{ height: 10, width: 55 }} />
              </div>
            </div>
          )) : suggested.length === 0
            ? <p style={{ color: 'var(--text-3)', fontSize: 12 }}>No suggestions right now</p>
            : suggested.map((u, i) => (
              <div key={u._id} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0',
                borderBottom: i < suggested.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <Link to={`/profile/${u.username}`} style={{ flexShrink: 0 }}>
                  {u.profilePicture
                    ? <img src={u.profilePicture} loading="lazy" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} alt={u.username} />
                    : <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>
                        {u.username[0].toUpperCase()}
                      </div>
                  }
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', margin: 0, fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.fullName || u.username}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>{u.followerCount ?? 0} followers</p>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => followMutation.mutate(u._id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                    borderRadius: 8, border: '1px solid rgba(79,142,247,0.3)',
                    background: 'var(--blue-dim)', color: 'var(--blue)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>
                  <UserPlus size={11} /> Follow
                </motion.button>
              </div>
            ))
          }
        </Widget>

        <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 11, padding: '4px 0 24px', fontFamily: 'var(--font-body)' }}>
          © 2025 ConnectSphere
        </p>
      </div>
    </aside>
  );
}
