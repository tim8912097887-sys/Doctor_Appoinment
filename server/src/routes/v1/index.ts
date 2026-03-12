import express from "express";
import { authRouter } from "./auth/auth.route.js";
import { doctorRouter } from "./doctor/doctor.route.js";

export const v1Router = express.Router();

v1Router.use("/v1/auth",authRouter);

v1Router.use("/v1/doctors",doctorRouter);