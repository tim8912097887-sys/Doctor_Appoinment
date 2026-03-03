import crypto from "crypto";
import jwt from "jsonwebtoken"
import { logger } from "./logger.js"
import { env } from "@/configs/env.js"

type Payload = {
    sub: string
    v: number
    token_version: number
    role: "doctor" | "user" | "admin"
}

export const createToken = (payLoad: Payload,secret: string,expiresIn: number) => {
     const token = jwt.sign(payLoad,secret,{
        expiresIn,
        algorithm: "HS256" 
     })
     return token;
}

export const verifyToken = (token: string,secret: string) => {
     try {
         const decode = jwt.verify(token,secret,{
            algorithms: ["HS256"] 
         })

         return decode;
     } catch (error) {
         logger.error(`JWT Verification: ${error}`);
         return;
     }
}

export const createRawToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    return rawToken;
}

export const hashToken = (rawToken: string) => {
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    return hashedToken;
}

export const versionVerify = {
    v1: (token: string,isRefresh: boolean) => {
        const secret = isRefresh?env.REFRESH_TOKEN_SECRET:env.ACCESS_TOKEN_SECRET;
        const decode = verifyToken(token,secret) as (Payload | undefined);
        return decode;
    }
}
