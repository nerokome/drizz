import { Request, Response } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/response";
import { eq } from "drizzle-orm";

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) return sendError(res, "Missing fields", 400);

  try {
   
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) return sendError(res, "User already exists", 400);

    
    const hashedPassword = await hashPassword(password);

    
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
      })
      .returning();

    
    const token = signToken({ userId: newUser.id });

    return sendSuccess(res, { user: newUser, token }, "User registered successfully");
  } catch (err) {
    console.error("Register error:", err);
    return sendError(res);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return sendError(res, "Missing fields", 400);

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return sendError(res, "Invalid credentials", 400);

    const isMatch = await comparePassword(password, (user as any).password);
    if (!isMatch) return sendError(res, "Invalid credentials", 400);

    const token = signToken({ userId: user.id });

    return sendSuccess(res, { user, token }, "Login successful");
  } catch (err) {
    console.error("Login error:", err);
    return sendError(res);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  if (!userId) return sendError(res, "Unauthorized", 401);

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return sendError(res, "User not found", 404);

    return sendSuccess(res, user, "User profile fetched");
  } catch (err) {
    console.error("Profile error:", err);
    return sendError(res);
  }
};