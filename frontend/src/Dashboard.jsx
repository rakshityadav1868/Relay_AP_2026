import { useState } from "react";
import Sidebar from "./Sidebar";
import Overview from "./Overview";
import ApiKeys from "./ApiKeys";
import Payments from "./Payments";
import WebhookEvents from "./WebhookEvents";
import ProviderKeys from "./ProviderKeys";

export default function Dashboard({ onLogout }) {
  const [active, setActive] = useState("overview");

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={active} onNavigate={setActive} onLogout={handleLogout} />
      <div style={{ flex: 1, padding: "28px 32px", maxWidth: "1000px" }}>
        {active === "overview" && <Overview />}
        {active === "payments" && <Payments />}
        {active === "providerKeys" && <ProviderKeys />}
        {active === "apiKeys" && <ApiKeys />}
        {active === "webhooks" && <WebhookEvents />}
      </div>
    </div>
  );
}
