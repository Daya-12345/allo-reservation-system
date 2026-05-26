"use client";

import { useEffect, useState } from "react";

import toast from "react-hot-toast";

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
    <main className="min-h-screen p-10 bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white">
      <h1 className="text-5xl font-extrabold mb-10 tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
        Inventory Dashboard
      </h1>

      <div className="grid gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="animate-fadeUp bg-zinc-900/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-zinc-800 hover:border-blue-500 transition-all duration-300 hover:scale-[1.01]"
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
                  className="border border-zinc-700/50 rounded-2xl p-5 bg-zinc-800/60 backdrop-blur-sm hover:bg-zinc-800 transition-all duration-300 shadow-lg"
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

                  <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-medium">
                    Available Stock:{" "}
                    {inventory.totalStock - inventory.reservedStock}
                  </div>

                  <button
                    className="mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105"
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

                      toast.success("Existing reservation resumed");

                      window.location.href =
                        `/reservations/${reservationData.reservation.id}`;

                      return;
                    }

                    // OTHER ERRORS
                    if (!reservationResponse.ok) {
                      toast.error(reservationData.message);
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