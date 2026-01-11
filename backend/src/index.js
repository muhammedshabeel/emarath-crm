const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const leadRoutes = require("./routes/leads");
const exportRoutes = require("./routes/export");
const analyticsRoutes = require("./routes/analytics");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const corsOriginSetting = process.env.CORS_ORIGIN || "*";
const allowedOrigins = corsOriginSetting
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const normalizedAllowedOrigins =
  allowedOrigins.length === 0 ? ["*"] : allowedOrigins;
const allowedOriginMatchers = normalizedAllowedOrigins.map((origin) => {
  if (!origin.includes("*")) {
    return origin;
  }

  const escapedOrigin = origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = escapedOrigin.replace(/\\\*/g, ".*");
  return new RegExp(`^${pattern}$`);
});

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (normalizedAllowedOrigins.includes("*")) {
    return true;
  }

  return allowedOriginMatchers.some((matcher) => {
    if (matcher instanceof RegExp) {
      return matcher.test(origin);
    }

    return matcher === origin;
  });
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/auth", authRoutes);
app.use("/leads", leadRoutes);
app.use("/export", exportRoutes);
app.use("/analytics", analyticsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
