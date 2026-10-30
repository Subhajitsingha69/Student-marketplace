
import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (error) => {
  console.error("Redis client error:", error.message);
});



export async function connectRedis() {
  if (redis.isOpen) return;
  try {
    await redis.connect();
    console.log("Redis connected");
  } catch (error) {
    console.warn(`Redis unavailable; serving without cache (${error.message})`);
  }
}




export async function getCachedJson(key) {
  try {
    if (!redis.isReady) {
      return null;
    }

    const cached = await redis.get(key);

    if (!cached) {
      return null;
    }

    return JSON.parse(cached);

  } catch (error) {
    console.error("Redis cache read failed:", error.message);
    return null;
  }
}

export async function setCachedJson(key, value, ttlSeconds = 60) {
  try {
    if (!redis.isReady) {
      return;
    }

    await redis.set(
      key,
      JSON.stringify(value),
      {
        EX: ttlSeconds
      }
    );

  } catch (error) {
    console.error("Redis cache write failed:", error.message);
  }
}

 //Allows you to pass either a single key or multiple keys
export async function deleteCacheKeys(...keys) {
  try {
    if (!redis.isReady) {
      return;
    }

    if (keys.length === 0) {
      return;
    }

    await redis.del(keys);

  } catch (error) {
    console.error("Redis cache deletion failed",error.message);
  }
}
