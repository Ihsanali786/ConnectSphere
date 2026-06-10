import Post from '../models/Post.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Notification from '../models/Notification.js';
import { emitToFeedFollowers, emitToPostRoom } from '../utils/socketEmit.js';
import { getFollowingIds, enrichPosts } from '../utils/socialGraph.js';

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content && !req.file)
      return res.status(400).json({ message: 'Post must have content or image' });

    const hashtags = content?.match(/#[a-zA-Z0-9_]+/g)?.map((h) => h.toLowerCase()) || [];

    const post = await Post.create({
      author: req.user._id,
      content: content || '',
      image: req.file?.path || '',
      hashtags,
    });

    await post.populate('author', 'username profilePicture fullName isVerified');
    const [enriched] = await enrichPosts([post], req.user._id);
    const io = req.app.get('io');
    await emitToFeedFollowers(io, req.user._id, 'newPost', enriched);
    res.status(201).json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const followingIds = await getFollowingIds(req.user._id);
    const feedUsers = [...followingIds, req.user._id];

    const [posts, total] = await Promise.all([
      Post.find({ author: { $in: feedUsers } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username profilePicture fullName isVerified')
        .populate({
          path: 'comments',
          populate: { path: 'user', select: 'username profilePicture' },
          options: { limit: 3 },
        })
        .lean(),
      Post.countDocuments({ author: { $in: feedUsers } }),
    ]);

    const enriched = await enrichPosts(posts, req.user._id);
    res.json({ posts: enriched, total, pages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const existing = await Like.findOne({ user: req.user._id, post: post._id });
    let isLiked;

    if (existing) {
      await existing.deleteOne();
      await Post.findByIdAndUpdate(post._id, { $inc: { likeCount: -1 } });
      isLiked = false;
    } else {
      await Like.create({ user: req.user._id, post: post._id });
      await Post.findByIdAndUpdate(post._id, { $inc: { likeCount: 1 } });
      isLiked = true;

      if (post.author.toString() !== req.user._id.toString()) {
        const notification = await Notification.create({
          sender: req.user._id,
          receiver: post.author,
          type: 'like',
          post: post._id,
          message: `${req.user.username} liked your post`,
        });
        await notification.populate('sender', 'username profilePicture');
        req.app.get('io')?.to(post.author.toString()).emit('newNotification', notification);
      }
    }

    const likes = await Like.find({ post: post._id }).select('user').lean();
    const likeUserIds = likes.map((l) => l.user);

    req.app.get('io') && emitToPostRoom(req.app.get('io'), post._id, 'postLiked', {
      postId: post._id,
      likes: likeUserIds,
      likeCount: likeUserIds.length,
    });

    res.json({ likes: likeUserIds, likeCount: likeUserIds.length, isLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await Promise.all([
      Like.deleteMany({ post: post._id }),
      Bookmark.deleteMany({ post: post._id }),
      post.deleteOne(),
    ]);

    const io = req.app.get('io');
    emitToPostRoom(io, req.params.id, 'postDeleted', req.params.id);
    await emitToFeedFollowers(io, req.user._id, 'postDeleted', req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    post.content = req.body.content || post.content;
    post.isEdited = true;
    post.hashtags = post.content.match(/#[a-zA-Z0-9_]+/g)?.map((h) => h.toLowerCase()) || [];
    await post.save();
    await post.populate('author', 'username profilePicture fullName isVerified');
    const [enriched] = await enrichPosts([post], req.user._id);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const savePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const existing = await Bookmark.findOne({ user: req.user._id, post: post._id });
    if (existing) {
      await existing.deleteOne();
      res.json({ isSaved: false });
    } else {
      await Bookmark.create({ user: req.user._id, post: post._id });
      res.json({ isSaved: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExplorePosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ likeCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username profilePicture fullName isVerified')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username profilePicture fullName isVerified' },
        options: { limit: 3 },
      })
      .lean();

    const enriched = await enrichPosts(posts, req.user._id);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrendingHashtags = async (req, res) => {
  try {
    const result = await Post.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
