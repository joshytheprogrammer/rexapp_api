const { redis } = require('../utils/redis');

const cacheMiddleware = async (req, res, next) => {
  if (!redis) {
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
