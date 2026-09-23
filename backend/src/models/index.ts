import mongoose, { Schema, Document } from "mongoose";

// 1. Service Request Model
export interface IServiceRequest extends Document {
  id: string;
  title: string;
  description: string;
  requestingDepartment: string;
  targetDepartment: string;
  assignedToDepartment?: string;
  corridorId: string;
  locationKm: string;
  priority: string;
  status: string;
  estimatedCost: number;
  progress: number;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
}

const ServiceRequestSchema = new Schema<IServiceRequest>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  requestingDepartment: { type: String, required: true },
  targetDepartment: { type: String, required: true },
  assignedToDepartment: { type: String },
  corridorId: { type: String, required: true },
  locationKm: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, required: true },
  estimatedCost: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  requestedBy: { type: String, default: "Railway Officer" },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

export const ServiceRequestModel = mongoose.models.ServiceRequest || mongoose.model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);

// 2. Bundled Order Model (Mega-Blocks)
export interface IBundledOrder extends Document {
  id: string;
  bundleCode: string;
  corridorId: string;
  corridorName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalDurationHours: number;
  departmentsInvolved: string[];
  tasksCount: number;
  status: string;
  combinedDowntimeHours: number;
  savingsPercentage: number;
}

const BundledOrderSchema = new Schema<IBundledOrder>({
  id: { type: String, required: true, unique: true },
  bundleCode: { type: String, required: true },
  corridorId: { type: String, required: true },
  corridorName: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  totalDurationHours: { type: Number, default: 4 },
  departmentsInvolved: [{ type: String }],
  tasksCount: { type: Number, default: 0 },
  status: { type: String, default: "PLANNED" },
  combinedDowntimeHours: { type: Number, default: 0 },
  savingsPercentage: { type: Number, default: 46.1 },
});

export const BundledOrderModel = mongoose.models.BundledOrder || mongoose.model<IBundledOrder>("BundledOrder", BundledOrderSchema);

// 3. T/806 Statutory Sanction Model
export interface IT806Sanction extends Document {
  id: string;
  corridorId: string;
  blockSection: string;
  direction: string;
  requestedBy: string;
  date: string;
  status: string;
  approvalStatus: string;
  signSteps: any[];
}

const T806SanctionSchema = new Schema<IT806Sanction>({
  id: { type: String, required: true, unique: true },
  corridorId: { type: String, required: true },
  blockSection: { type: String, required: true },
  direction: { type: String, default: "UP & DOWN" },
  requestedBy: { type: String, default: "Executive Director (Board)" },
  date: { type: String, required: true },
  status: { type: String, default: "PENDING_APPROVAL" },
  approvalStatus: { type: String, default: "UNDER_REVIEW" },
  signSteps: { type: [Schema.Types.Mixed] as any, default: [] },
});

export const T806SanctionModel = mongoose.models.T806Sanction || mongoose.model<IT806Sanction>("T806Sanction", T806SanctionSchema);

// 4. Audit Log Model
export interface IAuditLog extends Document {
  id: string;
  action: string;
  userId: string;
  userName: string;
  departmentId: string;
  corridorId?: string;
  timestamp: string;
  details: string;
}

const AuditLogSchema = new Schema<IAuditLog>({
  id: { type: String, required: true, unique: true },
  action: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  departmentId: { type: String, required: true },
  corridorId: { type: String },
  timestamp: { type: String, default: () => new Date().toISOString() },
  details: { type: String, required: true },
});

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
