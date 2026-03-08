import { env } from "@/configs/env.js";
import { CorsOptions } from "cors";

const allowedOrigin = ["http://localhost:5173"];

export const corsOptions: CorsOptions = {
   methods: ["GET","POST","PUT","DELETE"],
   origin: function(origin,callback) {

      // Allow testing tool access
      if(env.NODE_ENV==="development" && !origin) {
           return callback(null,true);
      } 

      if(origin && allowedOrigin.includes(origin)) {
         return callback(null,true);
      } else {
         return callback(new Error('Not allowed by CORS'));
      }
      
   },
   allowedHeaders: ['Content-Type', 'Authorization'],
   credentials: true
}