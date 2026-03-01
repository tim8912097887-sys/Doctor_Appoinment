import express from 'express';
import morgan from 'morgan';
import { errorHandler } from '@middleware/errorHandler.js';
import { notFoundHandler } from '@middleware/notFoundHandler.js';
import fs from 'fs';


export const initializeApp = (appendStream: fs.WriteStream) => {

  const app = express();
  // Body parser middleware
  app.use(express.json());

  // HTTP request logger middleware
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms')); // Log to console
  app.use(morgan("combined",{ stream: appendStream })) // Log to file
  // Healthy check endpoint
  app.get('/health', (_, res) => {
    res.send('OK');
  });

  // Error Handler
  app.use(errorHandler);
  app.use(notFoundHandler);
  return app;
}


