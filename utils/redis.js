const Redis = require('ioredis');

let redis;
try {
  redis = process.env.NODE_ENV === 'development' ? new Redis() : new Redis(process.env.REDIS_URL);
} catch (error) {
  console.error('Error connecting to Redis:', error);
}

module.exports.redis = redis;
