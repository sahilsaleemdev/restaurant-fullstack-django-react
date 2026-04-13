import { useEffect, useState } from "react";

// Adjust type as needed
type Order = {
  id: number;
  status: string;
  total_amount: number | string;
  created_at: string;
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "In Preparation",
  served: "Served",
  paid: "Paid",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  completed: "Completed",
};

function MyOrders({
  tableId,
  currentOrderId,
}: {
  tableId: number;
  currentOrderId?: number | null;
}) {
  const [myOrder, setMyOrder] = useState<Order | null>(null);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatINR = (amount: number | string) => {
    const num = typeof amount === "number" ? amount : Number(amount);
    if (Number.isNaN(num)) return `₹${amount}`;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDateTime = (value: string) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? value
      : d.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const badgeClassForStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning text-dark";
      case "accepted":
        return "bg-primary";
      case "preparing":
        return "bg-info text-dark";
      case "served":
        return "bg-success";
      case "cancelled":
      case "canceled":
        return "bg-danger";
      case "paid":
        return "bg-dark";
      case "completed":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  // New: simple, unobtrusive reload option
  const [refreshing, setRefreshing] = useState(false);
  const refreshOrders = () => {
    setRefreshing(true);
    // Sets random state so that useEffect re-runs (useful UX for self-refresh)
    setTimeout(() => setRefreshing(false), 600); // minor delay for spinner
    fetchOrders(true);
  };

  // Make fetchOrders available for both effect and refresh click
  const fetchOrders = async (noLoading = false) => {
    try {
      if (!noLoading) setLoading(true);
      setError(null);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/table/${tableId}/orders/`
      );
      let data: Order[] = [];
      if (res.ok) {
        data = await res.json();
      } else {
        setError(`Failed to load orders (HTTP ${res.status}).`);
      }

      const activeStatuses = new Set([
        "pending",
        "accepted",
        "preparing",
        "served",
      ]);
      let current: Order | undefined | null = null;

      if (currentOrderId != null) {
        current = data.find((order) => order.id === currentOrderId) ?? null;
      }

      if (!current) {
        current =
          data.find((order) => activeStatuses.has(order.status)) ?? null;
      }

      setMyOrder(current);

      const prev = current
        ? data.filter((order) => order.id !== current.id)
        : data;
      setPreviousOrders(prev);
    } catch (e) {
      setMyOrder(null);
      setPreviousOrders([]);
      setError("Could not load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tableId) {
      setMyOrder(null);
      setPreviousOrders([]);
      setError(null);
      return;
    }
    fetchOrders();
    // eslint-disable-next-line
  }, [tableId, currentOrderId]);

  return (
    <div className="mt-5" style={{ marginTop: 40 }}>
      <div className="card shadow-sm" style={{marginBottom: 32, padding: "32px 20px"}}>
        <div className="card-body" style={{ padding: "32px 24px", paddingBottom: 0, minHeight: 320 }}>
          <div
            className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2"
            style={{ marginBottom: 32 }}
          >
            <div style={{ width: "100%" }}>
              <h4
                className="mb-3"
                style={{
                  textAlign: "center",
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  fontSize: "2.2rem",
                  marginBottom: 16,
                }}
              >
                Your Orders
              </h4>
              <div className="text-muted small" style={{ textAlign: "center", fontSize: "1.15em" }}>
                Table <strong>#{tableId}</strong>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 justify-content-center w-100 mt-3 mb-2">
              <button
                className="btn btn-outline-primary btn-lg"
                title="Refresh"
                style={{
                  minWidth: 110,
                  fontSize: "1.04em",
                  padding: "0.62rem 1.2rem",
                  borderRadius: 10,
                }}
                onClick={refreshOrders}
                disabled={loading || refreshing}
              >
                {loading || refreshing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />{" "}
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-repeat" /> Refresh
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="alert alert-danger mt-3 mb-4 py-3 text-center"
              style={{ fontSize: "1.07em" }}
            >
              {error}
            </div>
          )}

          {/* Show current user's order on top */}
          {!loading && myOrder ? (
            <div
              className="card border-primary mb-4 shadow-sm"
              style={{
                borderWidth: 2,
                marginTop: 8,
                marginBottom: 32,
                padding: 24,
                borderRadius: 12,
                boxShadow: "0 2px 10px #e3ecff60",
              }}
            >
              <div
                className="card-header bg-primary text-white d-flex justify-content-between align-items-center"
                style={{
                  fontWeight: 500,
                  padding: "1rem 1.6rem",
                  borderRadius: 10,
                  fontSize: "1.16em",
                }}
              >
                <span className="d-flex align-items-center gap-1">
                  <i className="bi bi-bag me-1" />
                  Current Order
                </span>
                <span
                  className={`badge ${badgeClassForStatus(myOrder.status)} text-uppercase px-2 py-1`}
                  style={{ fontSize: "1.04em", padding: "0.4em 1em" }}
                >
                  {statusLabels[myOrder.status] || myOrder.status}
                </span>
              </div>
              <div className="card-body pt-4" style={{ padding: "16px 1.6rem" }}>
                <div className="row align-items-center gy-3">
                  <div className="col">
                    <h5 className="card-title mb-3" style={{ fontSize: "1.25em", fontWeight: 500 }}>
                      Order #{myOrder.id}
                    </h5>
                    <div className="text-muted small" style={{ fontSize: "1.08em" }}>
                      {formatDateTime(myOrder.created_at)}
                    </div>
                  </div>
                  <div className="col-auto text-end">
                    <div className="text-muted small" style={{ fontSize: "1.04em" }}>
                      Total
                    </div>
                    <div className="fw-bold fs-4" style={{ fontWeight: 700, fontSize: "1.35em" }}>
                      {formatINR(myOrder.total_amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !loading ? (
            <div
              className="alert alert-light border mb-4 py-3 text-center"
              style={{ fontSize: "1.1em", marginTop: 32 }}
            >
              <i className="bi bi-exclamation-circle me-1" />
              No current order.
            </div>
          ) : null}

          {/* Previous Orders section */}
          <div className="mb-3 mt-4">
            <h6 className="fw-bold mb-3" style={{ fontSize: "1.16em", paddingLeft: 1 }}>
              Past Orders
              <span className="mx-2 text-muted small" style={{ fontSize: "0.98em" }}>
                ({previousOrders.length})
              </span>
            </h6>
            {!loading && previousOrders.length > 0 ? (
              <div style={{ maxHeight: 320, overflowY: "auto", padding: "5px 2px" }}>
                <ul className="list-group list-group-flush">
                  {previousOrders.map((order) => (
                    <li
                      className="list-group-item d-flex justify-content-between align-items-center gap-3 py-3 px-3"
                      style={{
                        borderLeft: `5px solid #afcced`,
                        borderRadius: 9,
                        backgroundColor: "#f7faff",
                        marginBottom: 13,
                        boxShadow: "0 2px 8px #d6e5f845"
                      }}
                      key={order.id}
                    >
                      <div>
                        <div className="fw-semibold" style={{ fontSize: "1.11em" }}>
                          Order #{order.id}
                        </div>
                        <div className="text-muted small" style={{ fontSize: "0.99em" }}>
                          {formatDateTime(order.created_at)}
                        </div>
                      </div>
                      <div className="text-end">
                        <span
                          className={`badge ${badgeClassForStatus(order.status)} text-uppercase px-3 py-2`}
                          style={{ fontSize: "1em", marginBottom: 3 }}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                        <div className="fw-semibold mt-2" style={{ fontSize: "1.09em" }}>
                          {formatINR(order.total_amount)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : !loading ? (
              <div
                className="alert alert-secondary py-3 mb-0 text-center"
                style={{ fontSize: "1.1em", marginTop: 8 }}
              >
                No previous orders.
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {/* Add subtle divider and help at bottom */}
      <div
        className="text-center mt-4 text-muted small"
        style={{ fontSize: "1.09em", padding: "0 0 1.5rem 0", marginBottom: "0" }}
      >
        <i className="bi bi-info-circle me-1" />
        Tip: Click <strong>Refresh</strong> if you just placed an order.
      </div>
    </div>
  );
}

export default function MyOrdersWrapper({
  tableId,
  currentOrderId,
}: {
  tableId: number | null;
  currentOrderId?: number | null;
}) {
  return (
    <>
      {tableId ? (
        <MyOrders tableId={tableId} currentOrderId={currentOrderId ?? null} />
      ) : (
        <div className="text-center mt-5 text-muted fs-5">
          Please select a table to view your orders.
        </div>
      )}
    </>
  );
}