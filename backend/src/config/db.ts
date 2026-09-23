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
    } as any);
    console.log("✅ Successfully connected to MongoDB Atlas!");
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      console.log("📡 MongoDB Atlas Ping verified - Telemetry registered!");
    }
    return true;
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error);
    return false;
  }
}
