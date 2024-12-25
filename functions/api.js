import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "../Route/contact.route.js";
import mongoose from "mongoose";
import ServerlessHttp from "serverless-http";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// MongoDB connection options
const mongoOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  socketTimeoutMS: 45000,         // Close sockets after 45 seconds
  maxPoolSize: 10,                // Maintain up to 10 socket connections
  connectTimeoutMS: 5000,         // Give up initial connection after 5 seconds
};

// Database connection with connection pooling
let cachedDb = null;
const connectDB = async () => {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    const client = await mongoose.connect(process.env.MONGO_URI, mongoOptions);
    cachedDb = client;
    console.log('MongoDB Connected');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

// Routes with error handling
app.get("/.netlify/functions/api", (req, res) => {
  res.json({ message: "Backend API is running!" });
});

// Middleware to ensure database connection before processing requests
app.use(async (req, res, next) => {
  try {
    if (!cachedDb) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

app.use("/.netlify/functions/api/users", userRouter);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Export handler for serverless
export const handler = ServerlessHttp(app);
