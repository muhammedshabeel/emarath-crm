const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const requireAnyRole = require("../middlewares/requireAnyRole");
const { parseDate } = require("../utils/parse");

const router = express.Router();
router.use(authenticate);

router.get("/", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: "desc" }
  });
  return res.json(complaints);
});

router.get("/:id", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: req.params.id }
  });
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found." });
  }
  return res.json(complaint);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const {
    complaintId,
    orderId,
    emNumber,
    orderDate,
    customerName,
    phone1,
    phone2,
    complaint,
    department,
    notes1,
    notes2,
    cs
  } = req.body;

  if (!complaintId) {
    return res.status(400).json({ message: "complaintId is required." });
  }

  const record = await prisma.complaint.create({
    data: {
      complaintId,
      orderId,
      emNumber,
      orderDate: parseDate(orderDate),
      customerName,
      phone1,
      phone2,
      complaint,
      department,
      notes1,
      notes2,
      cs
    }
  });

  return res.status(201).json(record);
});

router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const {
    complaintId,
    orderId,
    emNumber,
    orderDate,
    customerName,
    phone1,
    phone2,
    complaint,
    department,
    notes1,
    notes2,
    cs
  } = req.body;

  const record = await prisma.complaint.update({
    where: { id: req.params.id },
    data: {
      complaintId,
      orderId,
      emNumber,
      orderDate: parseDate(orderDate),
      customerName,
      phone1,
      phone2,
      complaint,
      department,
      notes1,
      notes2,
      cs
    }
  });

  return res.json(record);
});

module.exports = router;
