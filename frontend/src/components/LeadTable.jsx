import { useEffect, useState } from "react";

const statusOptions = [
  { value: "INITIAL_CONTACT", label: "Initial Contact" },
  { value: "COLD", label: "Cold" },
  { value: "WARM", label: "Warm" },
  { value: "WAITING_FOR_LOCATION", label: "Waiting for location" },
  { value: "WON", label: "Won" },
  { value: "NEGOTIATIONS", label: "Negotiations" },
  { value: "LOST", label: "Lost" },
  { value: "FOLLOW_UP", label: "Follow-Up" },
  { value: "DATE_SHIPMENT", label: "Date shipment" },
  { value: "CANCELLED", label: "Cancelled" }
];

const productOptions = [
  "MAQAM IBRAHIM-BSPARQ",
  "ESENCIA FLORAL",
  "ROMANCY FLORAL",
  "PEACOCK COLLECTION",
  "SUFI COMBO",
  "SEVEN DAYS-RT",
  "6 PS PERFUME COMPO",
  "FERRAGAMO&SUFI COMPO",
  "7 PS COMBO",
  "DOE COLLECTION",
  "NEW 6 PS COMBO",
  "MARYAM BODY LOTION",
  "MUSK COLLECTION",
  "FERRAGAMO+RIVIERA COMBO",
  "MARYAM COMBO",
  "FERRAGAMO",
  "ITALIAN CITRUS",
  "MYSTERY COMBO",
  "AMBER",
  "SALTY FLOWER",
  "LAROCHE",
  "SR SIGNATURE",
  "AMEERATH UL ARAB",
  "ESENCIA CUSTOMIZE",
  "BLACK EXCESS",
  "MOJEH",
  "SAPIL COMBO",
  "DOLLER COMBO",
  "NEW 7PS COMBO",
  "INTENSE SIGNATURE-LPG",
  "OUD LOVERS-LPG",
  "AMBER +SENSUAL",
  "CLIVE COLLECTION",
  "VOLGA COMBO",
  "OLD MEMORIES-RT",
  "COOL LIFE COMBO",
  "PARAMOUNT COMBO",
  "DOE CUSTOMIZE",
  "AMBER CUSTOMIZE",
  "AMEERATH CUSTOMIZE",
  "CLIVE CUSTOMIZE",
  "LA FLORAL-LPG",
  "THE ARCHER COMBO",
  "SHADOW FLAME",
  "AMBRE + ONIRO",
  "AMBER + BLACK EXCESS",
  "CLASSIC LIME",
  "CHERIE BLOSSOM -LPG",
  "VELORA POP HEART-LPG",
  "VELORA VIVA CHOCO-LPG",
  "VELORA SUGAR BLISS-LPG",
  "DIAMOND ROSE COMBO",
  "MUKHALAT AL EMARAT-BSPARQ",
  "BERRIES WEEKEND COMBO",
  "ASEEL COMBO",
  "MIRAMAR COMBO",
  "HECTOR COMBO",
  "VELORA-LPG"
];

const statusLabelMap = statusOptions.reduce((accumulator, option) => {
  accumulator[option.value] = option.label;
  return accumulator;
}, {});

