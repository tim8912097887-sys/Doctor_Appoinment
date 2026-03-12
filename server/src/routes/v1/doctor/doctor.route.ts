import express from "express";
import { accessTokenVerify } from "@/middleware/token.js";
import DoctorController from "./doctor.controller.js";
import { roleCheck } from "@/middleware/roleCheck.js";
import { schemaValidator } from "@/middleware/schemaValidators.js";
import { CreateDoctorSchema } from "./schema/createDoctor.js";
import { ownerOrAdminCheck } from "@/middleware/ownerOrAdminCheck.js";

export const doctorRouter = express.Router();

// Public: View all doctors or single profile
doctorRouter.get("/", DoctorController.getAllDoctors);
doctorRouter.get("/:id", DoctorController.getDoctorById);

// Protected: Only Admins can create doctor profiles (usually via a vetting process)
doctorRouter.post("/", 
    accessTokenVerify, 
    roleCheck(['admin']), 
    schemaValidator(CreateDoctorSchema),
    DoctorController.createDoctor
);

// Protected: Admin or the Doctor themselves can update/delete
doctorRouter.delete("/:id", 
    accessTokenVerify, 
    ownerOrAdminCheck('doctor'), 
    DoctorController.deleteDoctor
);