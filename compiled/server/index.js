"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
const vite_1 = require("./vite");
const auth_1 = require("./auth");
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS configuration for development
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Session configuration - using memory store for development
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'sentence-collection-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax'
    },
    name: 'sessionId'
}));
// Passport 초기화
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Google OAuth 전략 초기화
(0, auth_1.initializeGoogleOAuth)();
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            (0, vite_1.log)(logLine);
        }
    });
    next();
});
let serverInstance;
(async () => {
    const server = await (0, routes_1.registerRoutes)(app);
    serverInstance = server;
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        // Always send JSON response for errors
        if (!res.headersSent) {
            res.status(status).json({
                error: message,
                status: status
            });
        }
        console.error('Express error:', err);
    });
    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
        await (0, vite_1.setupVite)(app, server);
    }
    else {
        (0, vite_1.serveStatic)(app);
    }
    // Only start server if not in Vercel environment
    if (!process.env.VERCEL) {
        // Use dynamic port for Vercel or default to 5000 for local development
        const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
        server.listen({
            port,
            host: "0.0.0.0",
            reusePort: true,
        }, () => {
            (0, vite_1.log)(`serving on port ${port}`);
        });
    }
})();
// Export for Vercel
exports.default = app;
