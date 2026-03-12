import z from "zod";

export const CreateDoctorSchema = z.object({
    userId: z.uuid("Invalid User ID format"),

    specialization: z.string({
      error: "Specialization is required",
    }).min(2, "Specialization must be at least 2 characters")
      .max(100, "Specialization cannot exceed 100 characters"),

    experience: z.number({
      error: "Experience is a number"
    }).int()
      .min(0, "Experience cannot be negative")
      .default(0),

    bio: z.string()
      .max(1000, "Bio cannot exceed 1000 characters")
      .optional()
      .nullable(),

    isAvailable: z.boolean()
      .default(true)
      .optional(),
});

// Type inference for use in services
export type CreateDoctorType = z.infer<typeof CreateDoctorSchema>;