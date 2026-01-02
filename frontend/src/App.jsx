import { useEffect, useMemo, useState } from "react";
import LoginForm from "./components/LoginForm.jsx";
import LeadTable from "./components/LeadTable.jsx";
import AdminAnalytics from "./components/AdminAnalytics.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const authHeaders = useMemo(() => {
    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchJson(`${API_BASE_URL}/auth/me`, { headers: authHeaders })
      .then((data) => {
        setUser(data);
        setError("");
      })
      .catch((err) => {
        setError(err.message);
        handleLogout();
      });
  }, [token, authHeaders]);

  if (!token || !user) {
    return (
      <div className="app-shell">
        <LoginForm
          apiBaseUrl={API_BASE_URL}
          onLogin={(payload) => {
            localStorage.setItem("token", payload.token);
            setToken(payload.token);
            setUser(payload.user);
            setError("");
          }}
          error={error}
          setError={setError}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <h1>Emarath Sales Portal</h1>
          <p className="muted">
            Logged in as {user.name} ({user.role.toLowerCase()})
          </p>
        </div>
        <button className="button secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="notice">{error}</div>}

      {user.role === "ADMIN" ? (
        <div className="stack">
          <AdminAnalytics apiBaseUrl={API_BASE_URL} headers={authHeaders} />
          <LeadTable apiBaseUrl={API_BASE_URL} headers={authHeaders} isAdmin />
        </div>
      ) : (
        <LeadTable apiBaseUrl={API_BASE_URL} headers={authHeaders} />
      )}
    </div>
  );
};

export default App;
