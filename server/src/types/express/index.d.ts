import { IUser } from "../../models/User";
import { IAdmin } from "../../models/Admin";

declare global {
  namespace Express {
    interface Request {
      user?: IAdmin | IUser | { _id: string; role: "User" | "Admin" };
    }
  }
}
