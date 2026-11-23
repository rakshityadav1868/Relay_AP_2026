import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/payments";

const STATUS_COLORS = {
  succeeded: "var(--good)",
  pending: "var(--warning)",
  failed: "var(--critical)"
};

export default function Payments() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [provider, setProvider] = useState("auto");
  const [country, setCountry] = useState("IN");
  const [error, setError] = useState("");
  const [createdPayment, setCreatedPayment] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [recent, setRecent] = useState([]);

  const token = localStorage.getItem("token");

  const loadRecent = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRecent(data);
    } catch (err) {
      // ignore, panel is best-effort
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          currency,
          country,
          provider: provider === "auto" ? undefined : provider
        })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not create payment");
        return;
      }

      setCreatedPayment(data);
      loadRecent();
    } catch (err) {
      setError("Cannot connect to server");
    }
  };

  const checkStatus = async (id) => {
    if (!id) return;
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not check status");
        return;
      }

      setCreatedPayment(data);
    } catch (err) {
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ margin: "0 0 20px", fontSize: "22px" }}>Payments</h2>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "20px", alignItems: "start" }}>
        <div className="card">
          <h3 style={{ margin: "0 0 16px", fontSize: "15px" }}>Create Payment</h3>
          {error && <p style={{ color: "var(--critical)", fontSize: "13px" }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label className="label">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{ padding: "9px 12px", width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label className="label">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ padding: "9px 12px", width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label className="label">Customer Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="IN, US, etc."
                style={{ padding: "9px 12px", width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label className="label">Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                style={{ padding: "9px 12px", width: "100%" }}
              >
                <option value="auto">Auto (route by country)</option>
                <option value="stripe">Stripe</option>
                <option value="razorpay">Razorpay</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%" }}>
              Create Payment
            </button>
          </form>

          {createdPayment && (
            <div
              className="card"
              style={{ marginTop: "16px", background: "var(--surface-2)", animation: "none" }}
            >
              <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                Payment Status
              </h4>
              <p style={{ margin: "4px 0", fontSize: "13.5px" }}><strong>ID:</strong> {createdPayment.id}</p>
              <p style={{ margin: "4px 0", fontSize: "13.5px" }}>
                <strong>Amount:</strong> {createdPayment.amount} {createdPayment.currency}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13.5px" }}><strong>Provider:</strong> {createdPayment.provider}</p>
              <p style={{ margin: "4px 0", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                <strong>Status:</strong>
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: STATUS_COLORS[createdPayment.status] || "var(--text-muted)",
                    display: "inline-block"
                  }}
                />
                {createdPayment.status}
              </p>
              <button
                onClick={() => checkStatus(createdPayment.id)}
                className="btn-ghost"
                style={{ marginTop: "8px" }}
              >
                Refresh Status
              </button>
            </div>
          )}

          <div style={{ marginTop: "16px" }}>
            <label className="label">Check Payment by ID</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Payment ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={{ padding: "9px 12px", flex: 1 }}
              />
              <button onClick={() => checkStatus(searchId)} className="btn-ghost">
                Check
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: "0 0 16px", fontSize: "15px" }}>Recent Payments</h3>
          {recent.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No payments yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-secondary)" }}>
                  <th style={{ paddingBottom: "8px", fontWeight: 500 }}>ID</th>
                  <th style={{ paddingBottom: "8px", fontWeight: 500 }}>Amount</th>
                  <th style={{ paddingBottom: "8px", fontWeight: 500 }}>Provider</th>
                  <th style={{ paddingBottom: "8px", fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 0" }}>{p.id}</td>
                    <td style={{ padding: "8px 0" }}>{p.amount} {p.currency}</td>
                    <td style={{ padding: "8px 0" }}>{p.provider}</td>
                    <td style={{ padding: "8px 0" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: STATUS_COLORS[p.status] || "var(--text-muted)",
                            display: "inline-block"
                          }}
                        />
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
