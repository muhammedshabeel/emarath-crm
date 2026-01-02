const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const { buildLeadsWorkbook } = require("../services/excel");

const router = express.Router();

router.use(authenticate);

router.get("/my-leads", async (req, res) => {
  const leads = await prisma.lead.findMany({
    where: { assignedTo: req.user.id },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  const workbook = buildLeadsWorkbook(leads);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=leads_export.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
});

router.get("/agent/:id", requireRole("ADMIN"), async (req, res) => {
  const { id } = req.params;

  const leads = await prisma.lead.findMany({
    where: { assignedTo: id },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  const workbook = buildLeadsWorkbook(leads);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=agent_leads_export.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
});

router.get("/all", requireRole("ADMIN"), async (req, res) => {
  const leads = await prisma.lead.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  const workbook = buildLeadsWorkbook(leads);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=all_leads_export.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
});

module.exports = router;
