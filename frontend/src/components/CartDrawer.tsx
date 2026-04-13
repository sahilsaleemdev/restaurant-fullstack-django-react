import type { CartItem } from "../types/types";
import { useRef, useEffect, useState } from "react";

type Props = {
  cart: CartItem[];
  total: number;
  placeOrder: (selectedTable: number | "") => void;
  close: () => void;
  increase: (id: number) => void;
  decrease: (id: number) => void;
  remove: (id: number) => void;
  disabled?: boolean;
  tables?: Table[];
};

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

type Table = { id: number; table_number: number };

function CartDrawer({
  cart,
  total,
  placeOrder,
  close,
  increase,
  decrease,
  remove,
  disabled,
  tables: tablesFromProps,
}: Props) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [selectedTable, setSelectedTable] = useState<number | "">("");
  const [tables, setTables] = useState<Table[]>(tablesFromProps ?? []);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);

  // Close popup if clicking outside (but not on blur)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [close]);

  useEffect(() => {
    if (tablesFromProps && tablesFromProps.length > 0) {
      const sorted = [...tablesFromProps].sort(
        (a, b) => a.table_number - b.table_number
      );
      setTables(sorted);
      if (selectedTable === "") setSelectedTable(sorted[0].id);
      return;
    }

    let cancelled = false;
    setTablesLoading(true);
    setTablesError(null);

    fetch(`${import.meta.env.VITE_API_URL}/api/tables/`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load tables (${res.status})`);
        return res.json();
      })
      .then((data: Table[]) => {
        if (cancelled) return;
        const normalized = Array.isArray(data) ? data : [];
        normalized.sort((a, b) => a.table_number - b.table_number);
        setTables(normalized);

        // If nothing selected yet, default to first table (if available)
        if (selectedTable === "" && normalized.length > 0) {
          setSelectedTable(normalized[0].id);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setTables([]);
        setTablesError(err instanceof Error ? err.message : "Failed to load tables");
      })
      .finally(() => {
        if (cancelled) return;
        setTablesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tablesFromProps, selectedTable]);

  const handlePlaceOrder = () => {
    placeOrder(selectedTable);
  };

  return (
    <div className="cart-modal-overlay" style={{
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(30,30,30,0.33)",
      backdropFilter: "blur(8px)",
      zIndex: 1200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 0.3s, backdrop-filter 0.3s"
    }}>
      <div
        ref={popupRef}
        className="cart-popup"
        style={{
          width: "100%",
          maxWidth: "410px",
          background: "white",
          borderRadius: "18px",
          boxShadow: "0 8px 40px 0 rgba(0,0,0,0.18)",
          overflow: "hidden",
          maxHeight: "calc(100vh - 40px)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInCartPopup 0.33s cubic-bezier(.39,.58,.57,1.0)"
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center border-bottom px-4 py-3"
          style={{ background: "#f7f7f7", position: "sticky", top: 0, zIndex: 1 }}
        >
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <span role="img" aria-label="cart">
              🛒
            </span>
            Cart
          </h4>
          <button
            className="btn-close"
            aria-label="Close"
            style={{ boxShadow: "none" }}
            onClick={close}
          ></button>
        </div>

        <div className="px-4 pt-3 pb-4" style={{ minHeight: "208px", flex: "1 1 auto", overflowY: "auto" }}>
          <div className="mb-3 d-flex align-items-center gap-2">
            <label htmlFor="cart-table-select" className="fw-semibold mb-0">
              Table:
            </label>
            <select
              id="cart-table-select"
              className="form-select"
              style={{ maxWidth: 120, fontWeight: 500 }}
              value={selectedTable}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTable(val === "" ? "" : Number(val));
              }}
              disabled={tablesLoading || tables.length === 0}
            >
              <option value="">
                {tablesLoading ? "Loading..." : "Select Table"}
              </option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.table_number}
                </option>
              ))}
            </select>
            {tablesError ? (
              <span className="text-danger small">{tablesError}</span>
            ) : null}
          </div>
          {cart.length === 0 ? (
            <div className="text-center text-muted py-5" style={{ fontSize: "1.1rem" }}>
              <i className="bi bi-cart-x fs-3 mb-3 d-block"></i>
              Cart is empty
            </div>
          ) : (
            <ul className="list-unstyled mb-0">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="mb-4 pb-3 border-bottom"
                  style={{ animation: "fadeIn 0.3s" }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="fs-5">{item.name}</strong>
                    <button
                      className="btn btn-outline-danger btn-sm px-2 py-0"
                      type="button"
                      title="Remove item"
                      onClick={() => remove(item.id)}
                      tabIndex={0}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="input-group input-group-sm w-auto">
                      <button
                        className="btn btn-outline-secondary px-3"
                        type="button"
                        title="Decrease"
                        aria-label="Decrease"
                        onClick={() => decrease(item.id)}
                        disabled={item.quantity <= 1}
                      >
                        <i className="bi bi-dash" />
                        -
                      </button>
                      <span className="input-group-text bg-white">{item.quantity}</span>
                      <button
                        className="btn btn-outline-secondary px-3"
                        type="button"
                        title="Increase"
                        aria-label="Increase"
                        onClick={() => increase(item.id)}
                      >
                        <i className="bi bi-plus" />
                        +
                      </button>
                    </div>
                    <span className="text-muted small">
                      {formatINR(item.price)} each
                    </span>
                    <span className="fw-semibold">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="cart-footer px-4 py-3 border-top"
          style={{
            background: "white",
            position: "sticky",
            bottom: 0,
            zIndex: 1
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold fs-5">Total</span>
            <span className="fw-bold fs-5">{formatINR(total)}</span>
          </div>
          <button
            className="btn w-100 py-2 fs-5"
            style={{
              background: "#000",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
              opacity:
                disabled || cart.length === 0 || selectedTable === "" ? 0.7 : 1,
              pointerEvents:
                disabled || cart.length === 0 || selectedTable === ""
                  ? "none"
                  : "auto",
              transition: "opacity 0.2s"
            }}
            onClick={handlePlaceOrder}
            disabled={
              disabled ||
              cart.length === 0 ||
              selectedTable === ""
            }
            type="button"
          >
            <i className="bi bi-check-circle me-2" />
            Place Order
          </button>
        </div>

        <style>
          {`
          .cart-popup {
            /* Use default styles plus animation */
          }
          @keyframes slideInCartPopup {
            0% {
              opacity: 0;
              transform: scale(0.94) translateY(42px);
              filter: blur(2px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
              filter: none;
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: none;
            }
          }
          `}
        </style>
      </div>
    </div>
  );
}

export default CartDrawer;