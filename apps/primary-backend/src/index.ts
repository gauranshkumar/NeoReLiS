import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";

// Import routes
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import paperRoutes from "./routes/papers";
import screeningRoutes from "./routes/screening";
import qualityAssessmentRoutes from "./routes/quality-assessment";
import dataExtractionRoutes from "./routes/data-extraction";
import reportingRoutes from "./routes/reporting";
import elementRoutes from "./routes/element";
import managerRoutes from "./routes/manager";
import userRoutes from "./routes/users";
import notificationRoutes from "./routes/notifications";

const app = new Hono();

// Global middleware
app.use("*", requestId());
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Health check (unversioned - industry standard for health endpoints)
app.get("/healthz", (c) =>
  c.json({
    status: "ok",
    version: "v1",
    timestamp: new Date().toISOString(),
  }),
);

// API version info
app.get("/api/v1", (c) =>
  c.json({
    name: "NeoReLiS API",
    version: "1.0.0",
    endpoints: [
      "/api/v1/auth",
      "/api/v1/projects",
      "/api/v1/papers",
      "/api/v1/screening",
      "/api/v1/quality-assessment",
      "/api/v1/data-extraction",
      "/api/v1/reporting",
      "/api/v1/element",
      "/api/v1/manager",
      "/api/v1/users",
      "/api/v1/notifications",
    ],
  }),
);

// API routes
app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/projects", projectRoutes);
app.route("/api/v1/papers", paperRoutes);
app.route("/api/v1/screening", screeningRoutes);
app.route("/api/v1/quality-assessment", qualityAssessmentRoutes);
app.route("/api/v1/data-extraction", dataExtractionRoutes);
app.route("/api/v1/reporting", reportingRoutes);
app.route("/api/v1/element", elementRoutes);
app.route("/api/v1/manager", managerRoutes);
app.route("/api/v1/users", userRoutes);
app.route("/api/v1/notifications", notificationRoutes);

// 404 handler
app.notFound((c) =>
  c.json({ code: "NOT_FOUND", message: "Resource not found" }, 404),
);

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json(
    {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      requestId: c.get("requestId"),
    },
    500,
  );
});

export default app;
