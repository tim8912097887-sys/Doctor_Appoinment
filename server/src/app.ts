import express from 'express';
import morgan from 'morgan';
import cors from "cors";
import { errorHandler } from '@middleware/errorHandler.js';
import { notFoundHandler } from '@middleware/notFoundHandler.js';
import fs from 'fs';
import { v1Router } from './routes/v1/index.js';
import cookieParser from 'cookie-parser';
import { corsOptions } from '@utils/corsConfig.js';


export const initializeApp = (appendStream: fs.WriteStream) => {

  const app = express();
  // Config cors
  app.use(cors(corsOptions))
  // Body parser middleware
  app.use(express.json());
  app.use(cookieParser());
  // HTTP request logger middleware
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms')); // Log to console
  app.use(morgan("combined",{ stream: appendStream })) // Log to file
  // Healthy check endpoint
  app.get('/health', (_, res) => {
    res.send('OK');
  });
  // V1 routes
  app.use("/api",v1Router);
  // Error Handler
  app.use(errorHandler);
  app.use(notFoundHandler);
  return app;
}


