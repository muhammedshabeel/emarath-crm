const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const requireAnyRole = require("../middlewares/requireAnyRole");
const { parseDate, parseFloatOrNull } = require("../utils/parse");

const router = express.Router();
router.use(authenticate);

const normalizePaymentStatus = (value) => {
  if (!value) {
    return undefined;
  }
  const normalized = String(value).trim().toUpperCase().replace(/\s+/g, "_");
  const allowed = ["PENDING", "PAID", "FAILED"];
  return allowed.includes(normalized) ? normalized : undefined;
};

router.get("/", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" }
  });
  return res.json(payments);
});

router.get("/:id", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!payment) {
    return res.status(404).json({ message: "Payment not found." });
  }
  return res.json(payment);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const {
    paymentId,
    orderId,
    emNumber,
    country,
    amount,
    status,
    method,
    paymentDate
  } = req.body;

  if (!paymentId || !orderId) {
    return res
      .status(400)
      .json({ message: "paymentId and orderId are required." });
  }

  const payment = await prisma.payment.create({
    data: {
      paymentId,
      orderId,
      emNumber,
      country,
      amount: parseFloatOrNull(amount),
      status: normalizePaymentStatus(status),
      method,
      paymentDate: parseDate(paymentDate)
    }
  });

  return res.status(201).json(payment);
});

router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const {
    paymentId,
    orderId,
    emNumber,
    country,
    amount,
    status,
    method,
    paymentDate
  } = req.body;

  const payment = await prisma.payment.update({
    where: { id: req.params.id },
    data: {
      paymentId,
      orderId,
      emNumber,
      country,
      amount: parseFloatOrNull(amount),
      status: normalizePaymentStatus(status),
      method,
      paymentDate: parseDate(paymentDate)
    }
  });

  return res.json(payment);
});

module.exports = router;
