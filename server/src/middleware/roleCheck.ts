import { ForbiddenError } from "@/customs/error/httpErrors.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { logger } from "@/utils/logger.js";

type Role = "user" | "doctor" | "admin"

export const roleCheck = (roles: Role[]) => (asyncHandler((req,_res,next) => {
       
       let isAllow = false;
       roles.forEach((role) => {
             if(role === req.user?.role) isAllow = true;
       })
       
       if(!isAllow) {
          logger.error(`${req.baseUrl} User with id: ${req.user?.sub} and role: ${req.user?.role} is fobidden`);
          throw new ForbiddenError("Forbidden");
       }
       return next();
}))