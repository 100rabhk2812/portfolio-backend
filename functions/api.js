import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "../Route/contact.route.js";
import mongoose from "mongoose";
import ServerlessHttp from "serverless-http";

dotenv.config();

const app = express();

// Enable detailed errors in development
const isDevelopment = process.env.NODE_ENV === 'development'; // Set to true to see detailed errors

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
  try {
    if (cachedDb && mongoose.connection.readyState === 1) {
      console.log('Using cached database connection');
      return cachedDb;
    }

    const mongoUri = process.env.MONGO_URI;
    console.log('MongoDB URI exists:', !!mongoUri); // Log if URI exists (without showing it)
    
    if (!mongoUri) {
      throw new Error('MongoDB URI is not configured in environment variables');
    }

    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    console.log('Attempting to connect to MongoDB...');
    const client = await mongoose.connect(mongoUri, mongoOptions);
    
    // Test the connection
    await client.connection.db.admin().ping();
    
    cachedDb = client;
    console.log('Successfully connected to MongoDB');
    return cachedDb;
  } catch (error) {
    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.code,
      state: mongoose.connection.readyState
    };
    console.error('MongoDB connection error details:', errorDetails);
    throw new Error(`Database Connection Error: ${error.message}`);
  }
};

// Middleware to ensure database connection before processing requests
app.use(async (req, res, next) => {
  try {
    if (!cachedDb || mongoose.connection.readyState !== 1) {
      console.log('No active connection, attempting to connect...');
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database middleware error:', error);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: isDevelopment ? error.message : 'Internal server error',
      details: isDevelopment ? {
        readyState: mongoose.connection.readyState,
        hasEnvVar: !!process.env.MONGO_URI
      } : undefined
    });
  }
});

// Test route to check API and database status
app.get("/.netlify/functions/api", (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ 
    message: "Backend API is running!",
    mongoStatus: dbState[mongoose.connection.readyState],
    hasMongoUri: !!process.env.MONGO_URI,
    nodeEnv: process.env.NODE_ENV || 'not set'
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
    error: isDevelopment ? err.message : 'Internal server error',
    stack: isDevelopment ? err.stack : undefined
  });
});

// Export handler for serverless
export const handler = ServerlessHttp(app);
