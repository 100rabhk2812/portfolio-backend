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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't throw the error, just log it
    return;
  }
};

// Connect to MongoDB
connectDB();

// Routes
app.get("/.netlify/functions/api", (req, res) => {
  res.json({ message: "Backend API is running!" });
});

app.use("/.netlify/functions/api/users", userRouter);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Export handler for serverless
export const handler = ServerlessHttp(app);
