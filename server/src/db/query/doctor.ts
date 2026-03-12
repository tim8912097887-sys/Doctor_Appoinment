import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db.js"
import { doctors } from "../schema/doctor.js"
import { CreateDoctorType } from "@/routes/v1/doctor/schema/createDoctor.js";
import { NotFoundError, ServerError } from "@/customs/error/httpErrors.js";
import { logger } from "@/utils/logger.js";
import { users } from "../schema/user.js";


export const findAllDoctors = async() => {
    const doctor = await db.select({
        id: doctors.id,
        specialization: doctors.specialization,
        experience: doctors.experience,
        bio: doctors.bio,
        isAvailable: doctors.isAvailable
    }).from(doctors).where(isNull(doctors.deletedAt));
    return doctor;
}

export const findDoctorById = async(id: string) => {
    const [doctor] = await db.select({
        id: doctors.id,
        userId: doctors.userId,
        specialization: doctors.specialization,
        experience: doctors.experience,
        bio: doctors.bio,
        isAvailable: doctors.isAvailable
    }).from(doctors).where(and(eq(doctors.id,id),isNull(doctors.deletedAt)));
    return doctor;
}

export const createDoctor = async(doctorInfo: CreateDoctorType) => {
    const [doctor] = await db.insert(doctors)
                             .values(doctorInfo)
                             .returning({
                                id: doctors.id,
                                specialization: doctors.specialization,
                                experience: doctors.experience,
                                bio: doctors.bio,
                                isAvailable: doctors.isAvailable
                             });
    if(!doctor) {
        logger.error(`Create Doctor: Fail to create doctor`);
        throw new ServerError(`Fail to create doctor`);
    }
    
    const updatedInfo = await db.update(users)
                                  .set({
                                     role: "doctor"
                                  }).where(eq(users.id,doctorInfo.userId));
    if(!updatedInfo.rowCount) {
        logger.error(`Create Doctor: Fail to update user with id: ${doctorInfo.userId}`);
        throw new ServerError(`Fail to update user`);
    }
    return doctor;
}

export const deleteDoctor = async(id: string) => {

    const result = await db.update(doctors)
            .set({
                deletedAt: new Date()
            }).where(and(eq(doctors.id,id),isNull(doctors.deletedAt)));
    if(!result.rowCount) {
        logger.error(`Delete Doctor: fail to delete doctor with id: ${id}`);
        throw new NotFoundError("Doctor not found");
    }
    return;
}