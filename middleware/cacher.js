const Redis = require('ioredis');
const redis = process.env.NODE_ENV === 'development'? new Redis() : new Redis(process.env.REDIS_URL);

const cacheMiddleware = async (req, res, next) => {
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
