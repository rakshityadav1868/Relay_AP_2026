import { useState, useEffect, useMemo, useRef } from "react";

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

const PROVIDER_COLORS = {
  stripe: "#3987e5",
  razorpay: "#d95926"
};

const FEE_RATE = 0.02;
const DAYS = 14;

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
  const succeededPayments = payments.filter((p) => p.status === "succeeded");
  const grossVolume = succeededPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const netVolume = grossVolume * (1 - FEE_RATE);
  const feesCollected = grossVolume - netVolume;

  const counts = { succeeded: 0, pending: 0, failed: 0 };
  payments.forEach((p) => {
    if (counts[p.status] !== undefined) counts[p.status] += 1;
  });
  const successRate = total ? Math.round((counts.succeeded / total) * 100) : 0;
  const maxCount = Math.max(1, ...Object.values(counts));

  const providerCounts = {};
  payments.forEach((p) => {
    providerCounts[p.provider] = (providerCounts[p.provider] || 0) + 1;
  });
  const maxProviderCount = Math.max(1, ...Object.values(providerCounts));

  const series = useMemo(() => buildDailySeries(succeededPayments, DAYS), [payments]);

  return (
    <div className="fade-in" style={{ width: "100%" }}>
      <h2 style={{ margin: "0 0 20px", fontSize: "22px" }}>Overview</h2>

      {error && <p style={{ color: "var(--critical)" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "16px",
          marginBottom: "20px"
        }}
      >
        <StatTile label="Gross Volume" value={formatMoney(grossVolume)} delay={0} />
        <StatTile
          label="Net Volume"
          value={formatMoney(netVolume)}
          sub={`after ${(FEE_RATE * 100).toFixed(0)}% est. fees`}
          delay={0.04}
        />
        <StatTile label="Fees Collected" value={formatMoney(feesCollected)} delay={0.08} />
        <StatTile label="Total Payments" value={total} delay={0.12} />
        <StatTile label="Success Rate" value={`${successRate}%`} delay={0.16} accent="var(--good)" />
      </div>

      <div className="card" style={{ marginBottom: "20px", animationDelay: "0.18s" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: "15px" }}>Volume (last {DAYS} days)</h3>
        <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--text-secondary)" }}>
          Gross volume from succeeded payments, per day
        </p>
        <VolumeChart series={series} loading={loading} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px"
        }}
      >
        <div className="card" style={{ animationDelay: "0.22s" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: "15px" }}>Payments by Status</h3>
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--text-secondary)" }}>
            Every payment created through your account
          </p>

          {loading ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Loading...</p>
          ) : total === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              No payments yet. Create one from the Payments tab.
            </p>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "28px", height: "140px", paddingTop: "10px" }}>
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
                        maxWidth: "48px",
                        height: `${Math.max(heightPct, 4)}%`,
                        background: STATUS_COLORS[status],
                        borderRadius: "4px 4px 0 0",
                        animation: "grow-bar 0.6s ease both",
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
              <Legend key={status} color={STATUS_COLORS[status]} label={STATUS_LABELS[status]} />
            ))}
          </div>
        </div>

        <div className="card" style={{ animationDelay: "0.26s" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: "15px" }}>Payments by Provider</h3>
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--text-secondary)" }}>
            Where Relay routed each payment
          </p>

          {loading ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Loading...</p>
          ) : total === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No payments yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "6px" }}>
              {Object.keys(providerCounts).map((provider, i) => {
                const widthPct = (providerCounts[provider] / maxProviderCount) * 100;
                return (
                  <div key={provider}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                      <span style={{ textTransform: "capitalize" }}>{provider}</span>
                      <span style={{ color: "var(--text-secondary)" }}>{providerCounts[provider]}</span>
                    </div>
                    <div style={{ background: "var(--surface-2)", borderRadius: "6px", height: "10px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.max(widthPct, 4)}%`,
                          height: "100%",
                          background: PROVIDER_COLORS[provider] || "var(--accent)",
                          borderRadius: "6px",
                          animation: "grow-bar-x 0.6s ease both",
                          animationDelay: `${0.15 + i * 0.08}s`,
                          transformOrigin: "left"
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", gap: "18px", marginTop: "18px", flexWrap: "wrap" }}>
            {Object.keys(providerCounts).map((provider) => (
              <Legend key={provider} color={PROVIDER_COLORS[provider] || "var(--accent)"} label={capitalize(provider)} />
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ animationDelay: "0.3s" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "15px" }}>Recent Activity</h3>
        {total === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Nothing yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-secondary)" }}>
                <th style={{ paddingBottom: "8px", fontWeight: 500 }}>ID</th>
                <th style={{ paddingBottom: "8px", fontWeight: 500 }}>Amount</th>
                <th style={{ paddingBottom: "8px", fontWeight: 500 }}>Provider</th>
                <th style={{ paddingBottom: "8px", fontWeight: 500 }}>Status</th>
                <th style={{ paddingBottom: "8px", fontWeight: 500 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 8).map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 0" }}>{p.id}</td>
                  <td style={{ padding: "8px 0" }}>{p.amount} {p.currency}</td>
                  <td style={{ padding: "8px 0", textTransform: "capitalize" }}>{p.provider}</td>
                  <td style={{ padding: "8px 0" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: STATUS_COLORS[p.status] || "var(--text-muted)",
                          display: "inline-block"
                        }}
                      />
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px 0", color: "var(--text-secondary)" }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @keyframes grow-bar {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }
        @keyframes grow-bar-x {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </div>
  );
}

function StatTile({ label, value, sub, delay, accent }) {
  return (
    <div className="card" style={{ animationDelay: `${delay}s` }}>
      <p className="label" style={{ marginBottom: "8px" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: accent || "var(--text-primary)" }}>
        {value}
      </p>
      {sub && <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function buildDailySeries(succeededPayments, days) {
  const buckets = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), value: 0 });
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));
  succeededPayments.forEach((p) => {
    const key = new Date(p.createdAt).toISOString().slice(0, 10);
    if (byKey[key]) byKey[key].value += parseFloat(p.amount);
  });
  return buckets;
}

function formatMoney(n) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function VolumeChart({ series, loading }) {
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);

  const width = 1000;
  const height = 220;
  const padding = { top: 10, right: 10, bottom: 24, left: 10 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxVal = Math.max(1, ...series.map((d) => d.value));
  const stepX = series.length > 1 ? innerW / (series.length - 1) : 0;

  const points = series.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - (d.value / maxVal) * innerH,
    ...d
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 0} ${padding.top + innerH} L ${points[0]?.x || 0} ${padding.top + innerH} Z`;

  const handleMove = (e) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    let nearest = points[0];
    let bestDist = Infinity;
    points.forEach((p) => {
      const dist = Math.abs(p.x - relX);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = p;
      }
    });
    setHover(nearest);
  };

  if (loading) {
    return <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Loading...</p>;
  }

  if (series.every((d) => d.value === 0)) {
    return <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No succeeded payments yet to chart.</p>;
  }

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "220px", display: "block" }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <line
          x1={padding.left}
          y1={padding.top + innerH}
          x2={width - padding.right}
          y2={padding.top + innerH}
          stroke="var(--border)"
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="volume-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#volume-fill)" />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" />
        {hover && (
          <line
            x1={hover.x}
            y1={padding.top}
            x2={hover.x}
            y2={padding.top + innerH}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}
        {hover && <circle cx={hover.x} cy={hover.y} r="4" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />}
      </svg>
      {hover && (
        <div
          className="fade-in"
          style={{
            position: "absolute",
            left: `${(hover.x / width) * 100}%`,
            top: 0,
            transform: hover.x > width / 2 ? "translateX(-105%)" : "translateX(8px)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "8px 10px",
            fontSize: "12px",
            pointerEvents: "none",
            whiteSpace: "nowrap"
          }}
        >
          <div style={{ color: "var(--text-secondary)" }}>{hover.label}</div>
          <div style={{ fontWeight: 700, fontSize: "14px" }}>{formatMoney(hover.value)}</div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
        {series.filter((_, i) => i % Math.ceil(series.length / 6) === 0).map((d) => (
          <span key={d.key} style={{ fontSize: "11px", color: "var(--text-muted)" }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
