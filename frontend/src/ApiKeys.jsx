import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api-keys";

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [error, setError] = useState("");

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

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>API Keys</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
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
