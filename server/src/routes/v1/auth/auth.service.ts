import { BadRequestError,ForbiddenError, ServerError, UnauthorizedError } from "@/customs/error/httpErrors.js";
import { LoginUserType } from "./schema/login.js";
import { env } from "@/configs/env.js";
import { CreateUserType } from "./schema/signup.js";
import { sendEmail } from "@utils/sendEmail.js";
import { createRawToken, hashToken } from "@/utils/token.js";
import { logger } from "@/utils/logger.js";
import { comparePassword, hashPassword } from "@/utils/password.js";
import { add2faSecret, enabled2fa, findAndUpdate, findUserByEmail, findUserById, transactionCreate, updateUserByEmail } from "@/db/query/auth.js";
import { createVerificationToken, findAndVerifyToken, updatePassword } from "@/db/query/token.js";
import { VerifyAccountType } from "./schema/verifyAccount.js";
import { generateSecret, generateURI, verify } from "otplib";
import qrcode from "qrcode";

type UpdatedField = {
    loginAttempts: number
    lockExpired?: Date | null
}

export default class AuthService {
    
    static async login(user: LoginUserType) {
         let existUser = await findUserByEmail(user.email);
        if(!existUser) throw new BadRequestError(`Email or Password is not correct`);
        if(!existUser.isVerified) {
            logger.info(`User Login: Account with email: ${existUser.email} haven't verified yet`);
            throw new BadRequestError(`Email or Password is not correct`);
        }
        // Check if it's currently locked
        const isLock = existUser.lockExpired && existUser.lockExpired.getTime()>Date.now();
        if(isLock) {
            logger.warn(`User Login: locked with email: ${existUser.email}`);
            throw new ForbiddenError("User account is locked");
        } 
        const isMatch = await comparePassword(user.password,existUser.password);

        if(!isMatch) {
            const updatedField: UpdatedField = {
                loginAttempts: existUser.loginAttempts+1
            }
            
            if(updatedField.loginAttempts>=env.ATTEMPT_TIME) {
                updatedField.lockExpired = new Date(Date.now()+env.ACCOUNT_LOCK_TIME);
                updatedField.loginAttempts = 0;
            }
            // Wait for data update
            const updatedValue = await updateUserByEmail(existUser.email,updatedField);
            if(!updatedValue) {
                logger.warn(`User Login: Email: ${existUser.email} fail to update login attempt`);
                throw new ServerError("Update failed during login process");
            } 
            logger.warn(`User Login: Email: ${existUser.email}
                                     attempt ${updatedField.loginAttempts} times`);
            throw new BadRequestError(`Email or Password is not correct`);
        } 
        // Reset attempt state when success
        if(existUser.loginAttempts>0 || existUser.lockExpired) {
            const updatedField: UpdatedField = {
                loginAttempts: 0,
                lockExpired: null   
            }
            // Wait for data update
            const updatedValue = await updateUserByEmail(existUser.email,updatedField);
            if(!updatedValue) {
                logger.warn(`User Login: Email: ${existUser.email} fail to reset login attempt`);
                throw new ServerError("Update failed during login process");
            } 
            logger.info(`User Login: Email: ${existUser.email} login Reset`);
        }
        // Verify 2fa if setup
        if(existUser.is2faActive) {
            if(!existUser.twoFactorSecret) {
                logger.warn(`Login User: User ${existUser.id} haven't setup 2fa`);
                throw new UnauthorizedError(`Setup 2fa first`);
            }
            if(!user.otp) {
                logger.warn(`Login User: User ${existUser.id} didn't provide otp`);
                throw new UnauthorizedError(`Invalid or Expired token`);
            }

            const isValid = await verify({ secret: existUser.twoFactorSecret,token: user.otp.toString() });
            if(!isValid.valid) {
                logger.warn(`Login User: User ${existUser.id} provide invalid or expired otp`);
                throw new UnauthorizedError(`Invalid or Expired otp`);
            }
        }
        logger.info(`User Login: Email: ${existUser.email} success`);
        const { password,...withOutPassword } = existUser;
        return withOutPassword;
    }

