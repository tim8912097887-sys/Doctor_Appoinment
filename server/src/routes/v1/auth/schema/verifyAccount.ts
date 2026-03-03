import z from "zod";

export const VerifyAccountSchema = z.object({
    userId: z.string("User id must be string").nonempty("User id must not empty"),
    token: z
           .string("Token must be string")
           .length(64, { message: "Token must be exactly 64 characters long" })
           .regex(/^[0-9a-fA-F]+$/, { message: "Token must be a valid hexadecimal string" })
})

export type VerifyAccountType = z.infer<typeof VerifyAccountSchema>;