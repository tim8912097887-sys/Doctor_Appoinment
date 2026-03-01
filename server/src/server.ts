import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

export const app = express();
// Use in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the logs directory path
const logDirectory = path.join(__dirname, "logs");

// Ensure the directory exists synchronously before creating the stream
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// For log write
const appendStream = fs.createWriteStream(path.join(logDirectory, "access.log"),{ flags: 'a' });
// Body parser middleware
app.use(express.json());

// HTTP request logger middleware
app.use(morgan(':method :url :status :res[content-length] - :response-time ms')); // Log to console
app.use(morgan("combined",{ stream: appendStream })) // Log to file
// Healthy check endpoint
app.get('/health', (_, res) => {
  res.send('OK');
});

app.listen(3000,() => {
    console.log("Server running on port 3000");
})

