import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useUi } from "../components/ui/UiProvider";

type Staff = {
  id: number;
  username: string;
  role: string;
  salary: number;
};

function StaffManager() {
  const ui = useUi();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("chef");
  const [salary, setSalary] = useState("");
  const navigate = useNavigate();

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
    return null;
  };

  const ensureCsrfCookie = async () => {
    // Backend exposes GET /api/get-csrf/ to set csrftoken cookie
    await fetch("http://localhost:8000/api/get-csrf/", {
      method: "GET",
      credentials: "include",
    }).catch(() => null);
  };

  const authedFetch: typeof fetch = async (input, init) => {
    const method = (init?.method || "GET").toUpperCase();

    // Session auth requires cookies on every request
    const nextInit: RequestInit = {
      ...init,
      credentials: "include",
    };

    // For unsafe methods, include CSRF token (Django SessionAuthentication)
    if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
      const csrf = getCookie("csrftoken");
      nextInit.headers = {
        ...(init?.headers || {}),
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      };
    }

    return fetch(input, nextInit);
  };

  const fetchStaff = () => {
    authedFetch("http://localhost:8000/api/staff/")
      .then(res => res.json())
      .then(data => setStaff(data));
  };

  useEffect(() => {
    ensureCsrfCookie().then(fetchStaff);
  }, []);

  const deleteStaff = async (id: number) => {
    const ok = await ui.confirm({
      title: "Delete staff?",
      message: "This will permanently remove the staff account.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!ok) return;
    await authedFetch(
      `http://localhost:8000/api/staff/delete/${id}/`,
      { method: "DELETE" }
    );
    fetchStaff();
  };

  const editSalary = async (id: number, currentSalary: number) => {
    const newSalary = await ui.prompt({
      title: "Edit salary",
      message: "Enter the new salary amount.",
      defaultValue: String(currentSalary),
      placeholder: "e.g. 25000",
      confirmText: "Update",
      cancelText: "Cancel",
    });
    if (!newSalary) return;
    await authedFetch(
      `http://localhost:8000/api/staff/salary/${id}/`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary: Number(newSalary) })
      }
    );
    fetchStaff();
  };

  const addStaff = async () => {
    if (!username.trim() || !password.trim() || !salary.trim()) {
      ui.toast({ kind: "warning", title: "Missing fields", message: "Username, password and salary are required." });
      return;
    }
    const res = await authedFetch("http://localhost:8000/api/staff/add/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        password,
        role,
        salary: Number(salary),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      ui.toast({ kind: "error", title: "Create failed", message: data?.error || "Error creating staff." });
      return;
    }
    ui.toast({ kind: "success", title: "Staff added", message: "New staff account created." });
    setUsername("");
    setPassword("");
    setSalary("");
    setRole("chef");
    fetchStaff();
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <Header cart={[]} setCartOpen={() => {}} openOrderModal={() => {}} />

      <div className="container mt-4 flex-grow-1">

        <div className="d-flex align-items-center mb-4 justify-content-between">
          <h2 className="mb-0">Staff Manager</h2>
          {/* Back Button - now on right side */}
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
            style={{ minWidth: 90 }}
          >
            &larr; Back
          </button>
        </div>

        <div className="card p-3 mb-4">
          <h4 className="mb-3">Add New Staff</h4>

          <input
            className="form-control mb-2"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="form-control mb-2"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            className="form-control mb-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="chef">Chef</option>
            <option value="accountant">Accountant</option>
            <option value="owner">Owner</option>
          </select>

          <input
            className="form-control mb-3"
            placeholder="Salary"
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />

          <button className="btn btn-success" onClick={addStaff}>
            Add Staff
          </button>
        </div>

        <h3 className="mb-3">Staff List</h3>

        <table className="table table-bordered">

          <thead className="table-dark">
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td>{s.username}</td>
                <td>{s.role}</td>
                <td>₹{s.salary}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => editSalary(s.id, s.salary)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteStaff(s.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default StaffManager;