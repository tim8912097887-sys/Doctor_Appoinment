import z,{ type ZodObject } from "zod";

export const schemaValidator = (schema: ZodObject) => ((value: object) => {
     let errorObject = {};
     const result = schema.safeParse(value);
     if(!result.success) {
         const error = z.flattenError(result.error) as any;
         errorObject = Object.keys(error.fieldErrors).reduce((acc: any,key) => {
                 acc[key] = error.fieldErrors[key][0];
                 return acc;
         },{});
     }
     return errorObject;
})