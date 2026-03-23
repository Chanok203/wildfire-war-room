import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config({
    path: path.resolve(__dirname, '..', '.env'),
});

const getEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`CRITICAL ERROR: Missing env variable [ ${key} ]`);
    }
    return value;
};

export const config = {
    isProd: process.env.NODE_ENV === 'production',
    port: Number(getEnv('PORT')),
    host: getEnv('HOST'),
    dbUrl: getEnv('DATABASE_URL'),
    redisUrl: getEnv('REDIS_URL'),
    secretKey: getEnv('SECRET_KEY'),
    missionsDir: path.resolve(__dirname, '..', 'missions'),
    qgisUrl: getEnv('QGIS_URL'),
    qgisProjectPath: getEnv('QGIS_PROJECT_PATH'),
} as const;
