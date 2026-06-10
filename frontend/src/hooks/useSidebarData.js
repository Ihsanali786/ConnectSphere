import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { queryKeys } from '../lib/queryKeys';

export function useSuggestedUsers() {
  return useQuery({
    queryKey: queryKeys.suggested,
    queryFn: () => api.get('/users/suggested').then((r) => r.data),
  });
}

export function useTrendingHashtags() {
  return useQuery({
    queryKey: queryKeys.trending,
    queryFn: () => api.get('/posts/trending').then((r) => r.data),
  });
}
