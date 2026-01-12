import { Server, Socket } from "socket.io";
import { socketAuth } from "./auth";
import { registerChatEvents } from "./chat";

export const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  });

  
  io.use(socketAuth);

  io.on("connection", (socket: Socket) => {
    console.log(
      `User connected: ${socket.id}, User ID: ${socket.user?.id}`
    );

    socket.joinedChats = new Set();

    registerChatEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}, User ID: ${socket.user?.id}`);
    });
  });

  return io;
};
