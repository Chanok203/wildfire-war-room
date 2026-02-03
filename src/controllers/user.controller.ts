import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { createUser } from '../services/user.service';

export const createUser_GET = async (req: Request, res: Response) => {
    let errors: any = { message: {} };
    let data: any = {};
    return res.render('user/create-user.html', { errors: errors, data: data });
};

export const createUser_POST = async (req: Request, res: Response) => {
    const { username, password, confirmPassword } = req.body;

    let errors: any = { message: {} };
    let data: any = {
        username: username,
    };

    if (password !== confirmPassword) {
        errors.message.password = `password != confirmPassword`;
        return res.render('user/create-user.html', { errors: errors, data: data });
    }

    try {
        const user = await createUser(username, password);
        return res.redirect('/user');
    } catch (error) {
        errors.message.username = error;
        return res.render('user/create-user.html', { errors: errors, data: data });
    }
};

export const listUser_GET = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    return res.render('user/user-list.html', { users: users });
};

export const editUser_GET = async (req: Request, res: Response) => {
    return res.render('user/edit-list.html');
};

export const editUser_POST = async (req: Request, res: Response) => {
    return res.send(`editUser_POST`);
};

export const deleteUser_POST = async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    if (req.session.user?.id === userId) {
        return res.redirect('/user');
    }

    try {
        await prisma.user.delete({ where: { id: userId } });
        return res.redirect('/user');
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'delete user error',
        });
    }
};
