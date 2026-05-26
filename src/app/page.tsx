"use client";

import { useEffect, useState } from "react";

interface Warehouse {
  id: string;
  name: string;
  location: string;
}

interface Inventory {
  id: string;
  totalStock: number;
  reservedStock: number;
  warehouse: Warehouse;
}

interface Product {
  id: string;
  name: string;
  description: string;
  inventories: Inventory[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-xl">
        Loading inventory...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-10 bg-black text-white">
      <h1 className="text-4xl font-bold mb-8">
        Inventory Dashboard
      </h1>

      <div className="grid gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-zinc-900 rounded-xl shadow-md p-6 border border-zinc-700"
          >
            <h2 className="text-2xl font-semibold">
              {product.name}
            </h2>

            <p className="text-gray-300 mb-4">
              {product.description}
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {product.inventories.map((inventory) => (
                <div
                  key={inventory.id}
                  className="border border-zinc-700 rounded-lg p-4 bg-zinc-800"
                >
                  <h3 className="font-bold text-lg">
                    {inventory.warehouse.name}
                  </h3>

                  <p>
                    Location: {inventory.warehouse.location}
                  </p>

                  <p>
                    Total Stock: {inventory.totalStock}
                  </p>

                  <p>
                    Reserved Stock: {inventory.reservedStock}
                  </p>

                  <p>
                    Available Stock:{" "}
                    {inventory.totalStock -
                      inventory.reservedStock}
                  </p>

                  <button
                    className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                    onClick={async () => {
                      const reservationResponse = await fetch("/api/reservations", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          productId: product.id,
                          warehouseId: inventory.warehouse.id,
                          quantity: 1,
                        }),
                     });  

                     const reservationData = await reservationResponse.json();

                    // EXISTING ACTIVE RESERVATION
                    if (reservationData.resumed) {

                      alert("Existing reservation resumed");

                      window.location.href =
                        `/reservations/${reservationData.reservation.id}`;

                      return;
                    }

                    // OTHER ERRORS
                    if (!reservationResponse.ok) {
                      alert(reservationData.message);
                      return;
                    }

                    // SUCCESS
                    window.location.href =
                      `/reservations/${reservationData.reservation.id}`;
                    }}
                  >
                    Reserve 1 Item
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}