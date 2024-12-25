import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./Route/contact.route.js";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 5001;
const dbUrl = process.env.MONGO_URI;
const app = express();

// MongoDB connection
try {
  mongoose.connect(dbUrl);
  console.log("Connected to MongoDB");
} catch (error) {
  console.log("Error", error.message);
}

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.json({ message: "Hello World!" });
});

app.use("/users", userRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
