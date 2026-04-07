const compression = require("compression");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { parseAllowedOrigins, validateEnv } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const answerRoutes = require("./routes/answerRoutes");
const commentRoutes = require("./routes/commentRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

dotenv.config();
validateEnv();
connectDB();

const app = express();
const allowedOrigins = parseAllowedOrigins();

app.set("trust proxy", 1);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(compression());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_MAX || "300", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "DevHelp API is running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get("/api/ready", (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not ready" });
  }
  return res.status(200).json({ message: "Ready" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/comments", commentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const gracefulShutdown = () => {
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
