export type MenuItem = {
  id: number;
  name: string;
  price: number;
  image: string | null;
  // from API: nested category { id, name }
  category?: {
    id: number;
    name: string;
  };
};

export type CartItem = MenuItem & {
  quantity: number;
};
