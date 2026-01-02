const ExcelJS = require("exceljs");

const buildLeadsWorkbook = (leads) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leads");

  sheet.columns = [
    { header: "Lead ID", key: "id", width: 36 },
    { header: "Customer Name", key: "customerName", width: 24 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Phone 2", key: "phone2", width: 16 },
    { header: "Source", key: "source", width: 20 },
    { header: "Country", key: "country", width: 18 },
    { header: "Product", key: "product", width: 18 },
    { header: "Qty", key: "qty", width: 10 },
    { header: "City", key: "city", width: 16 },
    { header: "Address", key: "address", width: 30 },
    { header: "Value", key: "value", width: 12 },
    { header: "Payment Method", key: "paymentMethod", width: 18 },
    { header: "Shipment Date", key: "shipmentDate", width: 18 },
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
      phone2: lead.phone2 || "",
      source: lead.source || "",
      country: lead.country || "",
      product: lead.product || "",
      qty: lead.qty ?? "",
      city: lead.city || "",
      address: lead.address || "",
      value: lead.value ?? "",
      paymentMethod: lead.paymentMethod || "",
      shipmentDate: lead.shipmentDate
        ? lead.shipmentDate.toISOString().slice(0, 10)
        : "",
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
