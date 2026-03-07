import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Basic validation
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      if (res.ok && data.role) {
        alert("Login successful");
      
        if (data.role === "chef") {
          navigate("/chef");
        } else if (data.role === "accountant") {
          navigate("/accountant");
        } else if (data.role === "owner") {
          navigate("/owner");
        }
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      alert("An error occurred, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Staff Login</h2>

      <input
        className="form-control mb-2"
        placeholder="Username"
        value={username}
        autoComplete="username"
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />

      <input
        type="password"
        className="form-control mb-2"
        placeholder="Password"
        value={password}
        autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <button
        className="btn btn-dark"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

export default Login;
