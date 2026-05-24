import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { productId, warehouseId, quantity } = body;

    const reservation = await prisma.$transaction(async (tx) => {
      // FIND INVENTORY
      const inventory = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId,
          },
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      // AVAILABLE STOCK
      const available =
        inventory.totalStock - inventory.reservedStock;

      // BLOCK IF NO STOCK
      if (available < quantity) {
        throw new Error("Not enough stock available");
      }

      // ATOMIC STOCK UPDATE
      const updatedInventory =
        await tx.inventory.updateMany({
          where: {
            productId,
            warehouseId,
            reservedStock: inventory.reservedStock,
          },
          data: {
            reservedStock: {
              increment: quantity,
            },
          },
        });

      // IF UPDATE FAILED => SOMEONE ELSE RESERVED FIRST
      if (updatedInventory.count === 0) {
        throw new Error("Not enough stock available");
      }

      // CREATE RESERVATION
      return await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "PENDING",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
    });

    return NextResponse.json(reservation);

  } catch (error: unknown) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Not enough stock available"
    ) {
      return NextResponse.json(
        {
          message: "Not enough stock available",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to create reservation",
      },
      { status: 500 }
    );
  }
}