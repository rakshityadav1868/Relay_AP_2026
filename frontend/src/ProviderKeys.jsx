import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/provider-keys";

export default function ProviderKeys() {
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const loadKeys = async () => {
    setError("");
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not load provider keys");
        return;
      }

      setSaved(data);
    } catch (err) {
      setError("Cannot connect to server");
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stripeSecretKey, razorpayKeyId, razorpayKeySecret })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not save provider keys");
        return;
      }

      setMessage("Provider keys saved");
      setStripeSecretKey("");
      setRazorpayKeyId("");
      setRazorpayKeySecret("");
      loadKeys();
    } catch (err) {
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="card fade-in">
      <h3 style={{ margin: "0 0 4px", fontSize: "16px" }}>Your Payment Provider Keys</h3>
      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--text-secondary)" }}>
        Relay uses your own Stripe/Razorpay credentials to create payments — it never holds your money.
      </p>
      {error && <p style={{ color: "var(--critical)", fontSize: "13px" }}>{error}</p>}
      {message && <p style={{ color: "var(--good)", fontSize: "13px" }}>{message}</p>}

      {saved && (
        <div
          style={{
            marginBottom: "16px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "12px"
          }}
        >
          <p style={{ margin: "4px 0" }}>Stripe secret key: {saved.stripeSecretKey || "not set"}</p>
          <p style={{ margin: "4px 0" }}>Razorpay key id: {saved.razorpayKeyId || "not set"}</p>
          <p style={{ margin: "4px 0" }}>Razorpay key secret: {saved.razorpayKeySecret || "not set"}</p>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: "12px" }}>
          <label className="label">Stripe Secret Key</label>
          <input
            type="text"
            placeholder="sk_test_..."
            value={stripeSecretKey}
            onChange={(e) => setStripeSecretKey(e.target.value)}
            style={{ padding: "9px 12px", width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label className="label">Razorpay Key Id</label>
          <input
            type="text"
            placeholder="rzp_test_..."
            value={razorpayKeyId}
            onChange={(e) => setRazorpayKeyId(e.target.value)}
            style={{ padding: "9px 12px", width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label className="label">Razorpay Key Secret</label>
          <input
            type="text"
            placeholder="key secret"
            value={razorpayKeySecret}
            onChange={(e) => setRazorpayKeySecret(e.target.value)}
            style={{ padding: "9px 12px", width: "100%" }}
          />
        </div>
        <button type="submit" className="btn-primary">
          Save Keys
        </button>
      </form>
    </div>
  );
}
