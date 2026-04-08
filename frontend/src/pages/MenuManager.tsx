import { useEffect, useState } from "react";
import { useUi } from "../components/ui/UiProvider";

function MenuManager() {
  const ui = useUi();
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/menu/")
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/categories/")
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const addItem = async () => {
    if (!name.trim() || !price.trim() || !category) {
      ui.toast({
        kind: "warning",
        title: "Missing details",
        message: "Please fill name, price, and category.",
      });
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
        ui.toast({ kind: "success", title: "Added", message: "Menu item added successfully." });
      } else {
        ui.toast({ kind: "error", title: "Add failed", message: data?.error || "Unable to add item." });
      }
    } else {
      ui.toast({
        kind: res.ok ? "success" : "error",
        title: res.ok ? "Added" : "Error",
        message: res.ok ? "Menu item added successfully." : `Request failed (${res.status}).`,
      });
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

    const newName = await ui.prompt({
      title: "Edit item name",
      message: "Enter a new name.",
      defaultValue: item.name,
      confirmText: "Save",
    });
    const newPrice = await ui.prompt({
      title: "Edit item price",
      message: "Enter a new price.",
      defaultValue: String(item.price),
      confirmText: "Save",
    });
  
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
    ui.toast({ kind: "success", title: "Updated", message: "Menu item updated." });
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
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
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
          {item.category && (
            <p className="text-muted mb-1">
              Category: {item.category.name}
            </p>
          )}

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