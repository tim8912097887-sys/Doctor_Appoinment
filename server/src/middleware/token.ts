import jwt,{ JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "@customs/error/httpErrors.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { versionVerify } from "@/utils/token.js";
import { logger } from "@/utils/logger.js";

interface AuthPayload extends JwtPayload {
    sub: string
    v: number
    token_version: number
    role: "doctor" | "user" | "admin"
}

type Current_Verion = 'v1';

export const refreshTokenVerify = asyncHandler((req,_res,next) => {
       const { refreshToken } = req.cookies;
       if(!refreshToken) {
        logger.warn(`Refresh Token Verify: Not Provide refreshToken`);
        throw new UnauthorizedError("Unauthenticated");
       } 
       const unVerified = jwt.decode(refreshToken) as AuthPayload;
       const version = unVerified?.v?`v${unVerified?.v}`:'v1';
       const hasVersion = version in versionVerify;
       if(!hasVersion) {
        logger.warn(`Refresh Token Verify: ${refreshToken} with invalid verion: ${version}`);
        throw new UnauthorizedError("Invalid or Expired token");
       } 
       const decode = versionVerify[version as Current_Verion](refreshToken,true);
       if(!decode) {
         logger.warn(`Refresh Token Verify: Invalid or Expired token: ${refreshToken}`);
         throw new UnauthorizedError("Invalid or Expired token");
       }
       req.user = decode;
       return next();
})

export const accessTokenVerify = asyncHandler((req,_res,next) => {
       const bearerToken = req.get("Authorization");
       if(!bearerToken || !bearerToken.split(" ")[1]) {
        logger.warn(`Access Token Verify: Not Provide accessToken`);
        throw new UnauthorizedError("Unauthenticated");
       } 
       const accessToken = bearerToken.split(" ")[1];
       const unVerified = jwt.decode(accessToken) as AuthPayload;
       const version = unVerified?.v?`v${unVerified?.v}`:'v1';
       const hasVersion = version in versionVerify;
       if(!hasVersion) {
        logger.warn(`Access Token Verify: ${accessToken} with invalid verion: ${version}`);
        throw new UnauthorizedError("Invalid or Expired token");
       } 
       const decode = versionVerify[version as Current_Verion](accessToken,false);
       if(!decode) {
         logger.warn(`Access Token Verify: Invalid or Expired token: ${accessToken}`);
         throw new UnauthorizedError("Invalid or Expired token");
       }
       req.user = decode;
       return next();
})