import type { MenuItem } from "../types/types";

type Props = {
  item: MenuItem;
  addToCart: (item: MenuItem) => void;
};

function MenuItemCard({ item, addToCart }: Props) {
  return (
    <div className="card mb-3  ">
  {item.image && (
    <img
      src={`http://localhost:8000${item.image}`}
      className="card-img-top"
      alt={item.name}
      style={{ height: "150px", objectFit: "cover" }}
    />
  )}

  <div className="card-body">
    <h5 className="card-title">{item.name}</h5>
    <p className="card-text">₹{item.price}</p>

    <button
      className="btn btn-dark w-100"
      onClick={() => addToCart(item)}
    >
      Add to Cart
    </button>
  </div>
</div>
  );
}

export default MenuItemCard;
