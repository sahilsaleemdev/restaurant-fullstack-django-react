import type { CartItem } from "../types/types";
import { useRef, useEffect } from "react";

type Props = {
  cart: CartItem[];
  total: number;
  placeOrder: () => void;
  close: () => void;
  increase: (id: number) => void;
  decrease: (id: number) => void;
  remove: (id: number) => void;
  disabled?: boolean;
};

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function CartDrawer({
  cart,
  total,
  placeOrder,
  close,
  increase,
  decrease,
  remove,
  disabled,
}: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [close]);

  return (
    <div
      ref={drawerRef}
      className="cart-drawer"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "370px",
        height: "100%",
        background: "white",
        boxShadow: "-2px 0 20px 0 rgba(0,0,0,0.15)",
        padding: "0",
        zIndex: 1200,
        overflowY: "auto",
        transition: "box-shadow 0.2s linear",
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

      <div className="px-4 pt-3 pb-4" style={{ minHeight: "calc(100vh - 130px)" }}>
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
          position: "sticky",
          bottom: 0,
          background: "white",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold fs-5">Total</span>
          <span className="fw-bold fs-5">{formatINR(total)}</span>
        </div>
        <button
          className="btn btn-dark w-100 py-2 fs-5"
          onClick={placeOrder}
          disabled={disabled || cart.length === 0}
          type="button"
          style={{
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
            opacity: disabled || cart.length === 0 ? 0.7 : 1,
            pointerEvents: disabled || cart.length === 0 ? "none" : "auto",
            transition: "opacity 0.2s"
          }}
        >
          <i className="bi bi-check-circle me-2" />
          Place Order
        </button>
      </div>
      <style>
        {`
        .cart-drawer {
          animation: slideInCartDrawer 0.28s cubic-bezier(.39,.58,.57,1.0);
        }
        @keyframes slideInCartDrawer {
          0% {
            transform: translateX(120%);
            opacity: 0.7;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
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
  );
}

export default CartDrawer;