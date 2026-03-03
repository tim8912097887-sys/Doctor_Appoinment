import { env } from "@/configs/env.js"
import { db } from "../db.js"
import { tokens } from "../schema/token.js"
import { and, eq, gt, sql } from "drizzle-orm"
import { users } from "../schema/user.js"

type TokenType = "VERIFICATION" | "PASSWORD_RESET"

export const createVerificationToken = async(userId: string,hashToken: string,type: TokenType) => {
 
    const result = await db.insert(tokens).values({
        userId,
        token: hashToken,
        type,
        expiredAt: new Date(Date.now()+env.TOKEN_EXPIRED)
    })
    return result.rowCount;
}

export const findAndVerifyToken = async(userId: string,token: string) => {
    // Use transaction prevent success twice in instantly click twice
    return await db.transaction(async(tx) => {
         const [existToken] = await tx.select({
            id: tokens.id
         }).from(tokens).where(
            and(
                eq(tokens.userId,userId),
                eq(tokens.token,token),
                gt(tokens.expiredAt, new Date())
            ))
        if(!existToken) return null;
        await tx.delete(tokens).where(
                eq(tokens.id,existToken.id)
            )
        await tx.update(users).set({
            isVerified: true
        }).where(eq(users.id,userId));
        return existToken;
    })
}

export const updatePassword = async(userId: string,token: string,password: string) => {
    // Use transaction prevent data lose when server crash
    return await db.transaction(async(tx) => {
         const [deletedToken] = await tx.delete(tokens).where(
            and(
                eq(tokens.userId,userId),
                eq(tokens.token,token),
                gt(tokens.expiredAt, new Date())
            )).returning();
            console.log(deletedToken)
        if(!deletedToken) {
            return { success: false, message: "Invalid or expired token" };
        } 
        await tx.update(users).set({
            password,
            // Invalidate exist session
            tokenVersion: sql`${users.tokenVersion} + 1`
        }).where(eq(users.id,userId));
        return { success: true };
    })
}