import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api-keys";

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState("");

  const token = localStorage.getItem("token");

  const loadKeys = async () => {
    setError("");
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not load keys");
        return;
      }

      setKeys(data);
    } catch (err) {
      setError("Cannot connect to server");
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const createKey = async () => {
    setError("");
    setNewKey("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not create key");
        return;
      }

      setNewKey(data.key);
      setName("");
      loadKeys();
    } catch (err) {
      setError("Cannot connect to server");
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>API Keys</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Key name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "8px", marginRight: "8px" }}
        />
        <button onClick={createKey} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Create New Key
        </button>
      </div>
      {newKey && (
        <div style={{ background: "#ffffcc", padding: "10px", marginBottom: "16px", wordBreak: "break-all" }}>
          <p style={{ margin: "0 0 6px 0" }}>Copy your key now, it won't be shown again:</p>
          <code>{newKey}</code>
        </div>
      )}
      {keys.length === 0 ? (
        <p>No API keys yet.</p>
      ) : (
        <ul style={{ paddingLeft: "20px" }}>
          {keys.map((key) => (
            <li key={key.id} style={{ marginBottom: "8px" }}>
              {key.name || "Unnamed key"} (created {new Date(key.createdAt).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
