import { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "@utils/asyncHandler.js"
import { LoginUserType } from "./schema/login.js";
import AuthService from "./auth.service.js";
import { env } from "@/configs/env.js";
import { createToken } from "@/utils/token.js";
import { responseEnvelope } from "@/utils/responseEnvelope.js";
import { CreateUserType } from "./schema/signup.js";
import { UnauthorizedError,BadRequestError } from "@/customs/error/httpErrors.js";
import { logger } from "@/utils/logger.js";
import { ResetPasswordType } from "./schema/resetPassword.js";
import { ForgotPasswordType } from "./schema/forgotPassword.js";
import { VerifyAccountType } from "./schema/verifyAccount.js";


interface AuthPayload extends JwtPayload {
    sub: string
    v: number
    token_version: number
    role: "doctor" | "user" | "admin"
}

export default class AuthController {
    
   static loginUser = asyncHandler(async(req,res) => {
        if(!req.validData) throw new BadRequestError("Invalid Credentials");
        const existUser = await AuthService.login(req.validData as LoginUserType);
        const payload = { sub: existUser.id,v: env.TOKEN_VERSION,token_version: existUser.tokenVersion,role: existUser.role };
        const accessToken = createToken(payload,env.ACCESS_TOKEN_SECRET,env.ACCESS_TOKEN_EXPIRED);
        const refreshToken = createToken(payload,env.REFRESH_TOKEN_SECRET,env.REFRESH_TOKEN_EXPIRED);
        const data = { user: existUser,accessToken,message: "Successfully Login" };
        res.cookie("refreshToken",refreshToken,{
            sameSite: "lax",
            // Secure cookie
            httpOnly: true,
            // Same as refresh token
            maxAge: env.REFRESH_TOKEN_EXPIRED,
            secure: env.NODE_ENV==="production"
        })
        res.status(200).json(responseEnvelope({ state: "success",data }));
    })

    static signupUser = asyncHandler(async(req,res) => {
        if(!req.validData) throw new BadRequestError("Invalid Credential");
        await AuthService.signup(req.validData as CreateUserType);
        const data = { message: "Please Verify account before login" };
        res.status(201).json(responseEnvelope({ state: "success",data }));
    })

    static logoutUser = asyncHandler(async(req,res) => {
        if(!req.user) throw new UnauthorizedError("Invalid Token");
        const user = req.user as AuthPayload;
        await AuthService.logout(user.sub,user.token_version);
        const data = {
            message: "Successfully logout"
        }
        // The config option must match
        res.clearCookie("refreshToken",{
            sameSite: "lax",
            // Secure cookie
            httpOnly: true,
            secure: env.NODE_ENV==="production"
        })
        res.status(200).json(responseEnvelope({ state: "success",data }));
    })

    static refreshUser = asyncHandler(async(req,res) => {
        if(!req.user) throw new UnauthorizedError("Invalid Token");
        const user = req.user as AuthPayload;
        await AuthService.refreshToken(user.sub,user.token_version);
        const payload = { sub: user.sub,v: user.v,token_version: user.token_version,role: user.role };
        const accessToken = createToken(payload,env.ACCESS_TOKEN_SECRET,env.ACCESS_TOKEN_EXPIRED);
        const newRefreshToken = createToken(payload,env.REFRESH_TOKEN_SECRET,env.REFRESH_TOKEN_EXPIRED);
        const data = { accessToken,message: "Successfully get new token" };
        // Refresh token rotation
        res.cookie("refreshToken",newRefreshToken,{
            sameSite: "lax",
            // Secure cookie
            httpOnly: true,
            // Same as refresh token
            maxAge: Number(env.REFRESH_TOKEN_EXPIRED),
            secure: env.NODE_ENV==="production"
        })
        res.status(200).json(responseEnvelope({ state: "success",data }));
    })

    static me = asyncHandler(async(req,res) => {
        if(!req.user) throw new UnauthorizedError("Invalid or expired Token");
        const user = req.user as AuthPayload;
        const existUser = await AuthService.me(user.sub,user.token_version);
        logger.info(`User with id ${user.sub} is in login state`);
        const data = { user: existUser };
        res.status(200).json(responseEnvelope({ state: "success",data }));
    })

    static verification = asyncHandler(async(req,res) => {
        const verifyData = req.validData as VerifyAccountType;
        await AuthService.verifyAccount(verifyData);
        const data = { message: "Please login" };
        res.status(200).json(responseEnvelope({ state: "success",data }));
    })

    static forgotPassword = asyncHandler(async(req,res) => {
        
         if(!req.validData) throw new UnauthorizedError("Invalid Credentials");
        const provideUser = req.validData as ForgotPasswordType;
        await AuthService.forgotPassword(provideUser.email);
        const data = { message: "Email has sent,please check your email" };
        res.status(200).json(responseEnvelope({ state: "success",data }));
    })

    static resetPassword = asyncHandler(async(req,res) => {
  
        if(!req.validData) throw new UnauthorizedError("Invalid Credentials");
        const user = req.validData as ResetPasswordType;
        await AuthService.resetPassword(user.userId,user.token,user.password);
        const data = { message: "Please login with your new password" };
        res.status(200).json(responseEnvelope({ state: "success",data }));
    })
}