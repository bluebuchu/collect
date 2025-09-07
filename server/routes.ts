import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { registerRoutes as registerAllRoutes } from "./routes/index";

export function registerRoutes(app: Express): Server {
  // Serve uploaded files
  app.use('/uploads', express.static('server/uploads'));
  
  // Register all API routes
  registerAllRoutes(app);
  
  // Create and return HTTP server
  const server = createServer(app);
  return server;
}