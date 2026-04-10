const requiredKeys = ["MONGO_URI", "JWT_SECRET"];

const hasPlaceholder = (value = "") => {
  const normalized = String(value).toLowerCase();
  return (
    normalized.includes("cluster-url") ||
    normalized.includes("<db_password>") ||
    normalized.includes("your_password") ||
    normalized.includes("replace_with")
  );
};

const parseAllowedOrigins = () => {
  const defaultOrigins =
    process.env.NODE_ENV === "production"
      ? "https://*.onrender.com"
      : "http://localhost:5173,http://localhost:4173";
  const rawOrigins = process.env.CLIENT_ORIGIN || defaultOrigins;
  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isOriginAllowed = (origin, allowedOrigins) => {
  return allowedOrigins.some((entry) => {
    if (entry === "*") {
      return true;
    }

    if (entry.includes("*")) {
      const regexPattern = `^${entry
        .split("*")
        .map((segment) => escapeRegex(segment))
        .join(".*")}$`;
      return new RegExp(regexPattern).test(origin);
    }

    return entry === origin;
  });
};

const validateEnv = () => {
  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const mongoUri = process.env.MONGO_URI;
  if (hasPlaceholder(mongoUri)) {
    throw new Error(
      "Invalid MONGO_URI: placeholder detected. Set your real MongoDB Atlas URI in environment variables."
    );
  }

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error("Invalid MONGO_URI: must start with mongodb:// or mongodb+srv://");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (hasPlaceholder(jwtSecret) || jwtSecret.length < 16) {
    throw new Error("Invalid JWT_SECRET: use a strong random secret with at least 16 characters.");
  }
};

module.exports = {
  isOriginAllowed,
  parseAllowedOrigins,
  validateEnv
};
