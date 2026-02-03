import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { verifyPassword } from '../utils/hash.util';
import { redisConnection } from '../lib/redis';

export const login_GET = (req: Request, res: Response) => {
    return res.render('auth/login.html');
};

export const login_POST = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username: username } });
    let errors: any = {};
    let data: any = { username: username };

    if (!user) {
        errors.message = 'invalid username or password';
        res.render('auth/login.html', { errors: errors, data: data });
        return;
    }

    const isvalid = await verifyPassword(password, user.passwordHash);
    if (!isvalid) {
        errors.message = 'invalid username or password';
        res.render('auth/login.html', { errors: errors, data: data });
        return;
    }

    const userData = {
        id: user.id,
        username: user.username,
    };
    const nextPage: string = req.query.next ? `${req.query.next}` : '/mission';
    req.session.user = userData;
    req.session.save(() => {
        res.redirect(nextPage);
    });
};

export const logout_GET = (req: Request, res: Response) => {
    req.session.destroy((err) => {
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
};
