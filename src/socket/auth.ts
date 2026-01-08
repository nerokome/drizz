import jwt from "jsonwebtoken";

export const socketAuth = (socket: any, next: any) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    socket.user = payload; 
    next();
  } catch {
    next(new Error("Invalid token"));
  }
};
