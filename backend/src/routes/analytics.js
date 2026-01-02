const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

router.use(authenticate);

router.get("/overview", requireRole("ADMIN"), async (req, res) => {
  const [
    totalLeads,
    wonLeads,
    followUpLeads,
    initialLeads,
    activeAgents
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "WON" } }),
    prisma.lead.count({ where: { status: "FOLLOW_UP" } }),
    prisma.lead.count({ where: { status: "INITIAL_CONTACT" } }),
    prisma.user.count({ where: { role: "AGENT", status: "ACTIVE" } })
  ]);

  const conversionRate = totalLeads
    ? Number(((wonLeads / totalLeads) * 100).toFixed(1))
    : 0;

  return res.json({
    totalLeads,
    wonLeads,
    followUpLeads,
    initialLeads,
    activeAgents,
    conversionRate
  });
});

module.exports = router;
