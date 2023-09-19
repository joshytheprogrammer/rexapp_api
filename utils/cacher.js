"use strict";

const Redis = require('ioredis');
const redis = process.env.NODE_ENV === 'development'? new Redis() : new Redis(process.env.REDIS_URL);

async function cache(cacheKey, data) {
  await redis.set(cacheKey, JSON.stringify(data))
}

module.exports = cache