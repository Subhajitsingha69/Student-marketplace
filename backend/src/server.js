import 'dotenv/config';
import app from './app.js';
import { connectRedis } from './utils/redis.js';
import { connectDB } from './db/index.js';
const port = process.env.PORT || 4000;

try {
  await connectDB();
  await connectRedis();
  app.listen(port, () => console.log(`Feed API listening on http://localhost:${port}`));
} catch (error) {
  console.error('Could not start API:', error.message);
  process.exit(1);
}


