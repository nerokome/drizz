import { Router } from "express";
import { register, login, getUsers, logout } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";


const router = Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/users", authMiddleware, getUsers);
router.post("/logout", authMiddleware, logout); 


export default router;
