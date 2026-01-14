const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const requireAnyRole = require("../middlewares/requireAnyRole");
const { parseDate } = require("../utils/parse");

const router = express.Router();
router.use(authenticate);

router.get("/", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const followups = await prisma.deliveryFollowup.findMany({
    orderBy: { createdAt: "desc" }
  });
  return res.json(followups);
});

router.get("/:id", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const followup = await prisma.deliveryFollowup.findUnique({
    where: { id: req.params.id }
  });
  if (!followup) {
    return res.status(404).json({ message: "Delivery followup not found." });
  }
  return res.json(followup);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const {
    followupId,
    orderId,
    emNumber,
    date,
    deliveryStaffId,
    salesStaffId,
    customerName,
    customerPhone1,
    customerPhone2,
    salesInstructions,
    salesRemarks,
    csUpdate,
    csRemarks,
    deliveredCancelledDate
  } = req.body;

  if (!followupId) {
    return res.status(400).json({ message: "followupId is required." });
  }

  const record = await prisma.deliveryFollowup.create({
    data: {
      followupId,
      orderId,
      emNumber,
      date: parseDate(date),
      deliveryStaffId,
      salesStaffId,
      customerName,
      customerPhone1,
      customerPhone2,
      salesInstructions,
      salesRemarks,
      csUpdate,
      csRemarks,
      deliveredCancelledDate: parseDate(deliveredCancelledDate)
    }
  });

  return res.status(201).json(record);
});

router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const {
    followupId,
    orderId,
    emNumber,
    date,
    deliveryStaffId,
    salesStaffId,
    customerName,
    customerPhone1,
    customerPhone2,
    salesInstructions,
    salesRemarks,
    csUpdate,
    csRemarks,
    deliveredCancelledDate
  } = req.body;

  const record = await prisma.deliveryFollowup.update({
    where: { id: req.params.id },
    data: {
      followupId,
      orderId,
      emNumber,
      date: parseDate(date),
      deliveryStaffId,
      salesStaffId,
      customerName,
      customerPhone1,
      customerPhone2,
      salesInstructions,
      salesRemarks,
      csUpdate,
      csRemarks,
      deliveredCancelledDate: parseDate(deliveredCancelledDate)
    }
  });

  return res.json(record);
});

module.exports = router;
