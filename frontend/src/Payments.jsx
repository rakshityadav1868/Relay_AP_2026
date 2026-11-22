import { useState } from "react";

const API_URL = "http://localhost:3000/payments";

export default function Payments() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [provider, setProvider] = useState("stripe");
  const [error, setError] = useState("");
  const [createdPayment, setCreatedPayment] = useState(null);
  const [searchId, setSearchId] = useState("");

  const token = localStorage.getItem("token");

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
        body: JSON.stringify({ amount, currency, provider })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not create payment");
        return;
      }

      setCreatedPayment(data);
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
    <div style={{ marginTop: "30px" }}>
      <h3>Payments</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ padding: "8px", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>Currency:</label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{ padding: "8px", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>Provider:</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{ padding: "8px", width: "100%", boxSizing: "border-box" }}
          >
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
          </select>
        </div>
        <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>
          Create Payment
        </button>
      </form>

      {createdPayment && (
        <div style={{ marginTop: "20px", padding: "12px", background: "#f0f0f0", borderRadius: "4px" }}>
          <h4 style={{ margin: "0 0 10px 0" }}>Payment Status</h4>
          <p style={{ margin: "4px 0" }}><strong>ID:</strong> {createdPayment.id}</p>
          <p style={{ margin: "4px 0" }}><strong>Amount:</strong> {createdPayment.amount} {createdPayment.currency}</p>
          <p style={{ margin: "4px 0" }}><strong>Provider:</strong> {createdPayment.provider}</p>
          <p style={{ margin: "4px 0" }}><strong>Status:</strong> {createdPayment.status}</p>
          <button
            onClick={() => checkStatus(createdPayment.id)}
            style={{ marginTop: "8px", padding: "6px 12px", cursor: "pointer" }}
          >
            Refresh Status
          </button>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h4>Check Payment by ID</h4>
        <input
          type="text"
          placeholder="Payment ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ padding: "8px", marginRight: "8px" }}
        />
        <button
          onClick={() => checkStatus(searchId)}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Check
        </button>
      </div>
    </div>
  );
}
