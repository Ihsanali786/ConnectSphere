import { emitToPostRoom } from '../utils/socketEmit.js';

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({ post: req.params.postId, user: req.user._id, content });
    await Post.findByIdAndUpdate(req.params.postId, { $push: { comments: comment._id } });
    await comment.populate('user', 'username profilePicture fullName isVerified');

    if (post.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        sender: req.user._id,
        receiver: post.author,
        type: 'comment',
        post: post._id,
        message: `${req.user.username} commented on your post`,
      });
      await notification.populate('sender', 'username profilePicture fullName isVerified');
      req.app.get('io')?.to(post.author.toString()).emit('newNotification', notification);
    }

    emitToPostRoom(req.app.get('io'), req.params.postId, 'newComment', {
      postId: req.params.postId,
      comment,
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const isLiked = comment.likes.includes(req.user._id);
    const update = isLiked ? { $pull: { likes: req.user._id } } : { $push: { likes: req.user._id } };
    const updated = await Comment.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ likes: updated.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addReply = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    comment.replies.push({ user: req.user._id, content: req.body.content });
    await comment.save();
    await comment.populate('replies.user', 'username profilePicture');
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
