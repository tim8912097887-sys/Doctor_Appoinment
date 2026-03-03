import z from "zod";

export const ResetPasswordSchema = z.object({
    userId: z.string("User id must be string").nonempty("User id must not empty"),
    password: z.string()
               .min(8,"Password at least eight character")
               .max(50,"Password at most fifty character")
               .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,"Password should include small and big letter and number and one special character"),
    token: z
           .string("Token must be string")
           .length(64, { message: "Token must be exactly 64 characters long" })
           .regex(/^[0-9a-fA-F]+$/, { message: "Token must be a valid hexadecimal string" })
})

export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;