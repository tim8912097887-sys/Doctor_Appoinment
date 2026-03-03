import jwt,{ JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "@customs/error/httpErrors.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { versionVerify } from "@/utils/token.js";

interface AuthPayload extends JwtPayload {
    sub: string
    v: number
    token_version: number
    role: "doctor" | "user" | "admin"
}

type Current_Verion = 'v1';

export const refreshTokenVerify = asyncHandler((req,_res,next) => {
       const { refreshToken } = req.cookies;
       if(!refreshToken) throw new UnauthorizedError("Unauthicated");
       const unVerified = jwt.decode(refreshToken) as AuthPayload;
       const version = unVerified?.v?`v${unVerified?.v}`:'v1';
       const hasVersion = version in versionVerify;
       if(!hasVersion) throw new UnauthorizedError("Unauthicated");
       const decode = versionVerify[version as Current_Verion](refreshToken,true);
       req.user = decode;
       return next();
})