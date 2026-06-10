import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { queryKeys } from '../lib/queryKeys';
import toast from 'react-hot-toast';

const updatePostInFeed = (old, postId, updater) => {
  if (!old?.pages) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      posts: page.posts.map((p) => (p._id === postId ? updater(p) : p)),
    })),
  };
};

const dedupePosts = (posts) => {
  const seen = new Set();
  return posts.filter((post) => {
    const id = post?._id?.toString();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

export function useFeed() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: queryKeys.feed,
    queryFn: ({ pageParam = 1 }) =>
      api.get(`/posts/feed?page=${pageParam}&limit=10`).then((r) => r.data),
    getNextPageParam: (last) =>
      last.currentPage < last.pages ? last.currentPage + 1 : undefined,
    initialPageParam: 1,
  });

  const posts = query.data?.pages.flatMap((p) => p.posts) ?? [];

  const likeMutation = useMutation({
    mutationFn: (postId) => api.put(`/posts/${postId}/like`).then((r) => r.data),
    onSuccess: (data, postId) => {
      queryClient.setQueryData(queryKeys.feed, (old) =>
        updatePostInFeed(old, postId, (p) => ({
          ...p,
          likes: data.likes,
          likeCount: data.likeCount,
          isLiked: data.isLiked,
        }))
      );
    },
    onError: () => toast.error('Failed to like post'),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId) => api.delete(`/posts/${postId}`),
    onSuccess: (_, postId) => {
      queryClient.setQueryData(queryKeys.feed, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.filter((p) => p._id !== postId),
          })),
        };
      });
      toast.success('Post deleted');
    },
    onError: () => toast.error('Failed to delete post'),
  });

  const addPost = (post) => {
    queryClient.setQueryData(queryKeys.feed, (old) => {
      if (!old?.pages?.length) {
        return { pages: [{ posts: [post], total: 1, pages: 1, currentPage: 1 }], pageParams: [1] };
      }
      const [first, ...rest] = old.pages;
      if (old.pages.some((page) => page.posts.some((p) => p._id === post._id))) {
        return old;
      }

      return {
        ...old,
        pages: [{ ...first, posts: dedupePosts([post, ...first.posts]) }, ...rest],
      };
    });
  };

  const patchPost = (postId, updater) => {
    queryClient.setQueryData(queryKeys.feed, (old) =>
      updatePostInFeed(old, postId, updater)
    );
  };

  const removePost = (postId) => {
    queryClient.setQueryData(queryKeys.feed, (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((p) => p._id !== postId),
        })),
      };
    });
  };

  return {
    posts,
    loading: query.isLoading,
    isFetching: query.isFetching,
    hasMore: Boolean(query.hasNextPage),
    page: query.data?.pages.at(-1)?.currentPage ?? 1,
    fetchFeed: (pageNum) => (pageNum === 1 ? query.refetch() : query.fetchNextPage()),
    fetchNextPage: () => query.fetchNextPage(),
    refetch: () => query.refetch(),
    likePost: (postId) => likeMutation.mutate(postId),
    deletePost: (postId) => deleteMutation.mutate(postId),
    removePost,
    addPost,
    patchPost,
    setPosts: (updater) => {
      queryClient.setQueryData(queryKeys.feed, (old) => {
        if (!old?.pages?.length) return old;
        const all = old.pages.flatMap((p) => p.posts);
        const next = typeof updater === 'function' ? updater(all) : updater;
        return {
          ...old,
          pages: [{ ...old.pages[0], posts: dedupePosts(next) }, ...old.pages.slice(1)],
        };
      });
    },
  };
}
