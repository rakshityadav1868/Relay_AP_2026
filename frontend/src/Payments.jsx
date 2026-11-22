import { useState } from "react";

const API_URL = "http://localhost:3000/payments";

export default function Payments() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [provider, setProvider] = useState("stripe");
  const [error, setError] = useState("");
  const [createdPayment, setCreatedPayment] = useState(null);

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

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Create Payment</h3>
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
    </div>
  );
}
