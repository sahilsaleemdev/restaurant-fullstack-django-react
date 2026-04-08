import { useState } from "react";
import { Link } from "react-router-dom";

type Props = {
  cart: any[];
  setCartOpen: (value: boolean) => void;
  openOrderModal: () => void;
};

function Header({ cart, setCartOpen, openOrderModal }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggle = () => setMenuOpen((v) => !v);
  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav
      className="navbar navbar-light bg-white navbar-expand-lg border-bottom"
      style={{
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
        marginTop: "0.25rem",
        marginBottom: "0.25rem",
      }}
    >
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={handleNavClick}>
          🍽 Restaurant
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          aria-controls="main-navbar-nav"
          aria-expanded={menuOpen}
          onClick={handleToggle}
          style={{ border: "none" }}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div
          className={`collapse navbar-collapse justify-content-end ${
            menuOpen ? "show" : ""
          }`}
          id="main-navbar-nav"
        >
          <div className="d-flex flex-lg-row flex-column align-items-lg-center gap-2 mt-3 mt-lg-0">
            <button
              className="btn btn-outline-dark"
              onClick={() => {
                handleNavClick();
                openOrderModal();
              }}
            >
              Check Order
            </button>
            <a
              className="btn btn-outline-dark"
              href="#menu"
              onClick={handleNavClick}
            >
              Menu
            </a>
            <Link
              className="btn btn-outline-dark"
              to="/login"
              onClick={handleNavClick}
            >
              Staff Login
            </Link>
            <button
              className="btn btn-warning"
              onClick={() => {
                setCartOpen(true);
                handleNavClick();
              }}
            >
              🛒 Cart ({cart.length})
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;