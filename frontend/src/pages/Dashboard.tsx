import { useEffect, useState } from "react";



function Dashboard() {
  
const [user, setUser] = useState<any>(null);
const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/orders/")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/check-auth/", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);
  

  const handleLogout = async () => {
    await fetch("http://localhost:8000/api/logout/", {
      method: "POST",
      credentials: "include",
    });
  
    window.location.href = "/login";
  };
  


  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/orders/");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`http://localhost:8000/api/update-status/${id}/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
  
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="container mt-4">
    <div className="d-flex justify-content-between align-items-center">
  <h2>Chef Dashboard</h2>

    <button className="btn btn-danger" onClick={handleLogout}>
      Logout
    </button>
  </div>


    <h5>
      Welcome, {user?.username}
    </h5>


    <div className="row">
      {orders.map((order) => (
        <div key={order.id} className="col-sm-6 col-md-4 col-lg-3">
          
          <div className="card p-3 h-100">
            <h5>Order #{order.id}</h5>

            <span
                    className={`badge mb-2 ${
                    order.status === "pending"
                    ? "bg-warning"
                    : order.status === "accepted"
                    ? "bg-secondary"
                    : order.status === "preparing"
                    ? "bg-primary"
                    : order.status === "served"
                    ? "bg-info"
                    : order.status === "paid"
                    ? "bg-success"
                    : "bg-dark"
                }`}
                >
                {order.status}
            </span>

            
  
            {order.items.map((item: any) => (
              <p key={item.id}>
                {item.menu_item.name} × {item.quantity}
              </p>
            ))}
  
  <div className="d-flex flex-column gap-2 mt-2">

<button
  className="btn btn-warning"
  onClick={() => updateStatus(order.id, "accepted")}
>
  Accept
</button>

<button
  className="btn btn-primary"
  onClick={() => updateStatus(order.id, "preparing")}
>
  Preparing
</button>

<button
  className="btn btn-info"
  onClick={() => updateStatus(order.id, "served")}
>
  Serve
</button>

<button
  className="btn btn-success"
  onClick={() => updateStatus(order.id, "paid")}
>
  Complete
</button>

</div>
          </div>
  
        </div>
      ))}
    </div>
  </div>
  );
}

export default Dashboard;