import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import "dotenv/config";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import { initSocket } from "./socket/socket";

const app = express();

const allowedOrigins = ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

// REST routes
app.use("/api/auth", authRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.send("Server running!");
});

// HTTP + Socket
const httpServer = createServer(app);
const io = initSocket(httpServer);

// Error handler
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      error: { message: err.message || "Internal server error" },
    });
  }
);

// Graceful shutdown
const shutdown = () => {
  console.log("Shutting down server...");
  io.close(() => {
    httpServer.close(() => process.exit(0));
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start server
const PORT = Number(process.env.PORT) || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
