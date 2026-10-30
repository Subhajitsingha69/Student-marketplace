import Post from '../models/Post.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { getCachedJson, setCachedJson } from '../utils/redis.js';
import { feedQuerySchema } from '../validator/request.validator.js';

const CACHE_SECONDS = 30;

function rank(post) {
  const ageDays = Math.max(0,(Date.now() - new Date(post.createdAt).getTime()) / 86_400_000);
  const halfLife = 180; // days
  const decay = Math.pow(0.5, ageDays / halfLife);

  return post.likes * 2 * decay;
}

export async function getFeed(req, res, next) {
  try {
    const userId = req.user._id;
    const queryResult = feedQuerySchema.safeParse(req.query);  //for valid cursor value ,like cursor =10,means send next request from 11
    if (!queryResult.success) throw new ApiError(400, queryResult.error.issues[0].message);

    const { limit, cursor: encodedCursor } = queryResult.data;
    const cursor = encodedCursor ? Buffer.from(encodedCursor, 'base64').toString() : null;
    
    const cacheKey = `feed:${userId}:${cursor || 'first'}`;
    const cached = await getCachedJson(cacheKey);
    if (cached) {
      return res.status(200).json(
        new ApiResponse(200, cached, 'Feed fetched successfully')
      );
    }

    const authors = [userId, ...req.user.following];
    const posts = await Post.find({ authorId: { $in: authors } })
      .sort({ createdAt: -1, _id: -1 })
      .limit(200)
      .lean();
    const ranked = posts.map((post) => ({ ...post, score: rank(post) }))
      .sort((a, b) => b.score - a.score || String(b._id).localeCompare(String(a._id)));
    const start = cursor ? Math.max(0, ranked.findIndex((post) => String(post._id) === cursor) + 1) : 0;
    const page = ranked.slice(start, start + limit);
    const result = {
      items: page.map(({ _id, authorId, authorName, text, likes, createdAt, score }) => ({
        id: _id,
        authorId,
        authorName,
        text,
        likes,
        createdAt,
        score,
      })),
      nextCursor: start + limit < ranked.length && page.length
        ? Buffer.from(String(page.at(-1)._id)).toString('base64')
        : null,
    };
    await setCachedJson(cacheKey, result, CACHE_SECONDS);
    return res.status(200).json(
      new ApiResponse(200, result, 'Feed fetched successfully')
    );
  } catch (error) {
    return next(error);
  }
}
