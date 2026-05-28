import mongoose from "mongoose";

interface INewsletter {
  email: string;
}

const newsletterSchema = new mongoose.Schema<INewsletter>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
});

const Newsletter = mongoose.model("Newsletter", newsletterSchema);
export default Newsletter;
