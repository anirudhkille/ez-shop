import { Request } from "express";
import { IAdmin } from "../models/Admin";

export interface AuthenticatedRequest extends Request {
  user: IAdmin | IAdmin;
}
