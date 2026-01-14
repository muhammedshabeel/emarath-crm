import { useState } from "react";

const LoginForm = ({ apiBaseUrl, onLogin, error, setError }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card login-card">
      <div className="login-brand">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div>
          <h2>CRM Suite</h2>
          <p className="login-subtitle">Sign in to access your CRM dashboard</p>
        </div>
      </div>

      {error && <div className="notice">{error}</div>}

      <form className="stack" onSubmit={handleSubmit}>
        <label className="stack">
          <span>Email</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="agent@emarath.com"
            required
          />
        </label>
        <label className="stack">
          <span>Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Continue"}
        </button>
      </form>
      <div className="login-divider">Secure Access</div>
      <p className="login-footer">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default LoginForm;
