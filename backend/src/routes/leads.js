const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

router.use(authenticate);

router.get("/my", async (req, res) => {
  const leads = await prisma.lead.findMany({
    where: { assignedTo: req.user.id },
    orderBy: { createdAt: "desc" }
  });

  return res.json(leads);
});

router.get("/", requireRole("ADMIN"), async (req, res) => {
  const leads = await prisma.lead.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  return res.json(leads);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const {
    customerName,
    phone,
    phone2,
    source,
    country,
    product,
    qty,
    notes,
    city,
    address,
    value,
    paymentMethod,
    shipmentDate,
    assignedTo
  } = req.body;

  if (!customerName || !phone || !assignedTo) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const lead = await prisma.lead.create({
    data: {
      customerName,
      phone,
      phone2,
      source,
      country,
      product,
      qty,
      notes,
      city,
      address,
      value,
      paymentMethod,
      shipmentDate: shipmentDate ? new Date(shipmentDate) : null,
      assignedTo
    }
  });

  return res.status(201).json(lead);
});

router.put("/:id/assign", requireRole("ADMIN"), async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;

  if (!assignedTo) {
    return res.status(400).json({ message: "assignedTo is required." });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: { assignedTo }
  });

  return res.json(lead);
});

router.post("/:id/activity", async (req, res) => {
  const { id } = req.params;
  const {
    status,
    remarks,
    value,
    followUp,
    phone2,
    country,
    product,
    qty,
    notes,
    city,
    address,
    paymentMethod,
    shipmentDate
  } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return res.status(404).json({ message: "Lead not found." });
  }

  if (req.user.role !== "ADMIN" && lead.assignedTo !== req.user.id) {
    return res.status(403).json({ message: "Not authorized for this lead." });
  }

  if (status === "WON") {
    const resolvedProduct = product ?? lead.product;
    const resolvedQty = qty ?? lead.qty;
    const resolvedNotes = notes ?? lead.notes;
    const resolvedCity = city ?? lead.city;
    const resolvedAddress = address ?? lead.address;
    const resolvedValue = value ?? lead.value;
    const resolvedPaymentMethod = paymentMethod ?? lead.paymentMethod;

    const missingFields = [];
    if (!resolvedProduct) missingFields.push("product");
    if (!resolvedQty) missingFields.push("qty");
    if (!resolvedNotes) missingFields.push("notes");
    if (!resolvedCity) missingFields.push("city");
    if (!resolvedAddress) missingFields.push("address");
    if (!resolvedValue) missingFields.push("value");
    if (!resolvedPaymentMethod) missingFields.push("paymentMethod");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields for WON: ${missingFields.join(", ")}`
      });
    }
  }

  const activity = await prisma.leadActivity.create({
    data: {
      leadId: id,
      agentId: req.user.id,
      status,
      remarks,
      value,
      followUp: followUp ? new Date(followUp) : null
    }
  });

  await prisma.lead.update({
    where: { id },
    data: {
      status,
      phone2,
      country,
      product,
      qty,
      notes,
      city,
      address,
      value,
      paymentMethod,
      shipmentDate: shipmentDate ? new Date(shipmentDate) : null,
      lastActivityAt: new Date()
    }
  });

  return res.status(201).json(activity);
});

router.get("/:id/history", async (req, res) => {
  const { id } = req.params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) {
    return res.status(404).json({ message: "Lead not found." });
  }

  if (req.user.role !== "ADMIN" && lead.assignedTo !== req.user.id) {
    return res.status(403).json({ message: "Not authorized for this lead." });
  }

  const activities = await prisma.leadActivity.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" }
  });

  return res.json(activities);
});

module.exports = router;
