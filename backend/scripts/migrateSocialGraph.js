import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';

dotenv.config();

const migrate = async () => {
  await connectDB();

  console.log('Migrating follows…');
  const users = await User.find({
    $or: [{ followers: { $exists: true, $ne: [] } }, { following: { $exists: true, $ne: [] } }],
  }).select('followers following');

  let followOps = 0;
  for (const user of users) {
    for (const followingId of user.following || []) {
      const result = await Follow.updateOne(
        { follower: user._id, following: followingId },
        { $setOnInsert: { follower: user._id, following: followingId } },
        { upsert: true }
      );
      if (result.upsertedCount) followOps += 1;
    }
  }
  console.log(`  Upserted ${followOps} follow relationships`);

  console.log('Migrating likes…');
  const posts = await Post.find({ likes: { $exists: true, $ne: [] } }).select('likes likeCount');
  let likeOps = 0;
  for (const post of posts) {
    for (const userId of post.likes || []) {
      const result = await Like.updateOne(
        { user: userId, post: post._id },
        { $setOnInsert: { user: userId, post: post._id } },
        { upsert: true }
      );
      if (result.upsertedCount) likeOps += 1;
    }
    const count = await Like.countDocuments({ post: post._id });
    await Post.findByIdAndUpdate(post._id, { likeCount: count });
  }
  console.log(`  Upserted ${likeOps} likes`);

  console.log('Migrating bookmarks…');
  const bookmarkUsers = await User.find({ bookmarks: { $exists: true, $ne: [] } }).select('bookmarks');
  let bookmarkOps = 0;
  for (const user of bookmarkUsers) {
    for (const postId of user.bookmarks || []) {
      const result = await Bookmark.updateOne(
        { user: user._id, post: postId },
        { $setOnInsert: { user: user._id, post: postId } },
        { upsert: true }
      );
      if (result.upsertedCount) bookmarkOps += 1;
    }
  }
  console.log(`  Upserted ${bookmarkOps} bookmarks`);

  console.log('Migration complete.');
  await mongoose.disconnect();
};

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
