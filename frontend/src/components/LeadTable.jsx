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
  const [product, setProduct] = useState("");
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
    setProduct(lead.product || "");
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
      if (!product) missingFields.push("Product");
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
            product,
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
            <div className="stack">
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
                <span>Country</span>
                <input
                  className="input"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                />
              </label>
              <label className="stack">
                <span>Product</span>
                <input
                  className="input"
                  value={product}
                  onChange={(event) => setProduct(event.target.value)}
                />
              </label>
              <label className="stack">
                <span>Qty</span>
                <input
                  className="input"
                  type="number"
                  value={qty}
                  onChange={(event) => setQty(event.target.value)}
                />
              </label>
              <label className="stack">
                <span>Notes</span>
                <input
                  className="input"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
              <label className="stack">
                <span>City</span>
                <input
                  className="input"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
              </label>
              <label className="stack">
                <span>Address</span>
                <input
                  className="input"
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
                <span>Value</span>
                <input
                  className="input"
                  type="number"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
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
