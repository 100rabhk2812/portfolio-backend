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
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  connectTimeoutMS: 5000,
  retryWrites: true,
  w: "majority"
};

// Database connection with better error handling
let cachedDb = null;
const connectDB = async () => {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('MONGO_URI is not defined in environment variables');
      throw new Error('MongoDB URI is not configured');
    }

    console.log('Attempting to connect to MongoDB...');
    const client = await mongoose.connect(mongoUri, mongoOptions);
    
    // Test the connection
    await client.connection.db.admin().ping();
    
    cachedDb = client;
    console.log('Successfully connected to MongoDB');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
};

// Middleware to ensure database connection before processing requests
app.use(async (req, res, next) => {
  try {
    if (!cachedDb || !mongoose.connection.readyState) {
      console.log('No cached connection, attempting to connect...');
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database middleware error:', error);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Test route to check API status
app.get("/.netlify/functions/api", (req, res) => {
  res.json({ 
    message: "Backend API is running!",
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use("/.netlify/functions/api/users", userRouter);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Export handler for serverless
export const handler = ServerlessHttp(app);
