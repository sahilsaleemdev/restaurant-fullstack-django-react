import { useEffect, useState } from "react";
import Menu from "./components/Menu";
import type { MenuItem, CartItem } from "./types/types";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import OrderStatusModal from "./components/OrderStatusModal";
import MyOrders from "./components/MyOrders";
import { useUi } from "./components/ui/UiProvider";

// Fixed endpoint: should be /api/start-order/ (not /api/start-order/:1)
function App() {
  const ui = useUi();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [tableId, setTableId] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false); 
  

  useEffect(() => {
    fetch("http://localhost:8000/api/menu/")
      .then((res) => res.json())
      .then((data) => {
        console.log("API RESPONSE:", data);
        setMenu(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === item.id);

      if (exist) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Add increase, decrease, remove functions
  const increase = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrease = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const remove = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      const res = await fetch(
        `http://localhost:8000/api/order/${orderId}/`
      );
      const data = await res.json();

      setCurrentOrder(data);   // 🔥 store full order
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    fetch("http://localhost:8000/api/tables/")
      .then((res) => res.json())
      .then((data) => setTables(data));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/categories/")
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);
  

  useEffect(() => {
    const storedTable = localStorage.getItem("tableId");
  
    if (storedTable) {
      setTableId(Number(storedTable));
    }
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async (selectedTable: number | "") => {
    if (selectedTable === "") {
      ui.toast({ kind: "warning", title: "Select a table", message: "Please choose your table before placing an order." });
      return;
    }

    // Keep App state in sync with CartDrawer selection
    setTableId(selectedTable);
    localStorage.setItem("tableId", String(selectedTable));

    if (cart.length === 0) {
      ui.toast({ kind: "info", title: "Cart is empty", message: "Add at least one item to place an order." });
      return;
    }

    if (orderPlaced) {
      ui.toast({ kind: "warning", title: "Order already placed", message: "You can place another order after cancelling or completing the current one." });
      return;
    }

    try {
      // ✅ 1. Create order
      const res = await fetch(
        "http://localhost:8000/api/start-order/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ table_id: selectedTable }),
        }
      );

      const data = await res.json();
      const newOrderId = data.id;

      // ✅ 2. Send ALL cart items
      for (const item of cart) {
        await fetch("http://localhost:8000/api/add-item/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            order_id: newOrderId,
            item_id: item.id,
            quantity: item.quantity, 
          }),
        });
      }

      // ✅ 3. Fetch full order
      const orderRes = await fetch(
        `http://localhost:8000/api/order/${newOrderId}/`
      );

      const orderData = await orderRes.json();

      setCurrentOrder(orderData);
      setOrderId(newOrderId);

      setShowOrderModal(true);

      setCart([]);
      setOrderPlaced(true);

    } catch (error) {
      console.error(error);
      ui.toast({ kind: "error", title: "Order failed", message: "Something went wrong while placing your order." });
    } 
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;

    const res = await fetch(
      `http://localhost:8000/api/cancel-order/${currentOrder.id}/`,
      { method: "POST" }
    );

    const data = await res.json();

    if (!res.ok) {
      ui.toast({ kind: "error", title: "Cancel failed", message: data?.error || "Unable to cancel this order." });
      return;
    }

    ui.toast({ kind: "success", title: "Order cancelled", message: "Your order has been cancelled." });

    setCurrentOrder(null);
    setOrderId(null);
    setCart([]);
    setShowOrderModal(false);
    setOrderPlaced(false); // Allow a new order after cancelling
  };

  return (
    <div className="container-fluid mt-4 px-0">

      <Header
        cart={cart}
        setCartOpen={setCartOpen}
        openOrderModal={() => {
          if (!currentOrder) {
            ui.toast({ kind: "info", title: "No active order", message: "Place an order first to track it here." });
            return;
          }
          setShowOrderModal(true);
        }}
      />

      <Hero />

      <div className="row">
        <div className="col-12">
          <h2 className="text-center py-4">Menu</h2>

          <div className="mb-4 text-center">

            <button
              className={`btn me-2 ${selectedCategory === null ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`btn me-2 ${
                  selectedCategory === cat.id ? "btn-dark" : "btn-outline-dark"
                }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}

          </div>

          <div className="mb-3 text-center">
            <select
              className="form-select d-inline-block w-auto border border-primary text-dark"
              style={{ boxShadow: "none" }}
              onChange={(e) => setTableId(Number(e.target.value))}
            >
              <option value="">Select Table</option>

              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.table_number}
                </option>
              ))}
            </select>
          </div>

          {/* Always show menu */}
          <Menu
            menu={menu}
            addToCart={addToCart}
            selectedCategory={selectedCategory}
          />
        </div>

        <MyOrders tableId={tableId} currentOrderId={currentOrder?.id ?? null} />

        {cartOpen && (
          <CartDrawer
            cart={cart}
            total={total}
            placeOrder={placeOrder}
            increase={increase}
            decrease={decrease}
            remove={remove}
            close={() => setCartOpen(false)}
            // Disable placeOrder button if order placed
            disabled={orderPlaced}
          />
        )}
      </div>

      {showOrderModal && currentOrder && (
        <OrderStatusModal
          order={currentOrder}
          close={() => setShowOrderModal(false)}
          cancelOrder={handleCancelOrder}
        />
      )}

      <Footer/>
    </div>
  );
}

export default App;
