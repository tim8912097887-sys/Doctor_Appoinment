import z from "zod";

export const LoginUserSchema = z.object({
    email: z.email("Invalid Email").trim().toLowerCase(),
    password: z.string()
               .min(8,"Password at least eight character")
               .max(50,"Password at most fifty character")
               .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,"Password should include small and big letter and number and one special character"),
    otp: z.coerce
              .number({ error: "otp must be number" })
              .positive()
              .min(100000,"otp is six digit")
              .max(999999,"otp is six digit").optional()
})

export type LoginUserType = z.infer<typeof LoginUserSchema>;