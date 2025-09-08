"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const index_1 = require("./routes/index");
function registerRoutes(app) {
    // Serve uploaded files
    app.use('/uploads', express_1.default.static('server/uploads'));
    // Register all API routes
    (0, index_1.registerRoutes)(app);
    // Create and return HTTP server
    const server = (0, http_1.createServer)(app);
    return server;
}
