import { Request, Response, NextFunction } from "express";

type AsyncHandler = <Req extends Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<any>,
) => (req: Req, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler: AsyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};
