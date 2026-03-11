import type { MenuItem } from "../types/types";
import MenuItemCard from "./MenuItemCard";

type Props = {
  menu?: MenuItem[];
  addToCart: (item: MenuItem) => void;
  selectedCategory: number | null;
};

export default function Menu({ menu, addToCart, selectedCategory }: Props) {
  if (!menu || menu.length === 0) {
    return <p>Loading menu...</p>;
  }

  return (
    <div
      id="menu"
      className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3"
    >
      {menu
        .filter((item) =>
          selectedCategory
            ? item.category?.id === selectedCategory
            : true
        )
        .map((item) => (
          <div
            className="col d-flex justify-content-center"
            key={item.id}
          >
            <MenuItemCard item={item} addToCart={addToCart} />
          </div>
        ))}
    </div>
  );}
