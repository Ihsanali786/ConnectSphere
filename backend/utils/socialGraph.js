import Follow from '../models/Follow.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';

const relationSelect = 'username fullName profilePicture isVerified';

export const getFollowingIds = async (userId) => {
  const rows = await Follow.find({ follower: userId }).select('following').lean();
  return rows.map((r) => r.following);
};

export const isFollowing = async (followerId, followingId) => {
  const doc = await Follow.exists({ follower: followerId, following: followingId });
  return Boolean(doc);
};

export const getFollowCounts = async (userId) => {
  const [followerCount, followingCount] = await Promise.all([
    Follow.countDocuments({ following: userId }),
    Follow.countDocuments({ follower: userId }),
  ]);
  return { followerCount, followingCount };
};

export const getFollowPreviews = async (userId) => {
  const [followers, following] = await Promise.all([
    Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('follower', relationSelect)
      .lean(),
    Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('following', relationSelect)
      .lean(),
  ]);

  return {
    followers: followers.map((f) => f.follower),
    following: following.map((f) => f.following),
  };
};

export const getFollowerIds = async (userId) => {
  const rows = await Follow.find({ following: userId }).select('follower').lean();
  return rows.map((r) => r.follower);
};

export async function enrichPosts(posts, userId) {
  if (!posts.length) return posts;

  const plain = posts.map((p) => (p.toObject ? p.toObject() : p));
  const postIds = plain.map((p) => p._id);

  const [likeGroups, userLikes, userBookmarks] = await Promise.all([
    Like.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', users: { $push: '$user' }, count: { $sum: 1 } } },
    ]),
    userId
      ? Like.find({ user: userId, post: { $in: postIds } }).select('post').lean()
      : [],
    userId
      ? Bookmark.find({ user: userId, post: { $in: postIds } }).select('post').lean()
      : [],
  ]);

  const likeMap = new Map(likeGroups.map((g) => [g._id.toString(), g]));
  const likedSet = new Set(userLikes.map((l) => l.post.toString()));
  const savedSet = new Set(userBookmarks.map((b) => b.post.toString()));

  return plain.map((post) => {
    const group = likeMap.get(post._id.toString());
    const likes = group?.users || [];
    return {
      ...post,
      likes,
      likeCount: group?.count || 0,
      isLiked: likedSet.has(post._id.toString()),
      isSaved: savedSet.has(post._id.toString()),
    };
  });
}

export const getUserBookmarkIds = async (userId) => {
  const rows = await Bookmark.find({ user: userId }).sort({ createdAt: -1 }).select('post').lean();
  return rows.map((r) => r.post);
};

export const getFollowerCountsMap = async (userIds) => {
  if (!userIds.length) return new Map();
  const counts = await Follow.aggregate([
    { $match: { following: { $in: userIds } } },
    { $group: { _id: '$following', count: { $sum: 1 } } },
  ]);
  return new Map(counts.map((c) => [c._id.toString(), c.count]));
};
