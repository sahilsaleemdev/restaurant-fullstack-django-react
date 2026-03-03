import type { MenuItem } from "../types/types";
import MenuItemCard from "./MenuItemCard";

type Props = {
  menu?: MenuItem[];
  addToCart: (item: MenuItem) => void;
};

export default function Menu({ menu, addToCart }: Props) {
  if (!menu || menu.length === 0) {
    return <p>Loading menu...</p>;
  }

  return (
    <div style={{display:"flex", alignItems:"center" , fontFamily:"sans-serif",justifyContent:"space-evenly"}}>
      {menu.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          addToCart={addToCart}
        />
      ))}
    </div>
  );
}