import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

interface JwtPayload {
  id: string;
  email: string;
}

export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Unauthorized: Token missing"));
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    // Attach authenticated user to socket
    (socket as any).user = payload;

    next();
  } catch (err) {
    return next(new Error("Unauthorized: Invalid token"));
  }
};
