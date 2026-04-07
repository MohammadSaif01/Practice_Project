const requiredKeys = ["MONGO_URI", "JWT_SECRET"];

const parseAllowedOrigins = () => {
  const rawOrigins = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const validateEnv = () => {
  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

module.exports = {
  parseAllowedOrigins,
  validateEnv
};
