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
    <div style={{ marginTop: "30px" }}>
      <h3>Your Payment Provider Keys</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      {saved && (
        <div style={{ marginBottom: "16px", fontSize: "14px" }}>
          <p style={{ margin: "4px 0" }}>Stripe secret key: {saved.stripeSecretKey || "not set"}</p>
          <p style={{ margin: "4px 0" }}>Razorpay key id: {saved.razorpayKeyId || "not set"}</p>
          <p style={{ margin: "4px 0" }}>Razorpay key secret: {saved.razorpayKeySecret || "not set"}</p>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>Stripe Secret Key:</label>
          <input
            type="text"
            placeholder="sk_test_..."
            value={stripeSecretKey}
            onChange={(e) => setStripeSecretKey(e.target.value)}
            style={{ padding: "8px", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>Razorpay Key Id:</label>
          <input
            type="text"
            placeholder="rzp_test_..."
            value={razorpayKeyId}
            onChange={(e) => setRazorpayKeyId(e.target.value)}
            style={{ padding: "8px", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>Razorpay Key Secret:</label>
          <input
            type="text"
            placeholder="key secret"
            value={razorpayKeySecret}
            onChange={(e) => setRazorpayKeySecret(e.target.value)}
            style={{ padding: "8px", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>
          Save Keys
        </button>
      </form>
    </div>
  );
}