    static async signup(user: CreateUserType) {
        const hashedPassword = await hashPassword(user.password);
        user.password = hashedPassword;
        const { emailType,userId } = await transactionCreate(user);
        const appName = "Doctordo"; 
        
        let subject: string = "";
        let html: string = "";

        if (emailType === "SEND_WARNING_EMAIL") {
            subject = `Security Alert: Duplicate Signup Attempt for ${appName}`;
            html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #333;">Hello ${user.firstName},</h2>
                    <p>Someone recently tried to create a new account with your email address on <strong>${appName}</strong>.</p>
                    <p style="background-color: #fff4f4; padding: 15px; border-left: 5px solid #d9534f;">
                        <strong>Note:</strong> Your account is already verified. If this was you, you can simply log in as usual. If this was <strong>not</strong> you, your account is still secure, but you may want to update your password just in case.
                    </p>
                    <p>No action is required if you already have an account.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #777;">This is an automated security notification.</p>
                </div>
            `;
        }

        if (emailType === "SEND_VERIFICATION_EMAIL") {
            const rawToken = createRawToken();
            const hashedToken = hashToken(rawToken);
            const verificationLink = `http://localhost:5173/verify?token=${rawToken}&uid=${userId}`; 
            // Testing
            console.log(`Link: ${verificationLink}`)
            const result = await createVerificationToken(userId,hashedToken,"VERIFICATION");
            if(!result) {
                logger.warn(`Signup User: Token create for email: ${user.email} fail`);
                throw new ServerError("Fail to create token");
            }
            subject = `Verify your account on ${appName}`;
            html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #333;">Welcome, ${user.firstName}!</h2>
                    <p>Thank you for signing up. To complete your registration and secure your account, please click the button below to verify your email address:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                        style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Verify Email Address
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #555;">Or copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #007bff; word-break: break-all;">${verificationLink}</p>
                    <p>This link will expire in 24 hours.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #777;">If you did not create this account, you can safely ignore this email.</p>
                </div>
            `;
        }

        // Only send if we actually have a subject (prevents accidental empty emails)
        if (subject && html) {
            await sendEmail(user.email, subject, html);
        }
        return;
    }

    static async verifyAccount(verifyData: VerifyAccountType) {
        const hashedToken = hashToken(verifyData.token);
        const result = await findAndVerifyToken(verifyData.userId,hashedToken);
        if(!result) {
            logger.warn(`Verify Account: userid: ${verifyData.userId} with token: ${verifyData.token} is not valid`);
            throw new UnauthorizedError("Invalid or Expired Token");
        }
        return;
    }

    static async forgotPassword(email: string) {
        const user = await findUserByEmail(email);
        if(!user) {
            logger.warn(`Forgot Password: email: ${email} not exist`);
            return;
        }
        const rawToken = createRawToken();
        const hashedToken = hashToken(rawToken);
        const resetLink = `http://localhost:5173/reset_password?token=${rawToken}&uid=${user.id}`; 
        console.log(`Link: ${resetLink}`);
        const result = await createVerificationToken(user.id,hashedToken,"PASSWORD_RESET");
        if(!result) {
            logger.warn(`Forgot Password: Token create for email: ${user.email} fail`);
            throw new ServerError("Fail to create token");
        }
        const subject = "Reset your password";

        const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset the password for your account.</p>
            <div style="margin: 30px 0;">
            <a href="${resetLink}" 
                style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                Reset Password
            </a>
            </div>
            <p style="font-size: 0.9em; color: #666;">
            This link will expire in 1 hour (or your specific timeframe). 
            If you did not request this, please ignore this email; your account is still secure.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.8em; color: #999;">
            If the button above doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all;">${resetLink}</span>
            </p>
        </div>
        `;
        await sendEmail(user.email,subject,html);
        return;
    }

    static async resetPassword(userId: string,token: string,password: string) {
        const hashedToken = hashToken(token);
        const hashedPassword = await hashPassword(password);
        const result = await updatePassword(userId,hashedToken,hashedPassword);
        if(!result.success) {
            logger.warn(`Reset Password: user with ${userId} or token: ${token} not exist`);
            throw new BadRequestError("Invalid or Expired token");
        }
        return;
    }

    static async refreshToken(userId: string,tokenVersion: number) {
       
        const result = await findUserById(userId);
        if(!result || result.tokenVersion !== tokenVersion) {
            if(!result) logger.warn(`Refresh Token: user with ${userId} not exist`);
            if(result && result.tokenVersion !== tokenVersion) logger.warn(`Refresh Token: user with ${userId} invalid token version`);
            throw new UnauthorizedError("Invalid or Expired token");
        }
        return;
    }

    static async me(userId: string,tokenVersion: number) {
       
        const result = await findUserById(userId);
        if(!result || result.tokenVersion !== tokenVersion) {
            if(!result) logger.warn(`Refresh Token: user with ${userId} not exist`);
            if(result.tokenVersion !== tokenVersion) logger.warn(`Refresh Token: user with ${userId} invalid token version`);
            throw new BadRequestError("Invalid or expired token");
        }
        return result;
    }

    static async logout(userId: string,tokenVersion: number) {
       
        const result = await findAndUpdate(userId,tokenVersion);
        if(!result) {
            logger.warn(`Logout: user with ${userId} fail to update token version`);
            throw new BadRequestError("Invalid or expired token");
        }
        return result;
    }

    static async setup2Fa(userId: string,tokenVersion: number) {
       
       const result = await findUserById(userId);
        if(!result || result.tokenVersion !== tokenVersion) {
            if(!result) logger.warn(`Access Token: user with ${userId} not exist`);
            if(result.tokenVersion !== tokenVersion) logger.warn(`Access Token: user with ${userId} invalid token version`);
            throw new BadRequestError("Invalid or expired token");
        } 
        const secret = generateSecret();
        const issuer = "Doctordo";
        const otpUrl = generateURI({
            label: result.email,
            issuer,
            secret
        })
        const qrCodeUri = await qrcode.toDataURL(otpUrl);
        const updatedValue = await add2faSecret(secret,userId);
        if(!updatedValue) {
            logger.warn(`Setup 2fa: Update fail with userId: ${userId}`);
            throw new UnauthorizedError("Invalid or Expired token");
        } 
        return { qrCodeUri };
    }

    static async verify2Fa(userId: string,tokenVersion: number,otp: number) {
       
       const result = await findUserById(userId);
        if(!result || result.tokenVersion !== tokenVersion) {
            if(!result) logger.warn(`Access Token: user with ${userId} not exist`);
            if(result.tokenVersion !== tokenVersion) logger.warn(`Access Token: user with ${userId} invalid token version`);
            throw new BadRequestError("Invalid or expired token");
        } 
        
        // Verify otp
        if(!result.twoFactorSecret) {
            logger.warn(`Verify 2fa: User ${userId} haven't setup 2fa`);
            throw new UnauthorizedError(`Setup 2fa first`);
        }
        const isValid = await verify({ secret: result.twoFactorSecret,token: otp.toString() });
        if(!isValid.valid) {
            logger.warn(`Verify 2fa: User ${userId} provide invalid or expired otp`);
            throw new UnauthorizedError(`Invalid or Expired otp`);
        }
        const updatedValue = await enabled2fa(userId);
        if(!updatedValue) {
            logger.warn(`Verify 2fa: Update fail with userId: ${userId}`);
            throw new UnauthorizedError("Invalid or Expired token");
        } 
        return;
    }
}