// Third party
import express from "express";
// Services
import AuthController from "./auth.controller.js";
// Middleware
import { schemaValidator } from "@/middleware/schemaValidators.js";
import { accessTokenVerify, refreshTokenVerify } from "@middleware/token.js";
// Schema
import { LoginUserSchema } from "./schema/login.js";
import { CreateUserSchema } from "./schema/signup.js";
import { ForgotPasswordSchema } from "./schema/forgotPassword.js";
import { ResetPasswordSchema } from "./schema/resetPassword.js";
import { VerifyAccountSchema } from "./schema/verifyAccount.js";
import { VerifyOtpSchema } from "./schema/verifyOtp.js";

export const authRouter = express.Router();

authRouter.post("/login",schemaValidator(LoginUserSchema),AuthController.loginUser);
authRouter.post("/signup",schemaValidator(CreateUserSchema),AuthController.signupUser);
authRouter.post("/verification",schemaValidator(VerifyAccountSchema),AuthController.verification);
authRouter.delete("/logout",refreshTokenVerify,AuthController.logoutUser);
authRouter.get("/refresh",refreshTokenVerify,AuthController.refreshUser);
authRouter.get("/me",refreshTokenVerify,AuthController.me);
authRouter.post("/forgotpassword",schemaValidator(ForgotPasswordSchema),AuthController.forgotPassword);
authRouter.put("/resetpassword",schemaValidator(ResetPasswordSchema),AuthController.resetPassword);
authRouter.post("/setup2fa",accessTokenVerify,AuthController.setup2Fa);
authRouter.post("/verify2fa",accessTokenVerify,schemaValidator(VerifyOtpSchema),AuthController.verify2Fa);