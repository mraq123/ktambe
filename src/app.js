
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import deathRecordRoutes from "./routes/deathRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
const app = express();

// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN
//       ? process.env.CORS_ORIGIN.split(",").map((v) => v.trim())
//       : true,
//   })
// );

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Request tanpa Origin, misalnya dari health check tertentu
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin tidak diizinkan oleh CORS"));
    },
  })
);

app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API berjalan",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/death-records", deathRecordRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Username, email, atau data unik sudah digunakan",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export default app;
