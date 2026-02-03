import { RedisStore } from 'connect-redis';
import session from 'express-session';
import { redisConnection } from './redis';
import { config } from '../config';

const sessionStore = new RedisStore({
    client: {
        get: async (key: string) => await redisConnection.get(key),
        set: async (key: string, val: string, ttlArg?: any) => {
            let ttl = typeof ttlArg === 'object' ? ttlArg.ttl : ttlArg;
            if (ttl) {
                return await redisConnection.set(key, val, 'EX', Math.max(1, Math.floor(ttl)));
            }

            return await redisConnection.set(key, val);
        },
        del: async (key: string) => await redisConnection.del(key),
    },
    prefix: 'sess:',
    disableTouch: true,
});

export const sessionConfig = session({
    store: sessionStore,
    secret: config.secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.isProd,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
    },
});
