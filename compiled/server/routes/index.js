"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const auth_routes_1 = __importDefault(require("./auth.routes"));
const sentences_routes_1 = __importDefault(require("./sentences.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const books_routes_1 = __importDefault(require("./books.routes"));
const communities_routes_1 = __importDefault(require("./communities.routes"));
const export_routes_1 = __importDefault(require("./export.routes"));
const auth_1 = require("../auth");
function registerRoutes(app) {
    // Apply auth middleware to all routes
    app.use(auth_1.authMiddleware);
    // Register route modules
    app.use(auth_routes_1.default);
    app.use(sentences_routes_1.default);
    app.use(user_routes_1.default);
    app.use(books_routes_1.default);
    app.use(communities_routes_1.default);
    app.use("/api", export_routes_1.default);
    // Health check
    app.get("/api/health", (req, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
    // 404 handler for API routes
    app.use("/api/*", (req, res) => {
        res.status(404).json({ error: "API endpoint not found" });
    });
}
