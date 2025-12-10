import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { userRoute } from './routes/userRoute.js';
import { residencyRoute } from './routes/residencyRoute.js';
import { connectDB } from './config/mongoConfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config()

const app = express();
const PORT = process.env.PORT || 8000;

// CORS first so headers are set even on body-parser errors
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.options('*', cors({ origin: allowedOrigin, credentials: true }));

// Increase body limits to allow base64 images
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))
app.use(cookieParser())

// Serve static images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, 'images')));

// Register routes
app.use('/api/user', userRoute)
app.use("/api/residency", residencyRoute)

// Start server with MongoDB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();