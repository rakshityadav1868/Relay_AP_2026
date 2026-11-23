import { useState } from "react";

export default function Login({ onLogin, onNavigateSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      onLogin(data.token);
    } catch (err) {
      setError("Cannot connect to server");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 30% 20%, rgba(57,135,229,0.10), transparent 45%), radial-gradient(circle at 80% 80%, rgba(12,163,12,0.08), transparent 45%), #0a0a0a"
      }}
    >
      <div className="card fade-in" style={{ width: "360px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3987e5, #0ca30c)",
              margin: "0 auto 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "18px"
            }}
          >
            R
          </div>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Welcome back</h2>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
            Log in to your Relay account
          </p>
        </div>

        {error && (
          <p
            style={{
              color: "var(--critical)",
              fontSize: "13px",
              background: "rgba(208,59,59,0.1)",
              border: "1px solid rgba(208,59,59,0.3)",
              borderRadius: "8px",
              padding: "8px 10px",
              marginBottom: "14px"
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px 12px" }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 12px" }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%" }}>
            Log In
          </button>
        </form>

        <p style={{ marginTop: "18px", fontSize: "13px", textAlign: "center", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onNavigateSignup}
            style={{ background: "none", color: "var(--accent)", padding: 0, fontSize: "13px" }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
