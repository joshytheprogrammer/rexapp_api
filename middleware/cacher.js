const Redis = require('ioredis');

// Create a Redis connection with error handling
let redis;
try {
  redis = process.env.NODE_ENV === 'development' ? new Redis() : new Redis(process.env.REDIS_URL);
} catch (error) {
  console.error('Error connecting to Redis:', error);
}

const cacheMiddleware = async (req, res, next) => {
  if (!redis) {
    // If there was an error connecting to Redis, skip caching and proceed with the request
    next();
    return;
  }

  const cacheKey = req.originalUrl;

  try {
    let cachedResponse = await redis.get(cacheKey);

    if (cachedResponse) {
      res.send(JSON.parse(cachedResponse));
    } else {
      next();
    }
  } catch (error) {
    console.error('Error retrieving cache:', error);
    next();
  }
};

module.exports = cacheMiddleware;
