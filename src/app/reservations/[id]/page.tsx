"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Reservation {
  id: string;
  quantity: number;
  status: string;
  expiresAt: string;

  product: {
    name: string;
    description: string;
  };
}

export default function ReservationPage() {

  const params = useParams();

  const router = useRouter();

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [timeLeft, setTimeLeft] =
    useState("");

  const [error, setError] =
    useState("");

  // FETCH RESERVATION
  useEffect(() => {

    async function fetchReservation() {

      const response = await fetch(
        `/api/reservations/${params.id}`
      );

      const data = await response.json();

      setReservation(data);
    }

    fetchReservation();

  }, [params.id]);

  // COUNTDOWN TIMER
  useEffect(() => {
    if (!reservation) return;

    // STOP TIMER IF CONFIRMED OR CANCELLED
    if (reservation.status !== "PENDING") {
        return;
    }

    const interval = setInterval(async () => {
        const now = new Date().getTime();

        const expiry = new Date(reservation.expiresAt).getTime();

        const distance = expiry - now;

        if (distance <= 0) {

            clearInterval(interval);

            setTimeLeft("Expired");

            // CALL EXPIRE API
            await fetch(
              `/api/reservations/${reservation.id}/expire`,
              {
                method: "POST",
              }
            );

            // UPDATE UI
            setReservation({
              ...reservation,
              status: "EXPIRED",
            });

            toast.error("Reservation expired");

            return;
        }

        const minutes = Math.floor(distance / (1000 * 60));

        const seconds = Math.floor(
        (distance % (1000 * 60)) / 1000
        );

        setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation, router]);

  // LOADING
  if (!reservation) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-3xl font-bold">
          Loading Reservation...
        </div>
      </div>
    );
  }

  // CONFIRM
  async function confirmReservation() {

    if (!reservation?.id) {
      toast.error("Invalid reservation");
      return;
    }

    const response = await fetch(
      `/api/reservations/${reservation.id}/confirm`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message);
      return;
    }

    toast.success(data.message);

    router.push("/");
  }

  // CANCEL / RELEASE
  async function releaseReservation() {

    if (!reservation?.id) {
      toast.error("Invalid reservation");
      return;
    }

    const response = await fetch(
      `/api/reservations/${reservation.id}/release`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message);
      return;
    }

    toast.success(data.message);

    router.push("/");
  }

  return (

    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white p-10">

      <div className="max-w-2xl mx-auto bg-zinc-900/90 backdrop-blur-sm p-10 rounded-3xl border border-zinc-800 shadow-2xl animate-fadeIn">

        <h1 className="text-5xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Reservation Checkout
        </h1>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
        </div>
        )}
        
        <div className="space-y-4">

          <div>
            <p className="text-zinc-400">
              Product
            </p>

            <h2 className="text-2xl font-semibold">
              {reservation.product.name}
            </h2>
          </div>

          <div>
            <p className="text-zinc-400">
              Quantity
            </p>

            <p>
              {reservation.quantity}
            </p>
          </div>

          <div>
            <p className="text-zinc-400 mb-2">
              Status
            </p>

            <span
              className={`px-4 py-1 rounded-full text-sm font-bold ${
                reservation.status === "PENDING"
                  ? "bg-yellow-500 text-black"
                  : reservation.status === "CONFIRMED"
                  ? "bg-green-600 text-white"
                  : reservation.status === "CANCELLED"
                  ? "bg-red-600 text-white"
                  : "bg-gray-600 text-white"
              }`}
            >
              {reservation.status}
            </span>
          </div>

          <div>
            <p className="text-zinc-400">
              Time Remaining
            </p>

            <div className="bg-black border border-red-500 rounded-xl px-6 py-4 inline-block shadow-lg shadow-red-500/20">
              <p className="text-red-400 text-3xl font-extrabold tracking-widest">
                {timeLeft}
              </p>
            </div>
          </div>

        </div>

            <div className="flex gap-4 mt-6">
                <button
                onClick={confirmReservation}
                disabled={
                  !reservation ||
                  reservation.status !== "PENDING"
                }
                className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-200 px-4 py-2 rounded-lg font-semibold shadow-md disabled:opacity-50"
                >
                Confirm Purchase
                </button>

                <button
                onClick={releaseReservation}
                disabled={
                  !reservation ||
                  reservation.status !== "PENDING"
                }
                className="bg-red-600 hover:bg-red-700 hover:scale-105 transition-all duration-200 px-4 py-2 rounded-lg font-semibold shadow-md disabled:opacity-50"
                >
                Cancel Reservation
                </button>
            </div>

            <div className="mt-4">
              <button
                onClick={() => router.push("/")}
                className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200 px-6 py-3 rounded-lg font-semibold shadow-md"
              >
                Back to Inventory
              </button>
            </div>

      </div>

    </main>
  );
}