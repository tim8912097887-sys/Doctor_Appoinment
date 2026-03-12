import { NotFoundError } from "@/customs/error/httpErrors.js";
import { createDoctor, deleteDoctor, findAllDoctors, findDoctorById } from "@/db/query/doctor.js"
import { logger } from "@/utils/logger.js";
import { CreateDoctorType } from "./schema/createDoctor.js";
import { findUserById } from "@/db/query/auth.js";

export default class DoctorService {
    
   static getAllDoctors = async() => {
      const doctors = await findAllDoctors();
      return doctors;
   }

   static getDoctorById = async(id: string) => {
         
      const doctor = await findDoctorById(id);
      if(!doctor) {
         logger.warn(`Get Doctor By Id: Doctor with id: ${id} is not exist`);
         throw new NotFoundError(`Doctor not exist`);
      }
      return doctor;
   }

   static createDoctor = async(doctorInfo: CreateDoctorType) => {
       const existUser = await findUserById(doctorInfo.userId);
       if(!existUser) {
          logger.warn(`Create Doctor: User with id ${doctorInfo.userId} is not exist`);
          throw new NotFoundError("User not found");
       }
       const createdDoctor = await createDoctor(doctorInfo);
       return createdDoctor;
   }

   static deleteDoctor = async(id: string) => {
      await deleteDoctor(id);
      return;
   }
}