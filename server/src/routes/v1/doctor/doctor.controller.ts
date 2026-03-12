import { asyncHandler } from "@/utils/asyncHandler.js";
import DoctorService from "./doctor.service.js";
import { responseEnvelope } from "@/utils/responseEnvelope.js";
import { DoctorIdSchema } from "./schema/doctorId.js";
import { logger } from "@/utils/logger.js";
import { BadRequestError, UnauthorizedError } from "@/customs/error/httpErrors.js";
import { CreateDoctorType } from "./schema/createDoctor.js";


export default class DoctorController {
    
   static getAllDoctors = asyncHandler(async(_req,res) => {
    
        const doctors = await DoctorService.getAllDoctors(); 
        const data = {
            doctors,
            message: "Successfully get all doctors"
        }
        res.status(200).json(responseEnvelope({
            state: "success",
            data
        }))
   })

   static getDoctorById = asyncHandler(async(req,res) => {

       const { id } = req.params;
       const result = DoctorIdSchema.safeParse(id);
       if(!result.success) {
         logger.warn(`Get Doctor By Id: doctor id: ${id} is not valid uuid`);
         throw new BadRequestError("Invalid Credentials");
       }
       const doctorId = result.data;
       const doctor = await DoctorService.getDoctorById(doctorId);
       const data = {
            doctor,
            message: "Successfully get doctor"
        }
       res.status(200).json(responseEnvelope({
          state: "success",
          data
       }))
   })

   static createDoctor = asyncHandler(async(req,res) => {
       if(!req.validData) throw new UnauthorizedError("Invalid Credentials");
       const doctorInfo = req.validData as CreateDoctorType;
       const createdDoctor = await DoctorService.createDoctor(doctorInfo);
       const data = {
            doctor: createdDoctor,
            message: "Successfully create doctor"
       }
       res.status(200).json(responseEnvelope({
          state: "success",
          data
       }))
   })

   static deleteDoctor = asyncHandler(async(req,res) => {

      const { id } = req.params;
      const doctorId = id as string;
      await DoctorService.deleteDoctor(doctorId);
      const data = {
            message: "Successfully delete doctor"
       }
      res.status(200).json(responseEnvelope({
         state: "success",
         data
      }))
   })
}