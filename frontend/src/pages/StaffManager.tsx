import { useEffect, useState } from "react";

type Staff = {
  id: number;
  username: string;
  role: string;
  salary: number;
};

function StaffManager() {

  const [staff, setStaff] = useState<Staff[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("chef");
  const [salary, setSalary] = useState("");

  const fetchStaff = () => {
    fetch("http://localhost:8000/api/staff/")
      .then(res => res.json())
      .then(data => setStaff(data));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const deleteStaff = async (id: number) => {

    if (!confirm("Delete this staff?")) return;

    await fetch(
      `http://localhost:8000/api/staff/delete/${id}/`,
      { method: "DELETE" }
    );

    fetchStaff();
  };

  const editSalary = async (id: number, currentSalary: number) => {

    const newSalary = prompt("New salary", String(currentSalary));

    if (!newSalary) return;

    await fetch(
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
      alert("Username, password and salary are required");
      return;
    }

    const res = await fetch("http://localhost:8000/api/staff/add/", {
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
      alert(data?.error || "Error creating staff");
      return;
    }

    setUsername("");
    setPassword("");
    setSalary("");
    setRole("chef");
    fetchStaff();
  };

  return (
    <div className="container mt-4">

      <h2 className="mb-4">Staff Manager</h2>

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
  );
}

export default StaffManager;