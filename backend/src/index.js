import "./loadEnv.js";
import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./utils/db.util.js";

import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import vapiRoutes from "./routes/vapi.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

// Enable large payloads (100MB) for JSON & URL encoded forms
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Serve uploaded videos statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// CORS setup
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/vapi", vapiRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
