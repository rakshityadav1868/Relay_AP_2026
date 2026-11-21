import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [page, setPage] = useState("login");

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
    setPage("login");
  };

  if (token) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <Login
      onLogin={handleLogin}
      onNavigateSignup={() => setPage("signup")}
    />
  );
}
