const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const requireAnyRole = require("../middlewares/requireAnyRole");

const router = express.Router();
router.use(authenticate);

router.get("/", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const staff = await prisma.staff.findMany({ orderBy: { name: "asc" } });
  return res.json(staff);
});

router.get("/:id", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const staff = await prisma.staff.findUnique({ where: { id: req.params.id } });
  if (!staff) {
    return res.status(404).json({ message: "Staff not found." });
  }
  return res.json(staff);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const { staffId, name, role, country } = req.body;
  if (!staffId || !name) {
    return res.status(400).json({ message: "staffId and name are required." });
  }

  const staff = await prisma.staff.create({
    data: { staffId, name, role, country }
  });

  return res.status(201).json(staff);
});

router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const { staffId, name, role, country } = req.body;

  const staff = await prisma.staff.update({
    where: { id: req.params.id },
    data: { staffId, name, role, country }
  });

  return res.json(staff);
});

module.exports = router;
