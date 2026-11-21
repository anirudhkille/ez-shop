import mongoose from "mongoose";

export type StripeEventStatus = "processing" | "processed" | "failed";

export interface IStripeEvent {
  eventId: string;
  type: string;
  orderId?: string;
  status: StripeEventStatus;
  attempts: number;
  processingStartedAt?: Date;
  lastError?: string;
}

const stripeEventSchema = new mongoose.Schema<IStripeEvent>(
  {
    eventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    orderId: { type: String },
    status: {
      type: String,
      enum: ["processing", "processed", "failed"],
      default: "processing",
      required: true,
    },
    attempts: { type: Number, default: 0 },
    processingStartedAt: { type: Date },
    lastError: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IStripeEvent>("StripeEvent", stripeEventSchema);
