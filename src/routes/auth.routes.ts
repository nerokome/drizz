import { Router } from "express";
import { register, login, getUsers } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";


const router = Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/users", authMiddleware, getUsers);


export default router;
