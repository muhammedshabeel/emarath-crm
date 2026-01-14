const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseIntOrNull = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseFloatOrNull = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseBoolean = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["true", "yes", "1"].includes(normalized)) {
    return true;
  }
  if (["false", "no", "0"].includes(normalized)) {
    return false;
  }

  return null;
};

module.exports = {
  parseBoolean,
  parseDate,
  parseFloatOrNull,
  parseIntOrNull
};
