import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import "dotenv/config";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import { initSocket } from "./socket/socket";

// Types for Socket.I
declare module "socket.io" {
  interface Socket {
    user?: { id: string; email: string };
    joinedChats?: Set<string>;
  }
}

// --- Express App 
const app = express();


const allowedOrigins = [
  "http://localhost:3000",
  
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

// --- REST Routes ---
app.use("/api/auth", authRoutes);

app.get("/", (_req: Request, res: Response) => res.send("Server running!"));


const httpServer = createServer(app);
const io = initSocket(httpServer); 


app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      error: { message: err.message || "Internal server error" },
    });
  }
);

// --- Graceful Shutdown ---
const shutdown = () => {
  console.log("Shutting down server...");
  io.close(() => {
    httpServer.close(() => process.exit(0));
  });
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// --- Start Server ---
const PORT = Number(process.env.PORT) || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
