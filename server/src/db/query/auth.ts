import { and, eq, sql } from "drizzle-orm";
import { db } from "../db.js";
import { users } from "../schema/user.js";
import { CreateUserType } from "@/routes/v1/auth/schema/signup.js";

type UpdatedField = {
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    loginAttempts?: number
    lockExpired?: Date | null
}


export const findUserByEmail = async(email: string) => {
     const [existUser] = await db.select({
                 id: users.id,
                 email: users.email,
                 password: users.password,
                 isVerified: users.isVerified,
                 loginAttempts: users.loginAttempts,
                 lockExpired: users.lockExpired,
                 is2faActive: users.is2faActive,
                 twoFactorSecret: users.twoFactorSecret,
                 tokenVersion: users.tokenVersion,
                 role: users.role
              }).from(users).where(eq(users.email,email));
    return existUser;
}

export const findUserById = async(userId: string) => {
     const [existUser] = await db.select({
                 id: users.id,
                 email: users.email,
                 tokenVersion: users.tokenVersion,
                 twoFactorSecret: users.twoFactorSecret
              }).from(users).where(eq(users.id,userId));
    return existUser;
}

export const updateUserByEmail = async(email: string,updatedField: UpdatedField) => {
     const updatedValue = await db.update(users).set({
        ...updatedField,
        // Atomic increment prevent race condition
        loginAttempts: !updatedField.loginAttempts?0:sql`${users.loginAttempts} + 1`
     }).where(eq(users.email,email));
     return updatedValue.rowCount;
}

export const transactionCreate = async(createInfo: CreateUserType) => {
  
    return await db.transaction(async(tx) => {
         const [existUser] = await tx.select({
                 id: users.id,
                 isVerified: users.isVerified
              }).from(users).where(eq(users.email,createInfo.email));
        if(existUser) {
            //  Send warning email for verified account
            if(existUser.isVerified) return {
                userId: existUser.id,
                emailType: 'SEND_WARNING_EMAIL'
            };
            await tx.update(users).set({
                ...createInfo,
                updatedAt: new Date()
            }).where(eq(users.email,createInfo.email));
            return {
                userId: existUser.id,
                emailType: 'SEND_VERIFICATION_EMAIL'
            };
        }
        const [createdUser] = await tx.insert(users)
                .values(createInfo)
                .returning({ id: users.id });
        return {
                userId: createdUser.id,
                emailType: 'SEND_VERIFICATION_EMAIL'
        };
    })
}

export const findAndUpdate = async(userId: string,tokenVersion: number) => {
    return await db.transaction(async(tx) => {
        const [updatedUser] = await tx.update(users).set({
            tokenVersion: sql`${users.tokenVersion} + 1`
        }).where(and(
            eq(users.id,userId),
            eq(users.tokenVersion,tokenVersion)
        )).returning({ id: users.id });
        return updatedUser;
    })
}

export const add2faSecret = async(secret: string,userId: string) => {
    const updatedValue = await db.update(users).set({
        twoFactorSecret: secret
    }).where(eq(users.id,userId));
    return updatedValue.rowCount;
}

export const enabled2fa = async(userId: string) => {
    const updatedValue = await db.update(users).set({
        is2faActive: true
    }).where(eq(users.id,userId));
    return updatedValue.rowCount;
}