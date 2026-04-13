import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import DashboardFooter from "../components/DashboardFooter";

type Order = {
  id: number;
  total_amount: number;
  status: string;
  created_at?: string;
  table?: number;
};

type StatusCount = {
  [key: string]: number;
};

type Category = {
  id: number;
  name: string;
  is_active: boolean;
};

export default function OwnerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [statusCounts, setStatusCounts] = useState<StatusCount>({});
  const [search, setSearch] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false); // new state

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
    return null;
  };

  const ensureCsrfCookie = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/get-csrf/`, {
      method: "GET",
      credentials: "include",
    }).catch(() => null);
  };

  const authedFetch: typeof fetch = async (input, init) => {
    const method = (init?.method || "GET").toUpperCase();
    const nextInit: RequestInit = { ...init, credentials: "include" };

    if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
      const csrf = getCookie("csrftoken");
      nextInit.headers = {
        ...(init?.headers || {}),
        ...(csrf ? { "X-CSRFToken": csrf } : {}),
      };
    }
    return fetch(input, nextInit);
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/all-orders/`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);

        const total = data.reduce(
          (sum: number, order: Order) => sum + Number(order.total_amount),
          0
        );
        setTotalRevenue(total);

        // Count by order status
        const counts: StatusCount = {};
        data.forEach((order: Order) => {
          counts[order.status] = (counts[order.status] || 0) + 1;
        });
        setStatusCounts(counts);

        setFilteredOrders(data);
      });
  }, []);

  const refreshCategories = async () => {
    setCategoryError(null);
    const res = await authedFetch(`${import.meta.env.VITE_API_URL}/api/categories/all/`);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setCategoryError(data?.error || "Failed to load categories");
      setCategories([]);
      return;
    }
    setCategories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    ensureCsrfCookie().then(refreshCategories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    setCategoryBusy(true);
    setCategoryError(null);
    try {
      const res = await authedFetch(`${import.meta.env.VITE_API_URL}/api/categories/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setCategoryError(data?.error || "Failed to add category");
        return;
      }
      setNewCategoryName("");
      await refreshCategories();
    } finally {
      setCategoryBusy(false);
    }
  };

  const handleToggleCategory = async (id: number) => {
    setCategoryBusy(true);
    setCategoryError(null);
    try {
      const res = await authedFetch(
        `${import.meta.env.VITE_API_URL}/api/categories/toggle/${id}/`,
        { method: "PATCH" }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setCategoryError(data?.error || "Failed to update category");
        return;
      }
      await refreshCategories();
    } finally {
      setCategoryBusy(false);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setFilteredOrders(orders);
      return;
    }
    const lower = search.trim().toLowerCase();
    setFilteredOrders(
      orders.filter(
        (order) =>
          order.id.toString().includes(lower) ||
          order.status.toLowerCase().includes(lower)
      )
    );
  }, [search, orders]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <>
      <DashboardHeader title="Owner Dashboard" />
      <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Owner Dashboard</h2>
        <input
          type="text"
          placeholder="Search by order # or status"
          value={search}
          onChange={handleSearchChange}
          className="form-control w-auto"
        />

        <a href="/menu-manager" className="btn btn-outline-dark">
            Manage Menu
        </a>

        <a href="/staff" className="btn btn-outline-dark px-1">
            Manage Staff
        </a>
      </div>

      <div style={{marginBottom: '1rem'}}>
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowCategories((prev) => !prev)}
        >
          {showCategories ? "Hide" : "Show"} Categories
        </button>
      </div>

      {showCategories && (
        <div className="card p-3 mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="mb-0">Categories</h4>
            <div className="d-flex gap-2 align-items-center">
              <input
                className="form-control"
                style={{ minWidth: 240 }}
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={categoryBusy}
              />
              <button
                className="btn btn-dark"
                type="button"
                onClick={handleAddCategory}
                disabled={categoryBusy || !newCategoryName.trim()}
              >
                Add
              </button>
            </div>
          </div>

          {categoryError ? (
            <div className="alert alert-danger mt-3 mb-0">{categoryError}</div>
          ) : null}

          <div className="mt-3">
            {categories.length === 0 ? (
              <div className="text-muted">No categories found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Name</th>
                      <th style={{ width: 140 }}>Status</th>
                      <th style={{ width: 160 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>
                          {c.is_active ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-secondary">Inactive</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn btn-sm ${
                              c.is_active ? "btn-outline-danger" : "btn-outline-success"
                            }`}
                            disabled={categoryBusy}
                            onClick={() => handleToggleCategory(c.id)}
                          >
                            {c.is_active ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

        <h4>Total Revenue: ₹{totalRevenue}</h4>
        <div className="mb-3">
            <strong>Order Status Count:</strong>
            <ul style={{ display: "flex", gap: "1.5rem", listStyle: "none", paddingLeft: 0 }}>
            {Object.entries(statusCounts).map(([status, count]) => (
                <li key={status}>
                <span className="badge bg-info text-dark">{status}</span> ({count})
                </li>
            ))}
            </ul>
        </div>
      <div className="mt-3">
        {filteredOrders.length === 0 ? (
          <div className="alert alert-warning">No orders found.</div>
        ) : (
          <ul className="list-group">
            {filteredOrders.map((order) => (
              <li
                key={order.id}
                className="list-group-item d-flex justify-content-between align-items-center"
                onClick={() => handleOrderClick(order)}
                style={{ cursor: "pointer" }}
              >
                <span>
                  <strong>Order #{order.id}</strong>{" "}
                  — ₹{order.total_amount}{" "}
                  <span
                    className={`badge ms-2 ${
                      order.status === "pending"
                        ? "bg-warning"
                        : order.status === "accepted"
                        ? "bg-secondary"
                        : order.status === "preparing"
                        ? "bg-primary"
                        : order.status === "served"
                        ? "bg-info"
                        : order.status === "paid"
                        ? "bg-success"
                        : "bg-dark"
                    }`}
                  >
                    {order.status}
                  </span>
                  {order.table && (
                    <span className="ms-2 text-muted">Table: {order.table}</span>
                  )}
                </span>
                <span className="text-muted small">
                  {order.created_at &&
                    new Date(order.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Simple Modal for Order Details */}
      {selectedOrder && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{
            background: "rgba(0,0,0,0.3)",
            zIndex: 1000,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onClick={handleCloseModal}
        >
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 450, marginTop: 60 }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Order Details (#{selectedOrder.id})
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Status: <span className="badge bg-secondary">{selectedOrder.status}</span></p>
                <p>Total Amount: <strong>₹{selectedOrder.total_amount}</strong></p>
                {selectedOrder.table && <p>Table: {selectedOrder.table}</p>}
                {selectedOrder.created_at && (
                  <p>
                    Created At: <span className="text-muted">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                  </p>
                )}
                {/* Add more order details if possible */}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      <DashboardFooter />
    </>
  );
}