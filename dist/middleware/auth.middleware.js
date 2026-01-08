"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
        return (0, response_1.sendError)(res, "Unauthorized", 401);
    const token = authHeader.split(" ")[1];
    const decoded = (0, jwt_1.verifyToken)(token);
    if (!decoded)
        return (0, response_1.sendError)(res, "Invalid token", 401);
    req.userId = decoded.userId;
    next();
};
exports.authMiddleware = authMiddleware;
