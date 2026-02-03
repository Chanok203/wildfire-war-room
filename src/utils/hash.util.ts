import bcrypt from "bcrypt";

const saltRound = 10;

export const hashPassword = async (password: string) => {
    const hash = await bcrypt.hash(password, saltRound);
    return hash;
}

export const verifyPassword = async (password: string, hash: string) => {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
}
