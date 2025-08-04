import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupSecurity } from "./middleware/security";
import apiRoutes from "./routes/index";

export function registerRoutes(app: Express): Server {
  // Setup security middleware (CORS, helmet, rate limiting)
  setupSecurity(app);

  // Mount API routes
  app.use('/api', apiRoutes);

  const httpServer = createServer(app);

  return httpServer;
}