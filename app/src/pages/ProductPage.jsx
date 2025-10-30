// src/pages/ProductsPage.jsx
import { useEffect, useState } from "react";
import { getProducts } from "../api/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => { getProducts().then(setProducts); }, []);

  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((p) => (
        <div key={p._id} className="border rounded-xl p-4 shadow">
          <img src={p.imageURL} alt={p.name} className="w-full h-48 object-cover rounded" />
          <h2 className="text-lg font-bold mt-2">{p.name}</h2>
          <p className="text-gray-600">Rs. {p.price}</p>
          <button className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded">Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
