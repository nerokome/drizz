import { Response } from "express";

export const sendSuccess = (res: Response, data: any, message = "Success") =>
  res.status(200).json({ message, data });

export const sendError = (res: Response, message = "Error", status = 500) =>
  res.status(status).json({ message });
