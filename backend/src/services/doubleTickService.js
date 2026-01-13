const normalizePhone = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value).trim();
};

const resolveValue = (payload, keys = []) => {
  for (const key of keys) {
    const value = key.split(".").reduce((acc, segment) => {
      if (!acc || typeof acc !== "object") {
        return null;
      }
      return acc[segment];
    }, payload);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
};

const extractLeadFromPayload = (payload = {}) => {
  const customerName = resolveValue(payload, [
    "lead.name",
    "lead.full_name",
    "contact.name",
    "contact.full_name",
    "name"
  ]);
  const phone = normalizePhone(
    resolveValue(payload, [
      "lead.phone",
      "lead.phone_number",
      "contact.phone",
      "contact.phone_number",
      "phone"
    ])
  );

  const agentEmail = resolveValue(payload, [
    "agent.email",
    "assigned_to.email",
    "owner.email",
    "agentEmail"
  ]);

  const externalId = resolveValue(payload, [
    "lead.id",
    "lead.lead_id",
    "id",
    "external_id"
  ]);

  return {
    customerName,
    phone,
    agentEmail,
    externalId,
    source: resolveValue(payload, ["source", "lead.source"]) || "doubletick",
    metadata: payload
  };
};

module.exports = {
  extractLeadFromPayload
};
