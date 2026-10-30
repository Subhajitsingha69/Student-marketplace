import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';
import Post from './models/Post.js';
import User from './models/User.js';

// Resolve backend/.env relative to this file so the script works from any cwd.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

// Development seed only. Override SEED_PASSWORD (or DEMO_PASSWORD) if needed.
const seedPassword = process.env.SEED_PASSWORD || process.env.DEMO_PASSWORD || 'password123';
const passwordHash = await bcrypt.hash(seedPassword, 12);
const users = [
  { _id: 'demo', name: 'Demo User', username: 'demo', following: ['maya', 'leo', 'nina'] },
  { _id: 'maya', name: 'Maya Chen', username: 'maya', following: ['leo', 'nina'] },
  { _id: 'leo', name: 'Leo Martin', username: 'leo', following: ['maya'] },
  { _id: 'nina', name: 'Nina Patel', username: 'nina', following: ['maya', 'leo'] },
];

const now = Date.now();
const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000);
const posts = [
  { authorId: 'maya', authorName: 'Maya Chen', text: 'A quiet morning walk and a camera roll full of little details. What are you noticing today?', likes: 28, createdAt: hoursAgo(0.6) },
  { authorId: 'leo', authorName: 'Leo Martin', text: 'This week I learned that taking a real break is part of doing good work.', likes: 41, createdAt: hoursAgo(3) },
  { authorId: 'nina', authorName: 'Nina Patel', text: 'Made a tiny playlist for slow afternoons. Sharing the good mood with everyone here ✨', likes: 16, createdAt: hoursAgo(8) },
  { authorId: 'maya', authorName: 'Maya Chen', text: 'Trying something new this month and remembering that beginners are allowed to be beginners.', likes: 9, createdAt: hoursAgo(14) },
  { authorId: 'demo', authorName: 'Demo User', text: 'Testing out my new feed. What are you all working on this week?', likes: 12, createdAt: hoursAgo(1.5) },
  { authorId: 'leo', authorName: 'Leo Martin', text: 'A small reminder to save your work before trying the bold refactor.', likes: 33, createdAt: hoursAgo(20) },
  { authorId: 'nina', authorName: 'Nina Patel', text: 'Weekend recipe: good bread, ripe tomatoes, olive oil, and absolutely no rush.', likes: 24, createdAt: hoursAgo(27) },
  { authorId: 'maya', authorName: 'Maya Chen', text: 'Found a little neighborhood bookshop today. I went in for one book and came out with three.', likes: 19, createdAt: hoursAgo(36) },
  { authorId: 'demo', authorName: 'Demo User', text: 'The best ideas today came after stepping away from the screen for a bit.', likes: 7, createdAt: hoursAgo(48) },
];

// Keep the demo feed large enough to browse while staying under its 200-post
// query cap. These deterministic scenarios deliberately mix age and popularity.
const demoAuthors = users.map(({ _id, name }) => ({ authorId: _id, authorName: name }));
const postTopics = [
  'A small thing I noticed on the way home',
  'Sharing what I have been learning this week',
  'A moment worth saving from today',
  'What is everyone making lately?',
  'A thought for a slower afternoon',
  'Collected a few ideas and wanted to pass them along',
  'A tiny update from my corner of the world',
  'The kind of day that makes you appreciate the little things',
  'Trying a new approach and enjoying the process',
  'A recommendation from this week',
];
const variedPosts = Array.from({ length: 180 }, (_, index) => {
  const cycle = Math.floor(index / 5);
  const scenario = index % 5;
  const ageHours = [
    24 * (365 * 5 - cycle),       // Very old, very popular
    24 * (180 + cycle * 5),       // Old, with average popularity
    cycle * 12 + 0.25,            // Recent, with almost no likes
    cycle * 24 + 0.5,             // Recent, very popular
    24 * (20 + cycle * 4),        // Average age and popularity
  ][scenario];
  const likes = [
    50000 + cycle * 1300,
    300 + cycle * 90,
    cycle % 11,
    15000 + cycle * 1900,
    100 + cycle * 250,
  ][scenario];
  const author = demoAuthors[index % demoAuthors.length];

  return {
    ...author,
    text: `Seeded post #${String(index + 1).padStart(3, '0')}: ${postTopics[index % postTopics.length]}.`,
    likes,
    createdAt: hoursAgo(ageHours),
  };
});

try {
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL is missing from backend/.env');
  }
  await mongoose.connect(process.env.MONGO_URL);

  for (const user of users) {
    await User.findByIdAndUpdate(user._id, {
      $set: {
        name: user.name,
        username: user.username,
        passwordHash,
        following: user.following,
      },
    }, {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
  }

  await Post.deleteMany({
    $or: [
      { text: { $in: posts.map(({ text }) => text) } },
      { text: /^Seeded post #/ },
    ],
  });
  await Post.insertMany([...posts, ...variedPosts]);

  console.log(`Seeded ${users.length} users and ${posts.length + variedPosts.length} posts.`);
  console.log(`Sign in with any seeded username and password: ${seedPassword}`);
} finally {
  await mongoose.disconnect();
}
