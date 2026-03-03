export type MenuItem = {
    id: number;
    name: string;
    price: number;
    image: string | null;
  };
  
  export type CartItem = MenuItem & {
    quantity: number;
  };
  