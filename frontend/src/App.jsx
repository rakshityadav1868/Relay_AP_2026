import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
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

  if (page === "signup") {
    return <Signup onNavigateLogin={() => setPage("login")} />;
  }

  return (
    <Login
      onLogin={handleLogin}
      onNavigateSignup={() => setPage("signup")}
    />
  );
}
