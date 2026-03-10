import z from "zod";

export const VerifyOtpSchema = z.object({
    otp: z.coerce
          .number({ error: "otp must be number" })
          .positive()
          .min(100000,"otp is six digit")
          .max(999999,"otp is six digit")
})

export type VerifyOtpType = z.infer<typeof VerifyOtpSchema>;