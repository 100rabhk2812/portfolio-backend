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
app.use(cors());
app.use(express.json());

// Routes
app.get("/.netlify/functions/api", (req, res) => {
  res.json({ message: "Hello from API!" });
});

app.use("/.netlify/functions/api/users", userRouter);

// Export handler for serverless
export const handler = ServerlessHttp(app);
