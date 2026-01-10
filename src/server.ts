import express from "express";
import { createServer } from "http";
import "dotenv/config";
import cors from "cors"; // <-- import cors

import authRoutes from "./routes/auth.routes";
import { initSocket } from "./socket";

const app = express();


app.use(cors({ 
  origin:"http://localhost:3000"
}));
app.use(express.json());


app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => res.send("Server running!"));


const httpServer = createServer(app);
initSocket(httpServer);


const PORT = Number(process.env.PORT) || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
