import prisma from '../lib/prisma';
import { hashPassword } from '../utils/hash.util';

export const createUser = async (username: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { username: username } });

    if (user) {
        throw new Error('Username already exists');
    }

    const newUser = await prisma.user.create({
        data: {
            username: username,
            passwordHash: await hashPassword(password),
        },
    });

    const { passwordHash, ...data } = newUser;
    return data;
};
