const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

router.use(authenticate);

router.get("/overview", requireRole("ADMIN"), async (req, res) => {
  const [
    totalLeads,
    convertedLeads,
    followUpLeads,
    newLeads,
    activeAgents
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "CONVERTED" } }),
    prisma.lead.count({ where: { status: "FOLLOW_UP" } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.user.count({ where: { role: "AGENT", status: "ACTIVE" } })
  ]);

  const conversionRate = totalLeads
    ? Number(((convertedLeads / totalLeads) * 100).toFixed(1))
    : 0;

  return res.json({
    totalLeads,
    convertedLeads,
    followUpLeads,
    newLeads,
    activeAgents,
    conversionRate
  });
});

module.exports = router;
