import Follow from '../models/Follow.js';

export const emitToFeedFollowers = async (io, authorId, event, data) => {
  if (!io) return;

  const followers = await Follow.find({ following: authorId }).select('follower').lean();
  const recipients = new Set([
    authorId.toString(),
    ...followers.map((f) => f.follower.toString()),
  ]);

  for (const userId of recipients) {
    io.to(userId).emit(event, data);
  }
};

export const emitToPostRoom = (io, postId, event, data) => {
  io?.to(`post:${postId}`).emit(event, data);
};
