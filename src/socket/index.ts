import { Server } from "socket.io";
import { socketAuth } from "./auth";
import { registerChatEvents } from "./chat";
import http from "http";

export const initSocket = (httpServer: http.Server) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // Authenticate socket connections
  io.use(socketAuth);

  io.on("connection", (socket) => {
    registerChatEvents(io, socket);
  });

  return io;
};
