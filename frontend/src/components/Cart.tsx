import type { CartItem } from "../types/types";

type Props = {
  cart: CartItem[];
  increase: (id: number) => void;
  decrease: (id: number) => void;
  remove: (id: number) => void;
  total: number;
  placeOrder: () => void;
  loading: boolean;
};

function Cart({ cart, increase, decrease, remove, total, placeOrder, loading }: Props) {
  if (cart.length === 0) {
    return <h2>Cart is empty</h2>;
  }

  return (
    <div className="card p-3">
      <h4>Cart</h4>

      {cart.map((item) => (
        <div key={item.id} className="mb-3 border-bottom pb-2">
          <h6>{item.name}</h6>
          <p>₹{item.price}</p>

          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-secondary" onClick={() => decrease(item.id)}>-</button>
            <span>{item.quantity}</span>
            <button className="btn btn-sm btn-secondary" onClick={() => increase(item.id)}>+</button>
          </div>

          <button className="btn btn-danger btn-sm mt-2" onClick={() => remove(item.id)}>
            Remove
          </button>
        </div>
      ))}

      <h5>Total: ₹{total}</h5>

      <button
        className="btn btn-dark w-100"
        onClick={placeOrder}
        disabled={loading}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
}

export default Cart;
