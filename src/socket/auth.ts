import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

interface JwtPayload {
  id: string;
  email: string;
  username?: string;
}

export interface SocketUser {
  id: string;
  email: string;
  username?: string;
}

export const socketAuth = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("AUTH_TOKEN_MISSING"));
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    // attach normalized user object
    socket.data.user = {
      id: payload.id,
      email: payload.email,
      username: payload.username,
    } satisfies SocketUser;

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("AUTH_TOKEN_EXPIRED"));
    }

    return next(new Error("AUTH_TOKEN_INVALID"));
  }
};
