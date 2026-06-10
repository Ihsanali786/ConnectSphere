import User from '../models/User.js';
import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import {
  enrichPosts,
  getFollowCounts,
  getFollowPreviews,
  isFollowing,
  getFollowingIds,
  getUserBookmarkIds,
  getFollowerCountsMap,
} from '../utils/socialGraph.js';

const relationSelect = 'username fullName profilePicture isVerified';

const serializeUser = async (user, viewerId) => {
  const isOwner = viewerId && user._id.toString() === viewerId.toString();
  const [{ followerCount, followingCount }, previews, viewerFollows] = await Promise.all([
    getFollowCounts(user._id),
    getFollowPreviews(user._id),
    viewerId && !isOwner ? isFollowing(viewerId, user._id) : Promise.resolve(false),
  ]);

  const bookmarkIds = isOwner ? await getUserBookmarkIds(user._id) : [];

  return {
    _id: user._id,
    username: user.username,
    ...(isOwner ? { email: user.email } : {}),
    fullName: user.fullName || '',
    bio: user.bio || '',
    profilePicture: user.profilePicture || '',
    coverPhoto: user.coverPhoto || '',
    location: user.location || '',
    website: user.website || '',
    followers: previews.followers,
    following: previews.following,
    followerCount,
    followingCount,
    ...(isOwner ? { bookmarks: bookmarkIds } : {}),
    ...(viewerId && !isOwner ? { isFollowing: viewerFollows } : {}),
    isVerified: user.isVerified,
    ...(isOwner ? { isEmailVerified: user.isEmailVerified } : {}),
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [posts, postsTotal, serialized] = await Promise.all([
      Post.find({ author: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', relationSelect)
        .populate({
          path: 'comments',
          populate: { path: 'user', select: relationSelect },
          options: { limit: 3 },
        })
        .lean(),
      Post.countDocuments({ author: user._id }),
      serializeUser(user, req.user._id),
    ]);

    const enriched = await enrichPosts(posts, req.user._id);

    res.json({
      user: serialized,
      posts: enriched,
      postsTotal,
      postsPages: Math.ceil(postsTotal / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { fullName, bio, location, website, profilePicture, coverPhoto } = req.body;

    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (profilePicture !== undefined && profilePicture) user.profilePicture = profilePicture;
    if (coverPhoto !== undefined && coverPhoto) user.coverPhoto = coverPhoto;
    if (req.files?.profilePicture?.[0]?.path) user.profilePicture = req.files.profilePicture[0].path;
    if (req.files?.coverPhoto?.[0]?.path) user.coverPhoto = req.files.coverPhoto[0].path;

    await user.save();

    res.json(await serializeUser(user, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const existing = await Follow.findOne({ follower: req.user._id, following: targetUser._id });

    if (existing) {
      await existing.deleteOne();
      res.json({ isFollowing: false });
    } else {
      await Follow.create({ follower: req.user._id, following: targetUser._id });

      const notification = await Notification.create({
        sender: req.user._id,
        receiver: targetUser._id,
        type: 'follow',
        message: `${req.user.username} started following you`,
      });

      await notification.populate('sender', relationSelect);
      req.app.get('io')?.to(targetUser._id.toString()).emit('newNotification', notification);

      res.json({ isFollowing: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const safeQuery = escapeRegex(q.trim());

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: safeQuery, $options: 'i' } },
        { fullName: { $regex: safeQuery, $options: 'i' } },
      ],
    })
      .select('username fullName profilePicture bio isVerified createdAt')
      .limit(10)
      .lean();

    const countMap = await getFollowerCountsMap(users.map((u) => u._id));

    res.json(
      users.map((u) => ({
        ...u,
        followerCount: countMap.get(u._id.toString()) || 0,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const followingIds = await getFollowingIds(req.user._id);
    const excludedIds = [req.user._id, ...followingIds];

    const users = await User.find({ _id: { $nin: excludedIds } })
      .select('username fullName profilePicture bio isVerified createdAt')
      .limit(20)
      .lean();

    const countMap = await getFollowerCountsMap(users.map((u) => u._id));

    const ranked = users
      .map((u) => ({ ...u, followerCount: countMap.get(u._id.toString()) || 0 }))
      .sort((a, b) => b.followerCount - a.followerCount || b.createdAt - a.createdAt)
      .slice(0, 5);

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const bookmarkIds = await getUserBookmarkIds(req.user._id);
    const total = bookmarkIds.length;
    const paginatedIds = bookmarkIds.slice(skip, skip + limit);

    if (!paginatedIds.length) {
      return res.json({ posts: [], total, pages: 0, currentPage: page });
    }

    const posts = await Post.find({ _id: { $in: paginatedIds } })
      .populate('author', relationSelect)
      .populate({
        path: 'comments',
        populate: { path: 'user', select: relationSelect },
        options: { limit: 3 },
      })
      .lean();

    const ordered = paginatedIds
      .map((id) => posts.find((p) => p._id.toString() === id.toString()))
      .filter(Boolean);

    const enriched = await enrichPosts(ordered, req.user._id);

    res.json({
      posts: enriched,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
