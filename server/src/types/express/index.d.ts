import 'express';
import { Types, Document } from 'mongoose';

declare global {
  namespace Express {
    interface User extends Document {
      _id: Types.ObjectId;
      name: string;
      email: string;
      role: string;
      googleId?: string;
      avatar?: string;
    }

    interface Request {
      file?: Express.Multer.File;
      user?: User;
    }
  }
}

export {};
