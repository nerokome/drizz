"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = "Success") => res.status(200).json({ message, data });
exports.sendSuccess = sendSuccess;
const sendError = (res, message = "Error", status = 500) => res.status(status).json({ message });
exports.sendError = sendError;
