const ExcelJS = require("exceljs");

const buildLeadsWorkbook = (leads) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leads");

  sheet.columns = [
    { header: "Lead ID", key: "id", width: 36 },
    { header: "Customer Name", key: "customerName", width: 24 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Source", key: "source", width: 20 },
    { header: "Status", key: "status", width: 16 },
    { header: "Last Activity", key: "lastActivityAt", width: 22 },
    { header: "Assigned Agent", key: "assignedAgent", width: 22 }
  ];

  sheet.getRow(1).font = { bold: true };

  leads.forEach((lead) => {
    sheet.addRow({
      id: lead.id,
      customerName: lead.customerName,
      phone: lead.phone,
      source: lead.source || "",
      status: lead.status,
      lastActivityAt: lead.lastActivityAt
        ? lead.lastActivityAt.toISOString()
        : "",
      assignedAgent: lead.user?.name || ""
    });
  });

  return workbook;
};

module.exports = { buildLeadsWorkbook };
