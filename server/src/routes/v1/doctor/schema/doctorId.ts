import z from "zod";

export const DoctorIdSchema = z.uuid()

export type DoctorIdType = z.infer<typeof DoctorIdSchema>;