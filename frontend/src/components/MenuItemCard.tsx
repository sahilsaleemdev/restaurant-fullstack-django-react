import type { MenuItem } from "../types/types";

type Props = {
  item: MenuItem;
  addToCart: (item: MenuItem) => void;
};

function MenuItemCard({ item, addToCart }: Props) {
  return (
    <div
      className="card h-100 shadow-sm d-flex flex-column align-items-center"
      style={{
        width: "200px",
        minWidth: "200px",
        maxWidth: "200px",
        minHeight: "320px",
        margin: "0 auto"
      }}
    >
      <div
        className="card-img-top bg-light d-flex justify-content-center align-items-center"
        style={{
          height: "150px",
          width: "100%",
          overflow: "hidden",
          borderTopLeftRadius: "0.375rem",
          borderTopRightRadius: "0.375rem",
        }}
      >
        {item.image ? (
          <img
            src={`http://localhost:8000${item.image}`}
            alt={item.name}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              height: "auto",
              width: "auto",
              display: "block",
              objectFit: "contain", 
            }}
          />
        ) : null}
      </div>

      <div className="card-body d-flex flex-column w-100 p-2">
        <h5 className="card-title text-center">{item.name}</h5>
        <p className="text-muted text-center mb-2">₹{item.price}</p>
        <button
          className="btn btn-dark mt-auto w-100"
          onClick={() => addToCart(item)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default MenuItemCard;
