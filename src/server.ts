import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.routes";


const app = express();
app.use(express.json());


app.use("/api/auth", authRoutes);


app.get("/", (_req, res) => res.send("Server running!"));

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
