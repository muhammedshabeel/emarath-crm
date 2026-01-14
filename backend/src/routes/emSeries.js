const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const requireAnyRole = require("../middlewares/requireAnyRole");
const { parseBoolean, parseIntOrNull } = require("../utils/parse");

const router = express.Router();
router.use(authenticate);

router.get("/", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const settings = await prisma.emSeriesSetting.findMany({
    orderBy: { country: "asc" }
  });
  return res.json(settings);
});

router.get("/:id", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const setting = await prisma.emSeriesSetting.findUnique({
    where: { id: req.params.id }
  });
  if (!setting) {
    return res.status(404).json({ message: "EM series setting not found." });
  }
  return res.json(setting);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const { seriesId, country, prefix, nextCounter, active } = req.body;

  if (!seriesId) {
    return res.status(400).json({ message: "seriesId is required." });
  }

  const setting = await prisma.emSeriesSetting.create({
    data: {
      seriesId,
      country,
      prefix,
      nextCounter: parseIntOrNull(nextCounter),
      active: parseBoolean(active)
    }
  });

  return res.status(201).json(setting);
});

router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const { seriesId, country, prefix, nextCounter, active } = req.body;

  const setting = await prisma.emSeriesSetting.update({
    where: { id: req.params.id },
    data: {
      seriesId,
      country,
      prefix,
      nextCounter: parseIntOrNull(nextCounter),
      active: parseBoolean(active)
    }
  });

  return res.json(setting);
});

module.exports = router;
