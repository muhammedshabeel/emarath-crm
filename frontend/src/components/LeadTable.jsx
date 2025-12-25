import { useEffect, useState } from "react";

const statusOptions = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "CONVERTED",
  "NOT_INTERESTED"
];

const LeadTable = ({ apiBaseUrl, headers, isAdmin = false }) => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [status, setStatus] = useState("NEW");
  const [remarks, setRemarks] = useState("");
  const [value, setValue] = useState("");
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
    setStatus(lead.status || "NEW");
    setRemarks("");
    setValue("");
    setFollowUp("");
  };

  const closeModal = () => {
    setSelectedLead(null);
  };

  const submitUpdate = async () => {
    if (!selectedLead) {
      return;
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
            value: value ? Number(value) : null,
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
              <td>
                <span className="badge">{lead.status}</span>
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
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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
                <span>Conversion Value</span>
                <input
                  className="input"
                  type="number"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
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
