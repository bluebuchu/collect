import { Express } from "express";
import authRoutes from "./auth.routes";
import sentencesRoutes from "./sentences.routes";
import userRoutes from "./user.routes";
import booksRoutes from "./books.routes";
import communitiesRoutes from "./communities.routes";
import exportRoutes from "./export.routes";
import adminRoutes from "./admin.routes";
import bookClubsRoutes from "./book-clubs.routes";
import { authMiddleware } from "../auth";

export function registerRoutes(app: Express) {
  // Apply auth middleware to all routes
  app.use(authMiddleware);
  
  // Register route modules
  app.use(authRoutes);
  app.use(sentencesRoutes);
  app.use(userRoutes);
  app.use(booksRoutes);
  app.use(communitiesRoutes);
  app.use(bookClubsRoutes);
  app.use("/api", exportRoutes);
  app.use(adminRoutes);
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });
}