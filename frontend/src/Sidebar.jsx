const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "◧" },
  { id: "payments", label: "Payments", icon: "⇄" },
  { id: "providerKeys", label: "Provider Keys", icon: "⚿" },
  { id: "apiKeys", label: "API Keys", icon: "⌁" },
  { id: "webhooks", label: "Webhook Events", icon: "◎" }
];

const DOCS_ITEM = { id: "docs", label: "Documentation", icon: "⎘" };

export default function Sidebar({ active, onNavigate, onLogout }) {
  return (
    <div
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        position: "sticky",
        top: 0
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px", marginBottom: "28px" }}>
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #3987e5, #0ca30c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "14px",
            flexShrink: 0
          }}
        >
          R
        </div>
        <span style={{ fontWeight: 600, fontSize: "15px" }}>Relay</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.id} item={item} active={active} onNavigate={onNavigate} />
        ))}
      </nav>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "10px" }}>
        <NavButton item={DOCS_ITEM} active={active} onNavigate={onNavigate} />
        <button
          onClick={onLogout}
          className="btn-ghost"
          style={{ width: "100%", marginTop: "8px" }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

function NavButton({ item, active, onNavigate }) {
  const isActive = active === item.id;
  return (
    <button
      onClick={() => onNavigate(item.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px",
        width: "100%",
        background: isActive ? "var(--accent-soft)" : "transparent",
        color: isActive ? "var(--accent)" : "var(--text-secondary)",
        borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
        borderRadius: "8px",
        fontSize: "13.5px",
        fontWeight: isActive ? 600 : 500,
        textAlign: "left",
        transition: "all 0.15s ease"
      }}
    >
      <span style={{ fontSize: "14px", width: "16px", textAlign: "center" }}>{item.icon}</span>
      {item.label}
    </button>
  );
}
