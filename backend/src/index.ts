import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { ServiceRequestModel, BundledOrderModel, T806SanctionModel, AuditLogModel } from "./models";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vercel frontend and Localhost
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "HEALTHY",
    service: "RailPlan AI - High-Density Railway Operations API",
    mode: "Production / Render Web Service",
    timestamp: new Date().toISOString(),
    database: "MongoDB Atlas",
  });
});

// Sync State Endpoint
app.get("/api/railplan/sync", async (req: Request, res: Response) => {
  try {
    const requests = await ServiceRequestModel.find().lean();
    const bundles = await BundledOrderModel.find().lean();
    const sanctions = await T806SanctionModel.find().lean();
    const auditLogs = await AuditLogModel.find().sort({ timestamp: -1 }).limit(50).lean();

    res.json({
      changed: true,
      version: Date.now(),
      state: {
        requests,
        bundles,
        sanctions,
        auditLogs,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Sync error" });
  }
});

// Action Dispatcher Endpoint
app.post("/api/railplan/action", async (req: Request, res: Response) => {
  try {
    const { actionType, payload, user } = req.body;

    if (!actionType) {
      return res.status(400).json({ error: "Missing actionType" });
    }

    // Handle different action types
    if (actionType === "APPROVE_REQUEST") {
      await ServiceRequestModel.findOneAndUpdate(
        { id: payload.requestId },
        { status: "APPROVED", updatedAt: new Date().toISOString() }
      );
    } else if (actionType === "CREATE_BUNDLE") {
      await BundledOrderModel.create(payload.bundle);
    } else if (actionType === "SIGN_T806_STEP") {
      await T806SanctionModel.findOneAndUpdate(
        { id: payload.sanctionId },
        { status: payload.newStatus || "SANCTIONED" }
      );
    }

    // Log the action to MongoDB
    await AuditLogModel.create({
      id: `AUDIT-${Date.now()}`,
      action: actionType,
      userId: user?.id || "OCC-OFFICER",
      userName: user?.name || "Operations Officer",
      departmentId: user?.departmentId || "BOARD",
      details: JSON.stringify(payload),
    });

    res.json({ success: true, actionType, timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Action processing error" });
  }
});

// Start Server & Connect MongoDB Atlas
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚆 RailPlan AI Backend listening on port ${PORT}`);
    console.log(`🌐 Ready for Render Deployment & Vercel Frontend Connection`);
  });
}

start();
