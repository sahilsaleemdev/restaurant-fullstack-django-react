import { useEffect, useState } from "react";

// Adjust type as needed
type Order = {
  id: number;
  status: string;
  total_amount: number | string;
  created_at: string;
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
    // Keep rupees formatting consistent and avoid noisy decimals for typical totals.
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDateTime = (value: string) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  };

  const badgeClassForStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning";
      case "accepted":
        return "bg-primary";
      case "preparing":
        return "bg-info";
      case "served":
        return "bg-success";
      case "cancelled":
        return "bg-danger";
      case "canceled":
        return "bg-danger";
      case "paid":
        return "bg-dark";
      // In case old data exists with non-standard status strings.
      case "completed":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  useEffect(() => {
    if (!tableId) {
      setMyOrder(null);
      setPreviousOrders([]);
      setError(null);
      return;
    }

    // Fetch all orders for this table
    const controller = new AbortController();

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:8000/api/table/${tableId}/orders/`, {
          signal: controller.signal,
        });
        let data: Order[] = [];
        if (res.ok) {
          data = await res.json();
        } else {
          setError(`Failed to load orders (HTTP ${res.status}).`);
        }

        // Backend defines "active"/in-progress statuses explicitly.
        // Pick the latest active order (by created_at desc from the backend).
        const activeStatuses = new Set([
          "pending",
          "accepted",
          "preparing",
          "served",
        ]);
        let current: Order | undefined | null = null;

        // Prefer the order id chosen by the main flow (`App.tsx`), so the UI
        // doesn't temporarily disagree while an order is being placed.
        if (currentOrderId != null) {
          current = data.find((order) => order.id === currentOrderId) ?? null;
        }

        // Fallback: infer from backend status.
        if (!current) {
          current = data.find((order) => activeStatuses.has(order.status)) ?? null;
        }

        setMyOrder(current);

        const prev = current
          ? data.filter(order => order.id !== current.id)
          : data;
        setPreviousOrders(prev);
      } catch (e) {
        // Ignore aborts caused by unmount/tableId change.
        if (e instanceof DOMException && e.name === "AbortError") {
          return;
        }
        setMyOrder(null);
        setPreviousOrders([]);
        setError("Could not load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    return () => controller.abort();
  }, [tableId, currentOrderId]);

  return (
    <div className="mt-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
            <div>
              <h4 className="mb-1">Orders</h4>
              <div className="text-muted small">For table #{tableId}</div>
            </div>
            {loading && (
              <div className="d-flex align-items-center gap-2 text-muted small">
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                Loading...
              </div>
            )}
          </div>

          {error && <div className="alert alert-danger mb-3 py-2">{error}</div>}

          {/* Show current user's order (now on top) */}
          {!loading && myOrder ? (
            <div className="card border-primary mb-3">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span>Current Order</span>
                <span className={`badge ${badgeClassForStatus(myOrder.status)} text-uppercase`}>
                  {myOrder.status}
                </span>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <h5 className="card-title mb-1">Order #{myOrder.id}</h5>
                    <div className="text-muted small">
                      {formatDateTime(myOrder.created_at)}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted small">Total</div>
                    <div className="fw-bold fs-5">{formatINR(myOrder.total_amount)}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : !loading ? (
            <div className="alert alert-secondary mb-3 py-2">No current order.</div>
          ) : null}

          {/* Previous Orders - now below current order */}
          {!loading && previousOrders.length > 0 ? (
            <div className="card border-0">
              <div className="card-header bg-white">
                <h6 className="mb-0">Previous Orders</h6>
              </div>
              <ul className="list-group list-group-flush">
                {previousOrders.map((order) => (
                  <li
                    className="list-group-item d-flex justify-content-between align-items-center gap-3"
                    key={order.id}
                  >
                    <div>
                      <div className="fw-semibold">Order #{order.id}</div>
                      <div className="text-muted small">{formatDateTime(order.created_at)}</div>
                    </div>
                    <div className="text-end">
                      <div>
                        <span
                          className={`badge ${badgeClassForStatus(order.status)} text-uppercase`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="fw-semibold mt-1">{formatINR(order.total_amount)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : !loading ? (
            <div className="text-muted">No previous orders.</div>
          ) : null}
        </div>
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
      {tableId && (
        <MyOrders tableId={tableId} currentOrderId={currentOrderId ?? null} />
      )}
    </>
  );
}