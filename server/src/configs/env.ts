import { logger } from "@/utils/logger.js";
import z from "zod";

const EnvSchema = z.object({
    // NODE_ENV Validation
  NODE_ENV: z
    .enum(['development', 'test', 'production'], {
      error: "NODE_ENV must be 'development', 'test', or 'production'",
    })
    .default('development'),

  // PORT Validation
  PORT: z.coerce
    .number({
      error: "PORT must be a number",
    })
    .int()
    .positive("PORT must be a positive integer")
    .max(65535, "PORT cannot exceed 65535")
    .default(3000),
    DATABASE_URL: z
      .string()
      .startsWith("postgresql://", "URL must begin with postgresql://")
      .regex(
        /^postgresql:\/\/(?:([^:]+)(?::([^@]+))?@)?([^:\/]+)(?::(\d+))?(?:\/([^?]+))?(?:\?(.+))?$/,
        "String is not a valid PostgreSQL connection URI"
      ),
    SALT: z.coerce.number({
      error: "Salt must be a number",
    })
    .int()
    .positive("Salt must be a positive integer")
    .default(10),
    ATTEMPT_TIME: z.coerce.number({
      error: "Attempt time must be a number",
    })
    .int()
    .positive("Attempt time must be a positive integer")
    .default(3),
    ACCOUNT_LOCK_TIME: z.coerce.number({
      error: "Account lock time must be a number",
    })
    .int()
    .positive("Account lock time must be a positive integer")
    .default(30000),
    REFRESH_TOKEN_SECRET: z.string("Refresh token secret should be string").nonempty("Refresh token secret can't be empty"),
    ACCESS_TOKEN_SECRET: z.string("Access token secret should be string").nonempty("Access token secret can't be empty"),
    REFRESH_TOKEN_EXPIRED: z.coerce.number({
      error: "Refresh token expired must be a number",
    })
    .int()
    .positive("Refresh Token expired must be a positive integer")
    .default(86400),
    ACCESS_TOKEN_EXPIRED: z.coerce.number({
      error: "Access token expired must be a number",
    })
    .int()
    .positive("Access Token expired must be a positive integer")
    .default(900),
    RESEND_API_KEY: z.string("Resend api key must be string").nonempty("Resend api key must not be empty"),
    TOKEN_VERSION: z.coerce
                    .number("Token version must be a number")
                    .positive("Token version must greater than zero"),
    TOKEN_EXPIRED: z.coerce
                    .number("Token expired must be a number")
                    .positive("Token expired must greater than zero"),
    // BASE_URI: z.string("Base uri must be string").nonempty("Base uri must not be empty"),
})

const result = EnvSchema.safeParse(process.env);
// Stop the application by throw error
if(!result.success) {
     const errorMessage = result.error.issues
    .map((issue) => `- ${issue.path.join('.')} : ${issue.message}`).join('\n');
    logger.error(`Environment variables Error: ${errorMessage}`);
    // Should exit when env not available
    process.exit(1);
} 
// Validated data
export const env = result.data;
// throw new Error("Unhandle Exception");