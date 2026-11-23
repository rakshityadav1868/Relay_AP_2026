import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/payments";

const STATUS_COLORS = {
  succeeded: "var(--good)",
  pending: "var(--warning)",
  failed: "var(--critical)"
};

const STATUS_LABELS = {
  succeeded: "Succeeded",
  pending: "Pending",
  failed: "Failed"
};

export default function Overview() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Could not load payments");
          setLoading(false);
          return;
        }

        setPayments(data);
        setLoading(false);
      } catch (err) {
        setError("Cannot connect to server");
        setLoading(false);
      }
    };

    load();
  }, []);

  const total = payments.length;
  const volume = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const counts = { succeeded: 0, pending: 0, failed: 0 };
  payments.forEach((p) => {
    if (counts[p.status] !== undefined) counts[p.status] += 1;
  });
  const successRate = total ? Math.round((counts.succeeded / total) * 100) : 0;
  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <div className="fade-in">
      <h2 style={{ margin: "0 0 20px", fontSize: "22px" }}>Overview</h2>

      {error && <p style={{ color: "var(--critical)" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "20px"
        }}
      >
        <StatTile label="Total Payments" value={total} delay={0} />
        <StatTile
          label="Total Volume"
          value={volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          delay={0.05}
        />
        <StatTile label="Success Rate" value={`${successRate}%`} delay={0.1} accent="var(--good)" />
      </div>

      <div className="card" style={{ animationDelay: "0.15s" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: "15px" }}>Payments by Status</h3>
        <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--text-secondary)" }}>
          Breakdown of every payment created through your account
        </p>

        {loading ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Loading...</p>
        ) : total === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            No payments yet. Create one from the Payments tab.
          </p>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "32px", height: "160px", paddingTop: "10px" }}>
            {Object.keys(counts).map((status, i) => {
              const heightPct = (counts[status] / maxCount) * 100;
              return (
                <div key={status} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                  <div style={{ fontSize: "13px", marginBottom: "6px", color: "var(--text-secondary)" }}>
                    {counts[status]}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "56px",
                      height: `${Math.max(heightPct, 4)}%`,
                      background: STATUS_COLORS[status],
                      borderRadius: "4px 4px 0 0",
                      animation: `grow-bar 0.6s ease both`,
                      animationDelay: `${0.1 + i * 0.08}s`,
                      transformOrigin: "bottom"
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: "18px", marginTop: "18px", flexWrap: "wrap" }}>
          {Object.keys(STATUS_LABELS).map((status) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: STATUS_COLORS[status],
                  display: "inline-block"
                }}
              />
              {STATUS_LABELS[status]}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes grow-bar {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function StatTile({ label, value, delay, accent }) {
  return (
    <div className="card" style={{ animationDelay: `${delay}s` }}>
      <p className="label" style={{ marginBottom: "8px" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "26px", fontWeight: 700, color: accent || "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}
