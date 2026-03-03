import express from "express";
import { authRouter } from "./auth/auth.route.js";

export const v1Router = express.Router();

v1Router.use("/v1/auth",authRouter);