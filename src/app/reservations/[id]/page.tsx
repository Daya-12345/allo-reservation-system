"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

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

            setError("Reservation expired");

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
      <div className="p-10 text-xl">
        Loading reservation...
      </div>
    );
  }

  // CONFIRM
  async function confirmReservation() {

    if (!reservation?.id) {
      setError("Invalid reservation");
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
      setError(data.message);
      return;
    }

    alert(data.message);

    router.push("/");
  }

  // CANCEL / RELEASE
  async function releaseReservation() {

    if (!reservation?.id) {
      setError("Invalid reservation");
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
      setError(data.message);
      return;
    }

    alert(data.message);

    router.push("/");
  }

  return (

    <main className="min-h-screen bg-black text-white p-10">

      <div className="max-w-xl mx-auto bg-zinc-900 p-8 rounded-xl border border-zinc-700">

        <h1 className="text-4xl font-bold mb-6">
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
            <p className="text-zinc-400">
              Status
            </p>

            <p className="text-yellow-400 font-bold">
              {reservation.status}
            </p>
          </div>

          <div>
            <p className="text-zinc-400">
              Time Remaining
            </p>

            <p className="text-red-400 text-2xl font-bold">
              {timeLeft}
            </p>
          </div>

        </div>

            <div className="flex gap-4 mt-6">
                <button
                onClick={confirmReservation}
                disabled={
                  !reservation ||
                  reservation.status !== "PENDING"
                }
                className="bg-green-600 px-4 py-2 rounded disabled:opacity-50"
                >
                Confirm Purchase
                </button>

                <button
                onClick={releaseReservation}
                disabled={
                  !reservation ||
                  reservation.status !== "PENDING"
                }
                className="bg-red-600 px-4 py-2 rounded disabled:opacity-50"
                >
                Cancel Reservation
                </button>
            </div>

            <div className="mt-4">
              <button
                onClick={() => router.push("/")}
                className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded"
              >
                Back to Inventory
              </button>
            </div>

      </div>

    </main>
  );
}