import { useState } from "react";

const API_URL = "http://localhost:3000/webhooks";

export default function WebhookEvents() {
  const [paymentId, setPaymentId] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const loadEvents = async () => {
    if (!paymentId) return;
    setError("");
    setSearched(true);
    try {
      const res = await fetch(`${API_URL}/payment/${paymentId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not load webhook events");
        return;
      }

      setEvents(data);
    } catch (err) {
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="card fade-in">
      <h3 style={{ margin: "0 0 4px", fontSize: "16px" }}>Webhook Events</h3>
      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--text-secondary)" }}>
        Look up the verified Stripe/Razorpay events received for a payment
      </p>
      {error && <p style={{ color: "var(--critical)", fontSize: "13px" }}>{error}</p>}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Payment ID"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          style={{ padding: "9px 12px", flex: 1 }}
        />
        <button onClick={loadEvents} className="btn-primary">
          Load Events
        </button>
      </div>

      {searched && events.length === 0 && !error && (
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No webhook events for this payment yet.</p>
      )}

      {events.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--text-secondary)" }}>
              <th style={{ paddingBottom: "8px", fontWeight: 500 }}>ID</th>
              <th style={{ paddingBottom: "8px", fontWeight: 500 }}>Event Type</th>
              <th style={{ paddingBottom: "8px", fontWeight: 500 }}>Received At</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 0" }}>{event.id}</td>
                <td style={{ padding: "8px 0" }}>{event.eventType}</td>
                <td style={{ padding: "8px 0" }}>{new Date(event.receivedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
