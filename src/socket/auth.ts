import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

interface JwtPayload {
  id: string;
  email: string;
}

export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("TOKEN_MISSING"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    (socket as any).user = payload; 
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") return next(new Error("TOKEN_EXPIRED"));
    return next(new Error("TOKEN_INVALID"));
  }
};
