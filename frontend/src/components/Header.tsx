import { Link } from "react-router-dom";

type Props = {
  cart: any[];
  setCartOpen: (value: boolean) => void;
  openOrderModal: () => void;
};

function Header({ cart, setCartOpen, openOrderModal }: Props) {
  return (
    <nav className="navbar navbar-light bg-white navbar-expand-lg border-bottom ">
      <div className="container">
        <Link className="navbar-brand" to="/">
          🍽 Restaurant
        </Link>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-warning"
            onClick={() => setCartOpen(true)}
          >
            🛒 Cart ({cart.length})
          </button>

          <button
            className="btn btn-outline-dark"
            onClick={openOrderModal}
          >
            Check Order
          </button>

          <Link className="btn btn-outline-dark" to="/">
            Menu
          </Link>
          <Link className="btn btn-outline-dark" to="/login">
            Staff Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Header;