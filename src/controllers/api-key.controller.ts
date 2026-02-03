import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { generateApiKey } from '../utils/uuid.util';

export const createApiKey_POST = async (req: Request, res: Response) => {
    const apiKey = await prisma.apiKey.create({
        data: { apiKey: generateApiKey() },
    });
    res.redirect('/api-key');
};

export const listApiKey_GET = async (req: Request, res: Response) => {
    const apiKeys = await prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } });
    res.render('api-key/api-key-list.html', { apiKeys: apiKeys });
};

export const deleteApiKey_POST = async (req: Request, res: Response) => {
    const { apiKey } = req.body;
    try {
        await prisma.apiKey.delete({ where: { apiKey: apiKey } });
    } catch (error) {}

    res.redirect('/api-key');
};
