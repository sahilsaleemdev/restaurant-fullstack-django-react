import type { CartItem } from "../types/types";

type Props = {
  cart: CartItem[];
  total: number;
  placeOrder: () => void;
  close: () => void;
  increase: (id: number) => void;
  decrease: (id: number) => void;
  remove: (id: number) => void;
};

function CartDrawer({ cart, total, placeOrder, close, increase, decrease, remove }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "350px",
        height: "100%",
        background: "white",
        boxShadow: "-2px 0 10px rgba(0,0,0,0.2)",
        padding: "20px",
        zIndex: 1000
      }}
    >
      <h4>🛒 Cart</h4>
      <button
        className="btn btn-sm btn-danger mb-3"
        onClick={close}
      >
        Close
      </button>

      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        cart.map((item) => (
          <div key={item.id} className="mb-3 border-bottom pb-2">
            <strong>{item.name}</strong>
            <div className="d-flex align-items-center gap-2 mt-1">
              <button
                className="btn btn-sm btn-secondary"
                type="button"
                onClick={() => decrease(item.id)}
              >-</button>
              <span>{item.quantity}</span>
              <button
                className="btn btn-sm btn-secondary"
                type="button"
                onClick={() => increase(item.id)}
              >+</button>
            </div>
            <p>
              ₹{item.price} × {item.quantity}
            </p>
            <button
              className="btn btn-danger btn-sm mt-1"
              type="button"
              onClick={() => remove(item.id)}
            >
              Remove
            </button>
          </div>
        ))
      )}

      <h5>Total: ₹{total}</h5>

      <button
        className="btn btn-dark w-100"
        onClick={placeOrder}
        disabled={cart.length === 0}
        type="button"
      >
        Place Order
      </button>
    </div>
  );
}

export default CartDrawer;