const LeadTable = ({ apiBaseUrl, headers, isAdmin = false }) => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [status, setStatus] = useState("INITIAL_CONTACT");
  const [remarks, setRemarks] = useState("");
  const [phone2, setPhone2] = useState("");
  const [country, setCountry] = useState("");
  const [productQuantities, setProductQuantities] = useState({});
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [value, setValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shipmentDate, setShipmentDate] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [error, setError] = useState("");

  const loadLeads = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/leads${isAdmin ? "" : "/my"}`,
        { headers }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load leads.");
      }
      setLeads(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [apiBaseUrl, isAdmin, headers]);

  const openModal = (lead) => {
    setSelectedLead(lead);
    setStatus(lead.status || "INITIAL_CONTACT");
    setRemarks("");
    setPhone2(lead.phone2 || "");
    setCountry(lead.country || "");
    const selectedProducts = lead.product
      ? lead.product.split(",").map((item) => item.trim()).filter(Boolean)
      : [];
    const quantities = selectedProducts.reduce((accumulator, entry) => {
      const match = entry.match(/^(.*?)(?:\s+x(\d+))?$/);
      const name = match?.[1]?.trim();
      const qtyValue = match?.[2] ? Number(match[2]) : 1;
      if (name) {
        accumulator[name] = qtyValue || 1;
      }
      return accumulator;
    }, {});
    setProductQuantities(quantities);
    setProductMenuOpen(false);
    setProductSearch("");
    setNotes(lead.notes || "");
    setCity(lead.city || "");
    setAddress(lead.address || "");
    setValue(lead.value ?? "");
    setPaymentMethod(lead.paymentMethod || "");
    setShipmentDate(
      lead.shipmentDate ? lead.shipmentDate.slice(0, 10) : ""
    );
    setFollowUp(lead.followUp ? lead.followUp.slice(0, 10) : "");
  };

  const closeModal = () => {
    setSelectedLead(null);
    setProductMenuOpen(false);
  };

  const submitUpdate = async () => {
    if (!selectedLead) {
      return;
    }

    if (status === "WON") {
      const totalQty = Object.values(productQuantities).reduce(
        (sum, value) => sum + Number(value || 0),
        0
      );
      const missingFields = [];
      if (Object.keys(productQuantities).length === 0) missingFields.push("Product");
      if (!totalQty) missingFields.push("Qty");
      if (!notes) missingFields.push("Notes");
      if (!city) missingFields.push("City");
      if (!address) missingFields.push("Address");
      if (!value) missingFields.push("Value");
      if (!paymentMethod) missingFields.push("Payment Method");

      if (missingFields.length > 0) {
        setError(`Fill required fields for Won: ${missingFields.join(", ")}`);
        return;
      }
    }

    try {
      const normalizedProducts = Object.entries(productQuantities)
        .filter(([, qtyValue]) => Number(qtyValue) > 0)
        .map(([name, qtyValue]) => `${name} x${qtyValue}`)
        .join(", ");
      const totalQty = Object.values(productQuantities).reduce(
        (sum, value) => sum + Number(value || 0),
        0
      );
      const response = await fetch(
        `${apiBaseUrl}/leads/${selectedLead.id}/activity`,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            remarks,
            phone2,
            country,
            product: normalizedProducts,
            qty: totalQty || null,
            notes,
            city,
            address,
            value: value ? Number(value) : null,
            paymentMethod,
            shipmentDate: shipmentDate || null,
            followUp: followUp || null
          })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Update failed.");
      }

      await loadLeads();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateProductQty = (name, delta) => {
    setProductQuantities((prev) => {
      const current = Number(prev[name] || 0);
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [name]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: next };
    });
  };

  const selectedProductCount = Object.keys(productQuantities).length;
  const totalProductQty = Object.values(productQuantities).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );
  const filteredProducts = productOptions.filter((option) =>
    option.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleExport = async () => {
    const endpoint = isAdmin ? "all" : "my-leads";
    const response = await fetch(`${apiBaseUrl}/export/${endpoint}`, {
      headers
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Export failed.");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = isAdmin ? "all_leads.xlsx" : "my_leads.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="header" style={{ marginBottom: 16 }}>
        <div>
          <h2>{isAdmin ? "All Leads" : "My Leads"}</h2>
          <p className="muted">
            {isAdmin
              ? "Monitor and update all leads across the team."
              : "Track and update your assigned leads."}
          </p>
        </div>
        <div className="actions">
          <button className="button secondary" onClick={loadLeads}>
            Refresh
          </button>
          <button className="button" onClick={handleExport}>
            Export Excel
          </button>
        </div>
      </div>

      {error && <div className="notice">{error}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Country</th>
            <th>Status</th>
            <th>Assigned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.customerName}</td>
              <td>{lead.phone}</td>
              <td>{lead.country || "-"}</td>
              <td>
                <span className="badge">
                  {statusLabelMap[lead.status] || lead.status}
                </span>
              </td>
              <td>{lead.user?.name || "You"}</td>
              <td>
                <button className="button secondary" onClick={() => openModal(lead)}>
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLead && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Update Lead</h3>
            <p className="muted">{selectedLead.customerName}</p>
            <div className="stack modal-content">
              <label className="stack">
                <span>Status</span>
                <select
                  className="input"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="stack">
                <span>Phone 2 (optional)</span>
                <input
                  className="input"
                  value={phone2}
                  onChange={(event) => setPhone2(event.target.value)}
                />
              </label>
              <label className="stack">
                <span>Products</span>
                <div className="product-dropdown">
                  <button
                    type="button"
                    className="input product-trigger"
                    onClick={() => setProductMenuOpen((prev) => !prev)}
                  >
                    <span>
                      {selectedProductCount > 0
                        ? `${selectedProductCount} selected · ${totalProductQty} qty`
                        : "Select products"}
                    </span>
                    <span className="product-trigger-icon" aria-hidden="true">
                      {productMenuOpen ? "▴" : "▾"}
                    </span>
                  </button>
                  {productMenuOpen && (
                    <div className="product-menu">
                      <div className="product-menu-header">
                        <input
                          className="input"
                          placeholder="Search products"
                          value={productSearch}
                          onChange={(event) => setProductSearch(event.target.value)}
                        />
                        <div className="product-summary muted">
                          {selectedProductCount} selected · {totalProductQty} qty
                        </div>
                      </div>
                      <div className="product-list">
                        {filteredProducts.map((option) => {
                          const qtyValue = productQuantities[option] || 0;
                          return (
                            <div key={option} className="product-row">
                              <span className="product-name">{option}</span>
                              <div className="product-qty">
                                <button
                                  type="button"
                                  className="button secondary"
                                  onClick={() => updateProductQty(option, -1)}
                                >
                                  -
                                </button>
                                <span className="product-qty-value">{qtyValue}</span>
                                <button
                                  type="button"
                                  className="button secondary"
                                  onClick={() => updateProductQty(option, 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {filteredProducts.length === 0 && (
                          <div className="product-empty muted">No products found.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </label>
              <div className="form-grid">
                <label className="stack">
                  <span>City</span>
                  <input
                    className="input"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  />
                </label>
                <label className="stack">
                  <span>Payment Method</span>
                  <input
                    className="input"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                </label>
              </div>
              <label className="stack">
                <span>Address</span>
                <textarea
                  className="input"
                  rows={2}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </label>
              <label className="stack">
                <span>Remarks</span>
                <input
                  className="input"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Short note about the call"
                />
              </label>
              <label className="stack">
                <span>Notes</span>
                <textarea
                  className="input"
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
              <label className="stack">
                <span>Value</span>
                <input
                  className="input"
                  type="number"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              </label>
              <div className="form-grid">
                <label className="stack">
                  <span>Date shipment</span>
                  <input
                    className="input"
                    type="date"
                    value={shipmentDate}
                    onChange={(event) => setShipmentDate(event.target.value)}
                  />
                </label>
                <label className="stack">
                  <span>Next Follow-up</span>
                  <input
                    className="input"
                    type="date"
                    value={followUp}
                    onChange={(event) => setFollowUp(event.target.value)}
                  />
                </label>
              </div>
              <div className="actions modal-actions">
                <button className="button" onClick={submitUpdate}>
                  Save Update
                </button>
                <button className="button secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadTable;
