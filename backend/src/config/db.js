const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    if (error.message.includes("ENOTFOUND")) {
      console.error("Hint: Check MONGO_URI host/cluster value. Placeholder values like CLUSTER-URL will fail.");
    }

    if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      console.error("Hint: Verify MongoDB username/password in MONGO_URI. URL-encode special characters in password.");
    }

    console.error("Hint: Ensure Atlas Network Access allows your deployment origin (temporarily 0.0.0.0/0 for testing).");
    process.exit(1);
  }
};

module.exports = connectDB;
