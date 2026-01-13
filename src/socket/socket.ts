import { Server, Socket } from "socket.io";
import { socketAuth } from "./auth";
import { registerChatEvents } from "./chat";

export const initSocket = (httpServer: any) => {
 const io = new Server(httpServer, {
cors: {
  origin: "http://localhost:3000", 
  methods: ["GET", "POST"],
  credentials: true
},
transports: ["websocket", "polling"]
});

  io.use(socketAuth);

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;

    console.log(
      `User connected: socket=${socket.id}, userId=${user.id}`
    );

    // Register chat-related events
    registerChatEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(
        `User disconnected: socket=${socket.id}, userId=${user.id}`
      );
    });
  });

  return io;
};
