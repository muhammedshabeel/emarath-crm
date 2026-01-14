const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const requireAnyRole = require("../middlewares/requireAnyRole");
const {
  parseBoolean,
  parseDate,
  parseFloatOrNull,
  parseIntOrNull
} = require("../utils/parse");

const router = express.Router();
router.use(authenticate);

const normalizeOrderStatus = (value) => {
  if (!value) {
    return undefined;
  }

  const normalized = String(value).trim().toUpperCase().replace(/\s+/g, "_");
  const allowed = ["NEW", "CONFIRMED", "CANCELLED", "SHIPPED", "DELIVERED"];
  return allowed.includes(normalized) ? normalized : undefined;
};

router.get("/", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" }
  });
  return res.json(orders);
});

router.get("/:id", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }
  return res.json(order);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const {
    orderKey,
    emNumber,
    orderDate,
    country,
    customerId,
    salesStaffId,
    sourceLeadId,
    product1,
    qty1,
    product2,
    qty2,
    value,
    orderStatus,
    paymentMethod,
    dispatchFlag,
    csRemarks,
    deliveryStaffId,
    trackingNumber,
    cancellationReason,
    notes
  } = req.body;

  if (!orderKey) {
    return res.status(400).json({ message: "orderKey is required." });
  }

  const order = await prisma.order.create({
    data: {
      orderKey,
      emNumber,
      orderDate: parseDate(orderDate),
      country,
      customerId,
      salesStaffId,
      sourceLeadId,
      product1,
      qty1: parseIntOrNull(qty1),
      product2,
      qty2: parseIntOrNull(qty2),
      value: parseFloatOrNull(value),
      orderStatus: normalizeOrderStatus(orderStatus),
      paymentMethod,
      dispatchFlag: parseBoolean(dispatchFlag),
      csRemarks,
      deliveryStaffId,
      trackingNumber,
      cancellationReason,
      notes
    }
  });

  return res.status(201).json(order);
});

router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const {
    orderKey,
    emNumber,
    orderDate,
    country,
    customerId,
    salesStaffId,
    sourceLeadId,
    product1,
    qty1,
    product2,
    qty2,
    value,
    orderStatus,
    paymentMethod,
    dispatchFlag,
    csRemarks,
    deliveryStaffId,
    trackingNumber,
    cancellationReason,
    notes
  } = req.body;

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      orderKey,
      emNumber,
      orderDate: parseDate(orderDate),
      country,
      customerId,
      salesStaffId,
      sourceLeadId,
      product1,
      qty1: parseIntOrNull(qty1),
      product2,
      qty2: parseIntOrNull(qty2),
      value: parseFloatOrNull(value),
      orderStatus: normalizeOrderStatus(orderStatus),
      paymentMethod,
      dispatchFlag: parseBoolean(dispatchFlag),
      csRemarks,
      deliveryStaffId,
      trackingNumber,
      cancellationReason,
      notes
    }
  });

  return res.json(order);
});

module.exports = router;
