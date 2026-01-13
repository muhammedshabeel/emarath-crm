const express = require("express");
const prisma = require("../prisma");
const { extractLeadFromPayload } = require("../services/doubleTickService");

const router = express.Router();

const resolveAssignedUser = async (agentEmail) => {
  if (!agentEmail) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      email: agentEmail,
      status: "ACTIVE"
    }
  });
};

router.post("/webhook", async (req, res) => {
  const expectedToken = process.env.DOUBLE_TICK_WEBHOOK_TOKEN;
  const providedToken =
    req.headers["x-doubletick-token"] || req.headers["x-double-tick-token"];

  if (expectedToken && providedToken !== expectedToken) {
    return res.status(401).json({ message: "Invalid webhook token." });
  }

  const payload = req.body || {};
  const leadDetails = extractLeadFromPayload(payload);

  if (!leadDetails.customerName || !leadDetails.phone) {
    return res
      .status(400)
      .json({ message: "Missing lead name or phone in payload." });
  }

  let assignedUser = await resolveAssignedUser(leadDetails.agentEmail);

  if (!assignedUser && process.env.DOUBLE_TICK_DEFAULT_ASSIGNEE_EMAIL) {
    assignedUser = await prisma.user.findFirst({
      where: {
        email: process.env.DOUBLE_TICK_DEFAULT_ASSIGNEE_EMAIL,
        status: "ACTIVE"
      }
    });
  }

  if (!assignedUser) {
    return res.status(202).json({
      message:
        "Lead received but no matching assignee. Configure agent email or default assignee.",
      payload
    });
  }

  const leadData = {
    customerName: leadDetails.customerName,
    phone: leadDetails.phone,
    source: leadDetails.source,
    assignedTo: assignedUser.id,
    metadata: leadDetails.metadata
  };

  if (leadDetails.externalId) {
    const lead = await prisma.lead.upsert({
      where: { externalId: leadDetails.externalId },
      update: {
        ...leadData,
        lastActivityAt: new Date()
      },
      create: {
        ...leadData,
        externalId: leadDetails.externalId
      }
    });

    return res.status(200).json({ leadId: lead.id });
  }

  const lead = await prisma.lead.create({
    data: leadData
  });

  return res.status(201).json({ leadId: lead.id });
});

module.exports = router;
