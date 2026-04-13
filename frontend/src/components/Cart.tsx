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

/*
 * Why might increase, decrease, or remove buttons not work?
 * 
 * 1. The parent component (which renders <Cart />) must pass the correct 
 *    'increase', 'decrease', and 'remove' functions that actually update the cart state.
 * 2. If these props are not properly hooked to state update functions, the UI will not update.
 * 3. Make sure that the parent component is not passing in empty/no-op functions.
 * 4. Make sure that any state update triggers a re-render (e.g., using React's useState).
 * 5. There may also be issues if props are not correctly cased (e.g., 'Increase' vs 'increase').
 * 6. In this component, the handlers are passed correctly to the buttons.
 * 7. Also check for overlaying elements or disabled buttons in the parent component, 
 *    which could prevent click events from reaching these handlers.
 * 
 * This component assumes that clicking the buttons will call the corresponding functions.
 */

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
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => decrease(item.id)}
              type="button"
            >-</button>
            <span>{item.quantity}</span>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => increase(item.id)}
              type="button"
            >+</button>
          </div>
          <button
            className="btn btn-danger btn-sm mt-2"
            onClick={() => remove(item.id)}
            type="button"
          >
            Remove
          </button>
        </div>
      ))}

      <h5>Total: ₹{total}</h5>

      <button
        className="btn btn-dark w-100"
        onClick={placeOrder}
        disabled={loading}
        type="button"
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
}

export default Cart;
