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

  const deleteKey = async (id) => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Could not delete key");
        return;
      }

      loadKeys();
    } catch (err) {
      setError("Cannot connect to server");
    }
  };

  return (
    <div className="card fade-in">
      <h3 style={{ margin: "0 0 16px", fontSize: "16px" }}>API Keys</h3>
      {error && <p style={{ color: "var(--critical)", fontSize: "13px" }}>{error}</p>}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Key name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "9px 12px", flex: 1 }}
        />
        <button onClick={createKey} className="btn-primary">
          Create New Key
        </button>
      </div>
      {newKey && (
        <div
          style={{
            background: "rgba(250,178,25,0.1)",
            border: "1px solid rgba(250,178,25,0.3)",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "16px",
            wordBreak: "break-all"
          }}
        >
          <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "var(--text-secondary)" }}>
            Copy your key now, it won't be shown again:
          </p>
          <code style={{ color: "var(--warning)" }}>{newKey}</code>
        </div>
      )}
      {keys.length === 0 ? (
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No API keys yet.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
          {keys.map((key) => (
            <li
              key={key.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
                fontSize: "13.5px"
              }}
            >
              <span>
                {key.name || "Unnamed key"}{" "}
                <span style={{ color: "var(--text-muted)" }}>
                  (created {new Date(key.createdAt).toLocaleString()})
                </span>
              </span>
              <button onClick={() => deleteKey(key.id)} className="btn-ghost">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
