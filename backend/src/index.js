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
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: corsOrigin }));
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
