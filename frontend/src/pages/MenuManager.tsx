import { useEffect, useState } from "react";

function MenuManager() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/menu/")
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);





  const addItem = async () => {
    if (!name.trim() || !price.trim() || !category) {
      alert("Please fill name, price, and category");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", price);
    formData.append("category", category);
    if (image) {
      formData.append("image", image);
    }

    const res = await fetch("http://localhost:8000/api/menu/add/", {
      method: "POST",
      body: formData,
    });

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (res.ok) {
        setItems((prev) => [...prev, data]);
        setName("");
        setPrice("");
        setCategory("");
        setImage(null);
      } else {
        alert(data?.error || JSON.stringify(data));
      }
    } else {
      alert(res.ok ? "Item added" : `Error ${res.status}`);
    }
  };



  const deleteItem = async (id: number) => {

    const res = await fetch(
      `http://localhost:8000/api/menu/delete/${id}/`,
      { method: "DELETE" }
    );
  
    if (res.ok) {
      setItems(items.filter((item) => item.id !== id));
    }
  };


  const toggleItem = async (id: number) => {

    const res = await fetch(
      `http://localhost:8000/api/menu/toggle/${id}/`,
      { method: "PATCH" }
    );
  
    const data = await res.json();
  
    setItems(items.map((item) =>
      item.id === id
        ? { ...item, is_available: data.is_available }
        : item
    ));
  };



  const editItem = async (item: any) => {

    const newName = prompt("New name", item.name);
    const newPrice = prompt("New price", item.price);
  
    if (!newName || !newPrice) return;
  
    const res = await fetch(
      `http://localhost:8000/api/menu/update/${item.id}/`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          price: newPrice,
          category: item.category
        })
      }
    );
  
    const data = await res.json();
  
    setItems(items.map((i) =>
      i.id === item.id ? data : i
    ));
  };
  


  return (
    <div className="container mt-4">

      <h2>Menu Manager</h2>

      {/* ADD ITEM FORM */}
      <div className="card p-3 mb-4">

        <h4>Add Menu Item</h4>

        <input
          className="form-control mb-2"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <select
          className="form-control mb-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select category</option>
          <option value="1">Chicken</option>
          <option value="2">Burger</option>
        </select>

        <input
          type="file"
          className="form-control mb-2"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <button
          className="btn btn-success"
          onClick={addItem}
        >
          Add Item
        </button>

      </div>


      {/* MENU ITEMS LIST */}
      {items.map((item) => (
        <div key={item.id} className="card p-3 mb-3">

          <h5>{item.name}</h5>
          <p>₹{item.price}</p>

          <img
            src={`http://localhost:8000${item.image}`}
            width="120"
          />

          <div className="mt-2">

            <button
                className="btn btn-warning me-2"
                onClick={() => editItem(item)}
                >
                Edit
            </button>

            <button
                className="btn btn-danger me-2"
                onClick={() => deleteItem(item.id)}
                >
                Delete
            </button>

            <button
                className="btn btn-secondary"
                onClick={() => toggleItem(item.id)}
                >
                {item.is_available ? "Disable" : "Enable"}
            </button>

          </div>

        </div>
      ))}

    </div>
  );
}

export default MenuManager;