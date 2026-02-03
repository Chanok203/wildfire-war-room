import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        return next();
    }

    res.redirect(`/auth/login?next=${req.originalUrl}`);
};

export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
        return res.status(401).json({
            status: 'fail',
            message: 'API Key is missing',
        });
    }
    try {
        const found = await prisma.apiKey.findFirst({
            where: {
                apiKey: apiKey,
            },
        });
        if (!found) {
            return res.status(403).json({
                status: 'fail',
                message: 'Invalid API Key',
            });
        }
        return next();
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
