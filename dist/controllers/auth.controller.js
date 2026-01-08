"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
const register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
        return (0, response_1.sendError)(res, "Missing fields", 400);
    try {
        // Check if user exists
        const [existingUser] = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
            .limit(1);
        if (existingUser)
            return (0, response_1.sendError)(res, "User already exists", 400);
        // Hash password
        const hashedPassword = await (0, hash_1.hashPassword)(password);
        // Insert new user
        const [newUser] = await db_1.db
            .insert(schema_1.users)
            .values({
            username,
            email,
            password: hashedPassword,
        })
            .returning();
        // Generate JWT token
        const token = (0, jwt_1.signToken)({ userId: newUser.id });
        return (0, response_1.sendSuccess)(res, { user: newUser, token }, "User registered successfully");
    }
    catch (err) {
        console.error("Register error:", err);
        return (0, response_1.sendError)(res);
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return (0, response_1.sendError)(res, "Missing fields", 400);
    try {
        const [user] = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
            .limit(1);
        if (!user)
            return (0, response_1.sendError)(res, "Invalid credentials", 400);
        const isMatch = await (0, hash_1.comparePassword)(password, user.password);
        if (!isMatch)
            return (0, response_1.sendError)(res, "Invalid credentials", 400);
        const token = (0, jwt_1.signToken)({ userId: user.id });
        return (0, response_1.sendSuccess)(res, { user, token }, "Login successful");
    }
    catch (err) {
        console.error("Login error:", err);
        return (0, response_1.sendError)(res);
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    const userId = req.userId;
    if (!userId)
        return (0, response_1.sendError)(res, "Unauthorized", 401);
    try {
        const [user] = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
            .limit(1);
        if (!user)
            return (0, response_1.sendError)(res, "User not found", 404);
        return (0, response_1.sendSuccess)(res, user, "User profile fetched");
    }
    catch (err) {
        console.error("Profile error:", err);
        return (0, response_1.sendError)(res);
    }
};
exports.getProfile = getProfile;
