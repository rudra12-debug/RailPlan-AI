import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("⚠️ MONGODB_URI not provided. Running with in-memory persistence fallback.");
    return false;
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "railplan_ai",
    });
    console.log("✅ Successfully connected to MongoDB Atlas!");
    return true;
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error);
    return false;
  }
}
