import { useEffect, useState } from "react";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import type { MenuItem, CartItem } from "./types/types";

// Fixed endpoint: should be /api/start-order/ (not /api/start-order/:1)
function App() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [loading,setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [tableId, setTableId] = useState<number | null>(null);

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


  const increase = (id: number) => {
    setCart((prev) => {
      return prev.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      );
    });
  };

  const decrease = (id: number) => {
    setCart((prev) => {
      return prev.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const remove = (id: number) => {
    setCart((prev) => {
      return prev.filter((i) => i.id !== id);
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);




  const placeOrder = async () => {
    if (!tableId) {
      alert("Select table");
      return;
    }
  
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
  
    try {
      setLoading(true);
  
      // ✅ 1. Create order
      const res = await fetch(
        "http://localhost:8000/api/start-order/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ table_id: tableId }),
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
  
      alert("Order placed successfully");
  
      setCart([]);
  
    } catch (error) {
      console.error(error);
      alert("Error placing order");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Restaurant App</h1>
  
      <div className="row">

        

        <div className="col-md-8">
          <h2>Menu</h2>

          <select
            className="form-select mb-3"
            onChange={(e) => setTableId(Number(e.target.value))}
          >
            <option value="">Select Table</option>

            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                Table {table.table_number}
              </option>
            ))}
          </select>

          {!currentOrder && (
              <Menu menu={menu} addToCart={addToCart} />
          )}
        </div>

        {currentOrder && (
          <div className="card p-3 mb-3">
            <h4>Your Order</h4>
            <p>Order #{currentOrder.id}</p>

            <span className="badge bg-primary mb-2">
              {currentOrder.status}
            </span>

            {currentOrder.items.map((item: any) => (
              <div key={item.id}>
                {item.menu_item.name} × {item.quantity}
              </div>
            ))}

            <h5>Total: ₹{currentOrder.total_amount}</h5>

            <button
                className="btn btn-danger mt-2"
                onClick={async () => {
                  const res = await fetch(
                    `http://localhost:8000/api/cancel-order/${currentOrder.id}/`,
                    { method: "POST" }
                  );

                  const data = await res.json();

                  if (!res.ok) {
                    alert(data.error); 
                    return;
                  }

                  alert("Order cancelled");

                  setCurrentOrder(null);
                  setOrderId(null);
                  setCart([]);
                }}
              >
                Cancel Order
              </button>
          </div>

          
        )}
  
        
        <div className="col-md-4">
          <Cart
            cart={cart}
            increase={increase}
            decrease={decrease}
            remove={remove}
            total={total}
            placeOrder={placeOrder}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
