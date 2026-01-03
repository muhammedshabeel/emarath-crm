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
  const [product, setProduct] = useState([]);
  const [qty, setQty] = useState("");
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
    setProduct(selectedProducts);
    setQty(lead.qty ?? "");
    setNotes(lead.notes || "");
    setCity(lead.city || "");
    setAddress(lead.address || "");
    setValue(lead.value ?? "");
    setPaymentMethod(lead.paymentMethod || "");
    setShipmentDate(
      lead.shipmentDate ? lead.shipmentDate.slice(0, 10) : ""
    );
    setFollowUp("");
  };

  const closeModal = () => {
    setSelectedLead(null);
  };

  const submitUpdate = async () => {
    if (!selectedLead) {
      return;
    }

    if (status === "WON") {
      const missingFields = [];
      if (product.length === 0) missingFields.push("Product");
      if (!qty) missingFields.push("Qty");
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
      const normalizedProducts = product.join(", ");
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
            qty: qty ? Number(qty) : null,
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

  const toggleProduct = (value) => {
    setProduct((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const changeQty = (delta) => {
    const current = Number(qty || 0);
    const next = Math.max(0, current + delta);
    setQty(next === 0 ? "" : next);
  };

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
              <div className="form-grid">
                <label className="stack">
                  <span>Country</span>
                  <input
                    className="input"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                  />
                </label>
                <label className="stack">
                  <span>Qty</span>
                  <div className="qty-control">
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => changeQty(-1)}
                    >
                      -
                    </button>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(event) => setQty(event.target.value)}
                    />
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => changeQty(1)}
                    >
                      +
                    </button>
                  </div>
                </label>
              </div>
              <label className="stack">
                <span>Product (select multiple)</span>
                <div className="product-grid">
                  {productOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`product-chip${product.includes(option) ? " selected" : ""}`}
                      onClick={() => toggleProduct(option)}
                    >
                      {option}
                    </button>
                  ))}
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
              <div className="actions">
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
