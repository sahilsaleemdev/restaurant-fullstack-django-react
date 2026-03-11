import { useEffect, useState } from "react";

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

export default function OwnerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [statusCounts, setStatusCounts] = useState<StatusCount>({});
  const [search, setSearch] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/all-orders/", {
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
  );
}