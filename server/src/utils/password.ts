import { env } from "@configs/env.js"
import { compare, hash } from "bcrypt-ts"

export const hashPassword = async (password: string) => {
    const hashedPassword = await hash(password,Number(env.SALT));
    return hashedPassword;
}

export const comparePassword = async (password: string,hashedPassword: string) => {
    const isMatch = await compare(password,hashedPassword);
    return isMatch;
}