import { useEffect, useState } from "react";

const AdminAnalytics = ({ apiBaseUrl, headers }) => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  const loadMetrics = () => {
    fetch(`${apiBaseUrl}/analytics/overview`, { headers })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          throw new Error(data.message);
        }
        setMetrics(data);
        setError("");
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadMetrics();
  }, [apiBaseUrl, headers]);

  return (
    <div className="card">
      <div className="header" style={{ marginBottom: 16 }}>
        <h2>Admin Analytics</h2>
        <button className="button secondary" onClick={loadMetrics}>
          Refresh
        </button>
      </div>
      {error && <div className="notice">{error}</div>}
      {!metrics ? (
        <p className="muted">Loading analytics...</p>
      ) : (
        <div className="grid cols-3">
          <div className="card">
            <h3>Total Leads</h3>
            <p>{metrics.totalLeads}</p>
            <p className="muted">All active leads in the system.</p>
          </div>
          <div className="card">
            <h3>Won</h3>
            <p>{metrics.wonLeads}</p>
            <p className="muted">Orders marked as won.</p>
          </div>
          <div className="card">
            <h3>Follow-ups</h3>
            <p>{metrics.followUpLeads}</p>
            <p className="muted">Leads requiring follow-up.</p>
          </div>
          <div className="card">
            <h3>Initial Contact</h3>
            <p>{metrics.initialLeads}</p>
            <p className="muted">Leads in initial contact stage.</p>
          </div>
          <div className="card">
            <h3>Active Agents</h3>
            <p>{metrics.activeAgents}</p>
            <p className="muted">Active sales users.</p>
          </div>
          <div className="card">
            <h3>Conversion Rate</h3>
            <p>{metrics.conversionRate}%</p>
            <p className="muted">Converted / total leads.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
