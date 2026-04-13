import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUi } from "../components/ui/UiProvider";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ui = useUi();

  const handleLogin = async () => {
    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
  
    const data = await res.json();
  
    if (res.ok) {
      // ✅ store user
      localStorage.setItem("user", JSON.stringify(data));
  
      // ✅ REDIRECT BASED ON ROLE
      if (data.role === "owner") {
        navigate("/owner");
      } else if (data.role === "chef") {
        navigate("/chef");
      } else if (data.role === "accountant") {
        navigate("/accountant");
      }
    } else {
      ui.toast({ kind: "error", title: "Login failed", message: "Invalid username or password." });
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "#f8f9fa" }}
    >
      <div
        className="card shadow"
        style={{
          minWidth: 350,
          maxWidth: 380,
          padding: "2.5rem 2rem",
          borderRadius: "15px",
          border: 0,
          background: "#fff",
        }}
      >
        <h2 className="mb-4 text-center" style={{ fontWeight: 700 }}>Staff Login</h2>
        <input
          className="form-control mb-3"
          placeholder="Username"
          value={username}
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          className="form-control mb-4"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button
          className="btn btn-dark w-100"
          style={{ fontWeight: 600, letterSpacing: 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          className="btn btn-outline-secondary w-100 mt-3"
          style={{ fontWeight: 500, letterSpacing: 1 }}
          type="button"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Back to Main Page
        </button>
      </div>
    </div>
  );
}

export default Login;
