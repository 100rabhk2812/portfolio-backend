import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "../Route/contact.route.js";
import mongoose from "mongoose";
import ServerlessHttp from "serverless-http";

dotenv.config();

const app = express();
const dbUrl = process.env.MONGO_URI;

// MongoDB connection
mongoose.connect(dbUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("Error", error.message));

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

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
