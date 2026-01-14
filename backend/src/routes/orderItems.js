const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const requireAnyRole = require("../middlewares/requireAnyRole");
const { parseFloatOrNull, parseIntOrNull } = require("../utils/parse");

const router = express.Router();
router.use(authenticate);

router.get("/", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const items = await prisma.orderItem.findMany({
    orderBy: { createdAt: "desc" }
  });
  return res.json(items);
});

router.get("/:id", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const item = await prisma.orderItem.findUnique({ where: { id: req.params.id } });
  if (!item) {
    return res.status(404).json({ message: "Order item not found." });
  }
  return res.json(item);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const { orderItemId, orderId, productId, quantity, lineValue } = req.body;

  if (!orderItemId || !orderId) {
    return res
      .status(400)
      .json({ message: "orderItemId and orderId are required." });
  }

  const item = await prisma.orderItem.create({
    data: {
      orderItemId,
      orderId,
      productId,
      quantity: parseIntOrNull(quantity),
      lineValue: parseFloatOrNull(lineValue)
    }
  });

  return res.status(201).json(item);
});

router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const { orderItemId, orderId, productId, quantity, lineValue } = req.body;

  const item = await prisma.orderItem.update({
    where: { id: req.params.id },
    data: {
      orderItemId,
      orderId,
      productId,
      quantity: parseIntOrNull(quantity),
      lineValue: parseFloatOrNull(lineValue)
    }
  });

  return res.json(item);
});

module.exports = router;
