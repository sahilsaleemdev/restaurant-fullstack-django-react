import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import DashboardFooter from "../components/DashboardFooter";

// Statuses that can be filtered
const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" }, // Optionally show for "accepted", not requested but allows as per codes above
  { key: "preparing", label: "Preparing" },
  { key: "served", label: "Served" },
  { key: "paid", label: "Completed" }, // consider mapping "paid" to "Completed"
  { key: "canceled", label: "Canceled" },
];

function ChefDashboard() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState(""); // For search input
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]); // Orders filtered by search and status
  const [statusFilter, setStatusFilter] = useState("all"); // Track current status filter
  const csrftoken = getCookie("csrftoken");

  useEffect(() => {
    fetch("http://localhost:8000/api/all-orders/")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setFilteredOrders(data); // initialize filtered list
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/get-csrf/", {
      credentials: "include",
    });
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/check-auth/", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        return res.json();
      })
      .then((data) => {
        // Some backends respond 200 with empty body when not logged in.
        if (data && (data.username || data.role)) setUser(data);
        else window.location.href = "/login";
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  useEffect(() => {
    // Combine search and status filter logic
    let filtered = [...orders];

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "paid") {
        // Special label for completed; match orders with status "paid"
        filtered = filtered.filter((order) => order.status === "paid");
      } else if (statusFilter === "canceled") {
        filtered = filtered.filter((order) => order.status === "canceled");
      } else {
        filtered = filtered.filter((order) => order.status === statusFilter);
      }
    }

    // Apply search filter (if search is non-empty)
    if (search.trim()) {
      const lower = search.trim().toLowerCase();
      filtered = filtered.filter((order) => {
        const matchesOrderId = order.id?.toString().includes(lower);
        const matchesStatus = order.status?.toLowerCase().includes(lower);
        const matchesItem = Array.isArray(order.items)
          ? order.items.some((item: any) =>
              item.menu_item?.name?.toLowerCase().includes(lower)
            )
          : false;
        return matchesOrderId || matchesStatus || matchesItem;
      });
    }

    setFilteredOrders(filtered);
  }, [search, orders, statusFilter]);

  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  }

  const handleLogout = async () => {
    await fetch("http://localhost:8000/api/logout/", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/all-orders/");
      const data = await res.json();
      setOrders(data);
      // Also update filtered orders when refetching all
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`http://localhost:8000/api/update-status/${id}/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken || "",
        },
        body: JSON.stringify({ status }),
      });

      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Search input handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Status filter click handler
  const handleStatusFilter = (filterKey: string) => {
    setStatusFilter(filterKey);
  };

  return (
    <>
      <DashboardHeader title="Chef Dashboard" onLogout={handleLogout} />
      <div className="container mt-2">
        <h5 className="mb-4">Welcome, {user?.username}</h5>
        <div className="mb-3 d-flex align-items-center gap-2">
          <input
            type="text"
            placeholder="Search by order #, status, or item"
            value={search}
            onChange={handleSearchChange}
            className="form-control w-auto"
            style={{ minWidth: "220px" }}
          />
        </div>
        <div className="mb-3">
          <div className="btn-group" role="group" aria-label="Status Filters">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.key}
                className={`btn btn-outline-dark${statusFilter === filter.key ? " active" : ""}`}
                onClick={() => handleStatusFilter(filter.key)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="row">
          {filteredOrders.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-warning">No orders found.</div>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="card p-3 h-100">
                  <h5>Order #{order.id}</h5>
                  <span
                    className={`badge mb-2 ${
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
                        : order.status === "canceled"
                        ? "bg-danger"
                        : "bg-dark"
                    }`}
                  >
                    {/* Show 'Completed' badge if status is paid (for UX clarity) */}
                    {order.status === "paid" ? "Completed" :
                      order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  {order.items.map((item: any) => (
                    <p key={item.id}>
                      {item.menu_item.name} × {item.quantity}
                    </p>
                  ))}
                  <div className="d-flex flex-column gap-2 mt-2">
                    <button
                      className="btn btn-warning"
                      onClick={() => updateStatus(order.id, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => updateStatus(order.id, "preparing")}
                    >
                      Preparing
                    </button>
                    <button
                      className="btn btn-info"
                      onClick={() => updateStatus(order.id, "served")}
                    >
                      Serve
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={() => updateStatus(order.id, "paid")}
                    >
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <DashboardFooter />
    </>
  );
}

export default ChefDashboard;