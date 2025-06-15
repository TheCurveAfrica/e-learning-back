import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let redisClient: RedisClientType;

const connectionOptions: {
  socket: {
    host: string;
    port: number;
  };
  password?: string;
  tls?: boolean;
} = {
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  }
};

if (process.env.REDIS_PASSWORD) {
  connectionOptions.password = process.env.REDIS_PASSWORD;
}

if (process.env.REDIS_TLS === 'true') {
  connectionOptions.tls = true;
}

const initRedis = async (): Promise<RedisClientType> => {
  try {
    redisClient = createClient(connectionOptions);

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error ❌:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis ✅');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis client:', error);
    throw error;
  }
};

initRedis().catch((error) => {
  logger.error('Redis initialization failed:', error);
});

export const get = async (key: string, fallbackFn?: () => Promise<string>): Promise<any> => {
  if (!redisClient.isOpen) {
    logger.error('Redis client is not connected');
    if (fallbackFn) {
      return fallbackFn();
    }
    return null;
  }

  try {
    let value = await redisClient.get(key);

    if (value === null && fallbackFn) {
      value = await fallbackFn();
      await redisClient.set(key, value);
    }

    return value;
  } catch (error) {
    logger.error(`Error getting key ${key} from Redis:`, error);
    if (fallbackFn) {
      return fallbackFn();
    }
    return null;
  }
};

export const set = async (key: string, value: string, expiryInSeconds?: number): Promise<boolean> => {
  if (!redisClient.isOpen) {
    logger.error('Redis client is not connected');
    return false;
  }

  try {
    if (expiryInSeconds) {
      await redisClient.setEx(key, expiryInSeconds, value);
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch (error) {
    logger.error(`Error setting key ${key} in Redis:`, error);
    return false;
  }
};

export const del = async (key: string): Promise<number> => {
  if (!redisClient.isOpen) {
    logger.error('Redis client is not connected');
    return 0;
  }

  try {
    return await redisClient.del(key);
  } catch (error) {
    logger.error(`Error deleting key ${key} from Redis:`, error);
    return 0;
  }
};

export const hset = async (key: string, field: string, value: string): Promise<number> => {
  if (!redisClient.isOpen) {
    logger.error('Redis client is not connected');
    return 0;
  }

  try {
    return await redisClient.hSet(key, field, value);
  } catch (error) {
    logger.error(`Error setting hash key ${key} in Redis:`, error);
    return 0;
  }
};

export const hget = async (key: string, field: string, fallbackFn?: () => Promise<any>): Promise<string | null> => {
  if (!redisClient.isOpen) {
    logger.error('Redis client is not connected');
    if (fallbackFn) {
      return fallbackFn();
    }
    return null;
  }

  try {
    let value = await redisClient.hGet(key, field);

    if (value === null && fallbackFn) {
      value = await fallbackFn();
      await redisClient.hSet(key, field, value);
    }

    return value;
  } catch (error) {
    logger.error(`Error getting hash key ${key} from Redis:`, error);
    if (fallbackFn) {
      return fallbackFn();
    }
    return null;
  }
};

export const hgetall = async (key: string): Promise<Record<string, string> | null> => {
  if (!redisClient.isOpen) {
    logger.error('Redis client is not connected');
    return null;
  }

  try {
    return await redisClient.hGetAll(key);
  } catch (error) {
    logger.error(`Error getting all hash keys ${key} from Redis:`, error);
    return null;
  }
};

export const hdel = async (key: string, field: string): Promise<number> => {
  if (!redisClient.isOpen) {
    logger.error('Redis client is not connected');
    return 0;
  }

  try {
    return await redisClient.hDel(key, field);
  } catch (error) {
    logger.error(`Error deleting hash key ${key} from Redis:`, error);
    return 0;
  }
};

export const hincrby = async (key: string, field: string, increment: number): Promise<number> => {
  if (!redisClient.isOpen) {
    logger.error('Redis client is not connected');
    return 0;
  }

  try {
    return await redisClient.hIncrBy(key, field, increment);
  } catch (error) {
    logger.error(`Error incrementing hash key ${key} in Redis:`, error);
    return 0;
  }
};

export const ttl = async (key: string): Promise<number> => {
  if (!redisClient.isOpen) {
    logger.error('Redis client is not connected');
    return -2;
  }

  try {
    return await redisClient.ttl(key);
  } catch (error) {
    logger.error(`Error getting TTL for key ${key} from Redis:`, error);
    return -2;
  }
};

export const incr = async (key: string): Promise<number> => {
  if (!redisClient.isOpen) {
    logger.error('Redis client is not connected');
    return 0;
  }

  try {
    return await redisClient.incr(key);
  } catch (error) {
    logger.error(`Error incrementing key ${key} in Redis:`, error);
    return 0;
  }
};

export const expire = async (key: string, seconds: number): Promise<boolean> => {
  if (!redisClient.isOpen) {
    logger.error('Redis client is not connected');
    return false;
  }

  try {
    return await redisClient.expire(key, seconds);
  } catch (error) {
    logger.error(`Error setting expiration for key ${key} in Redis:`, error);
    return false;
  }
};

export default redisClient;
