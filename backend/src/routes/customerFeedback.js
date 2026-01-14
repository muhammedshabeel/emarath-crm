const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const requireAnyRole = require("../middlewares/requireAnyRole");
const { parseDate } = require("../utils/parse");

const router = express.Router();
router.use(authenticate);

router.get("/", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const feedback = await prisma.customerFeedback.findMany({
    orderBy: { createdAt: "desc" }
  });
  return res.json(feedback);
});

router.get("/:id", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const feedback = await prisma.customerFeedback.findUnique({
    where: { id: req.params.id }
  });
  if (!feedback) {
    return res.status(404).json({ message: "Feedback not found." });
  }
  return res.json(feedback);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const {
    feedbackId,
    orderId,
    emNumber,
    country,
    orderDate,
    salesStaffId,
    customerName,
    phone1,
    phone2,
    feedback,
    notes,
    googleReviewLink,
    recommendedPerfume
  } = req.body;

  if (!feedbackId) {
    return res.status(400).json({ message: "feedbackId is required." });
  }

  const record = await prisma.customerFeedback.create({
    data: {
      feedbackId,
      orderId,
      emNumber,
      country,
      orderDate: parseDate(orderDate),
      salesStaffId,
      customerName,
      phone1,
      phone2,
      feedback,
      notes,
      googleReviewLink,
      recommendedPerfume
    }
  });

  return res.status(201).json(record);
});

router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const {
    feedbackId,
    orderId,
    emNumber,
    country,
    orderDate,
    salesStaffId,
    customerName,
    phone1,
    phone2,
    feedback,
    notes,
    googleReviewLink,
    recommendedPerfume
  } = req.body;

  const record = await prisma.customerFeedback.update({
    where: { id: req.params.id },
    data: {
      feedbackId,
      orderId,
      emNumber,
      country,
      orderDate: parseDate(orderDate),
      salesStaffId,
      customerName,
      phone1,
      phone2,
      feedback,
      notes,
      googleReviewLink,
      recommendedPerfume
    }
  });

  return res.json(record);
});

module.exports = router;
