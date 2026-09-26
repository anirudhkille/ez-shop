import mongoose, { Schema, Document } from "mongoose";

interface ISession extends Document {
  key: string;
  value: string;
  expiresAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model<ISession>("Session", sessionSchema);
export default Session;
