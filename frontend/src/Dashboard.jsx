import ApiKeys from "./ApiKeys";

export default function Dashboard({ onLogout }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Dashboard</h2>
      <p>Welcome to Relay. You are logged in.</p>
      <button
        onClick={handleLogout}
        style={{ padding: "8px 16px", cursor: "pointer" }}
      >
        Log Out
      </button>
      <ApiKeys />
    </div>
  );
}
