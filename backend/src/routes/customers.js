const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const requireAnyRole = require("../middlewares/requireAnyRole");

const router = express.Router();
router.use(authenticate);

router.get("/", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" }
  });
  return res.json(customers);
});

router.get("/:id", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }
  return res.json(customer);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const {
    customerId,
    phoneKey,
    phone1,
    phone2,
    name,
    country,
    city,
    address
  } = req.body;

  if (!customerId) {
    return res.status(400).json({ message: "customerId is required." });
  }

  const customer = await prisma.customer.create({
    data: {
      customerId,
      phoneKey,
      phone1,
      phone2,
      name,
      country,
      city,
      address
    }
  });

  return res.status(201).json(customer);
});

router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const {
    customerId,
    phoneKey,
    phone1,
    phone2,
    name,
    country,
    city,
    address
  } = req.body;

  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: {
      customerId,
      phoneKey,
      phone1,
      phone2,
      name,
      country,
      city,
      address
    }
  });

  return res.json(customer);
});

module.exports = router;
