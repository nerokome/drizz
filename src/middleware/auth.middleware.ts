import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { sendError } from "../utils/response";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return sendError(res, "Unauthorized", 401);

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return sendError(res, "Invalid token", 401);

  // ✅ TypeScript now knows userId exists
  req.userId = decoded.userId;

  next();
};
