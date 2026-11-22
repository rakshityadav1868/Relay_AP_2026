import { useState } from "react";

const API_URL = "http://localhost:3000/webhooks";

export default function WebhookEvents() {
  const [paymentId, setPaymentId] = useState("");
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    if (!paymentId) return;
    setError("");
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
    <div style={{ marginTop: "30px" }}>
      <h3>Webhook Events</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Payment ID"
        value={paymentId}
        onChange={(e) => setPaymentId(e.target.value)}
        style={{ padding: "8px", marginRight: "8px" }}
      />
      <button onClick={loadEvents} style={{ padding: "8px 16px", cursor: "pointer" }}>
        Load Events
      </button>

      <table style={{ marginTop: "16px", width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>ID</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Event Type</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Received At</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.id}</td>
              <td>{event.eventType}</td>
              <td>{new Date(event.receivedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
