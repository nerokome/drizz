import { Server } from "socket.io";
import { socketAuth } from "./auth";
import { registerChatEvents } from "./chat";

export const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", 
    },
  });

  
  io.use(socketAuth);

  io.on("connection", (socket) => {
    registerChatEvents(io, socket);
  });
};
