import { BadRequestError, ForbiddenError, NotFoundError } from "@/customs/error/httpErrors.js";
import { findDoctorById } from "@/db/query/doctor.js";
import { DoctorIdSchema } from "@/routes/v1/doctor/schema/doctorId.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { logger } from "@/utils/logger.js";

type Role = "user" | "doctor" | "admin"

export const ownerOrAdminCheck = (role: Role) => (asyncHandler(async(req,_res,next) => {
     const { id } = req.params;
     const result = DoctorIdSchema.safeParse(id);
     if(!result.success) {
        logger.error(`Owner or admin check: id: ${id} is not valid uuid`);
        throw new BadRequestError(`Invalid Credentials`);
     }
     if(req.user?.role === "admin" ) return next();
     const existDoctor = await findDoctorById(result.data);
     if(!existDoctor) {
        logger.warn(`Owner or admin check: doctor with id ${id} is not exist`);
        throw new NotFoundError("Doctor not found");
     }
     if(req.user?.role !== role || req.user.sub !== existDoctor.userId) {
        if(req.user?.role !== role) logger.error(`Owner or admin check: id: ${req.user?.sub} user with ${req.user?.role} role is forbidden`);
        if(req.user?.sub !== existDoctor.userId) logger.error(`Owner or admin check: id: id: ${req.user?.sub} user is not owner of doctorId: ${id}`);
        throw new ForbiddenError(`Forbidden`);
     }
     return next();
}))